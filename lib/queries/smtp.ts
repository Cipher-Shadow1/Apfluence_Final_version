'use server'

import { supabaseAdmin } from '@/lib/supabase-admin'
import nodemailer from 'nodemailer'

// ─── Get brand_id from auth_user_id ───────────────────────────────────
async function getBrandId(authUserId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('brands')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single()
  return data?.id ?? null
}

// ─── Get Gmail SMTP settings (safe for client consumption) ───────────
// Returns the gmail address and whether a password is stored.
// NEVER returns the raw app password to the client.
export async function getGmailSmtpSettings(
  authUserId: string
): Promise<{ gmailUser: string | null; hasPassword: boolean }> {
  const brandId = await getBrandId(authUserId)
  if (!brandId) return { gmailUser: null, hasPassword: false }

  const { data, error } = await supabaseAdmin
    .from('brand_smtp')
    .select('gmail_smtp_user, gmail_smtp_app_password')
    .eq('brand_id', brandId)
    .maybeSingle()

  if (error) {
    console.error('getGmailSmtpSettings:', error)
    return { gmailUser: null, hasPassword: false }
  }
  if (!data) return { gmailUser: null, hasPassword: false }

  return {
    gmailUser: (data as any).gmail_smtp_user ?? null,
    hasPassword: !!(data as any).gmail_smtp_app_password,
  }
}

// ─── Save Gmail SMTP settings ────────────────────────────────────────
// Upserts gmail_smtp_user and gmail_smtp_app_password into brand_smtp.
// If appPassword is empty, only the gmail address is updated (preserves existing password).
export async function saveGmailSmtpSettings(
  authUserId: string,
  gmailUser: string,
  appPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const brandId = await getBrandId(authUserId)
    if (!brandId) {
      return { success: false, error: 'Brand not found for this account.' }
    }

    // Build the update payload — only include password if provided
    const updatePayload: Record<string, string> = {
      gmail_smtp_user: gmailUser,
    }

    if (appPassword.trim().length > 0) {
      updatePayload.gmail_smtp_app_password = appPassword.trim()
    }

    const { error } = await supabaseAdmin
      .from('brand_smtp')
      .upsert({ brand_id: brandId, ...updatePayload }, { onConflict: 'brand_id' })

    if (error) {
      console.error('saveGmailSmtpSettings:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('saveGmailSmtpSettings exception:', err)
    return { success: false, error: err.message ?? 'Unknown error' }
  }
}

// ─── Save Gmail App Password Only ────────────────────────────────────
// Sets the gmail_smtp_app_password and uses the brand's email as the gmail_smtp_user
export async function saveGmailAppPasswordOnly(
  authUserId: string,
  appPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: brand, error: brandError } = await supabaseAdmin
      .from('brands')
      .select('id, email')
      .eq('auth_user_id', authUserId)
      .single()

    if (brandError || !brand) {
      return { success: false, error: 'Brand not found for this account.' }
    }

    const { data: smtp } = await supabaseAdmin
      .from('brand_smtp')
      .select('gmail_smtp_user')
      .eq('brand_id', brand.id)
      .maybeSingle()

    // If gmail_smtp_user is empty, use the brand's registered email
    const updatePayload: Record<string, string> = {
      gmail_smtp_app_password: appPassword.trim(),
    }

    if (!smtp?.gmail_smtp_user) {
      updatePayload.gmail_smtp_user = brand.email
    }

    const { error } = await supabaseAdmin
      .from('brand_smtp')
      .upsert({ brand_id: brand.id, ...updatePayload }, { onConflict: 'brand_id' })

    if (error) {
      console.error('saveGmailAppPasswordOnly:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('saveGmailAppPasswordOnly exception:', err)
    return { success: false, error: err.message ?? 'Unknown error' }
  }
}

// ─── Send outreach email via Gmail SMTP ──────────────────────────────
// Fetches the brand's SMTP credentials, sends the email via nodemailer,
// and logs the action to campaign_activity.
export async function sendOutreachEmail(payload: {
  authUserId: string
  toEmail: string
  toName: string
  subject: string
  body: string
}): Promise<{ success: boolean; error?: string; authFailed?: boolean }> {
  try {
    // 1. Get brand id + SMTP credentials
    const brandId = await getBrandId(payload.authUserId)
    if (!brandId) {
      return { success: false, error: 'Brand not found for this account.' }
    }

    const { data: brandData, error: fetchBrandError } = await supabaseAdmin
      .from('brands')
      .select('company_name')
      .eq('id', brandId)
      .single()
    const { data: smtpData, error: fetchSmtpError } = await supabaseAdmin
      .from('brand_smtp')
      .select('gmail_smtp_user, gmail_smtp_app_password')
      .eq('brand_id', brandId)
      .maybeSingle()

    if (fetchBrandError || !brandData) {
      console.error('sendOutreachEmail fetch brand:', fetchBrandError)
      return { success: false, error: 'Could not fetch brand data.' }
    }
    if (fetchSmtpError) {
      console.error('sendOutreachEmail fetch smtp:', fetchSmtpError)
      return { success: false, error: 'Could not fetch brand data.' }
    }

    const gmailUser = (smtpData as any)?.gmail_smtp_user as string | null
    const appPassword = (smtpData as any)?.gmail_smtp_app_password as string | null
    const companyName = (brandData as any).company_name as string

    if (!gmailUser || !appPassword) {
      return {
        success: false,
        error: 'SMTP not configured. Please add your Gmail credentials in Settings → Email Outreach.',
        authFailed: true
      }
    }

    // 2. Create nodemailer transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: appPassword,
      },
    })

    try {
      await transporter.verify()
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError)
      return {
        success: false,
        error: 'Invalid SMTP credentials. Please update your App Password.',
        authFailed: true
      }
    }

    // 3. Send the email
    await transporter.sendMail({
      from: `"${companyName}" <${gmailUser}>`,
      to: `"${payload.toName}" <${payload.toEmail}>`,
      subject: payload.subject,
      html: payload.body,
    })

    // 4. Log the action to campaign_activity
    await supabaseAdmin.from('campaign_activity').insert({
      brand_id: brandId,
      type: 'outreach_email_sent',
      title: 'Outreach email sent',
      description: `Sent outreach email to ${payload.toName} (${payload.toEmail})`,
      meta: {
        toEmail: payload.toEmail,
        toName: payload.toName,
        subject: payload.subject,
      },
    })

    return { success: true }
  } catch (err: any) {
    console.error('sendOutreachEmail exception:', err)
    return {
      success: false,
      error: err.message ?? 'Failed to send email. Check your SMTP credentials.',
    }
  }
}
