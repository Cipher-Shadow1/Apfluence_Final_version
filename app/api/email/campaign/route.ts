import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export interface CampaignEmailPayload {
  emails: Array<{
    to:           string   // influencer email
    subject:      string   // resolved subject (no variables)
    body:         string   // resolved body (no variables)
    influencerId: string
    campaignInfluencerId: string
  }>
  campaignId: string
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const authUserId = user?.id
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload: CampaignEmailPayload = await req.json()

    if (!payload.emails?.length) {
      return NextResponse.json({ error: 'No emails provided' }, { status: 400 })
    }

    // 1. Get brand id + SMTP credentials
    const { data: brandData, error: fetchError } = await supabaseAdmin
      .from('brands')
      .select(`
        id,
        company_name,
        brand_smtp ( gmail_smtp_user, gmail_smtp_app_password )
      `)
      .eq('auth_user_id', authUserId)
      .single()

    if (fetchError || !brandData) {
      console.error('campaign email route fetch:', fetchError)
      return NextResponse.json({ error: 'Could not fetch brand data.' }, { status: 400 })
    }

    const brandId = (brandData as any).id
    const smtp = (brandData as any).brand_smtp ?? null
    const gmailUser = (smtp?.gmail_smtp_user as string | null) ?? null
    const appPassword = (smtp?.gmail_smtp_app_password as string | null) ?? null
    const companyName = (brandData as any).company_name as string

    if (!gmailUser || !appPassword) {
      return NextResponse.json({ 
        error: 'SMTP not configured. Please add your Gmail credentials in Settings → Email Outreach.' 
      }, { status: 400 })
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

    // 2.5 Verify connection
    try {
      await transporter.verify()
    } catch (verifyError: any) {
      console.error('SMTP verification failed:', verifyError)
      return NextResponse.json({ 
        error: 'Invalid SMTP credentials. Please update your App Password.',
        authFailed: true
      }, { status: 401 })
    }

    // 3. Check daily sending limit (max 20 per day)
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const { count, error: countError } = await supabaseAdmin
      .from('campaign_activity')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId)
      .eq('type', 'outreach_email_sent')
      .gte('created_at', startOfToday.toISOString())

    const todayCount = count ?? 0
    const remaining = Math.max(0, 20 - todayCount)

    if (remaining === 0) {
      return NextResponse.json({ 
        error: 'Daily limit of 20 emails reached. Please try again tomorrow.' 
      }, { status: 429 })
    }

    const trimmedEmails = payload.emails.slice(0, remaining)

    const results: Array<{
      influencerId: string
      success: boolean
      error?: string
    }> = []

    // ── Send each email individually ────────────────────────────────
    for (const emailJob of trimmedEmails) {
      if (!emailJob.to) {
        results.push({
          influencerId: emailJob.influencerId,
          success: false,
          error: 'No email address',
        })
        continue
      }

      try {
        // Fetch the unique token for this campaign-influencer pair
        const { data: ciRow } = await supabaseAdmin
          .from('campaign_influencers')
          .select('token, status')
          .eq('id', emailJob.campaignInfluencerId)
          .single()

        // Resolve {{application_link}} and {{draft_link}} server-side
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const applicationLink = ciRow?.token
          ? `${appUrl}/apply/${ciRow.token}`
          : '[application_link_missing]'
        const draftLink = ciRow?.token
          ? `${appUrl}/draft/${ciRow.token}`
          : '[draft_link_missing]'

        const resolvedBody = emailJob.body
          .replace(/\{\{application_link\}\}/g, applicationLink)
          .replace(/\{\{draft_link\}\}/g, draftLink)
        const resolvedSubject = emailJob.subject
          .replace(/\{\{application_link\}\}/g, applicationLink)
          .replace(/\{\{draft_link\}\}/g, draftLink)

        await transporter.sendMail({
          from: `"${companyName}" <${gmailUser}>`,
          to: emailJob.to,
          subject: resolvedSubject,
          html: resolvedBody,
        })

        // Initial outreach: move pending → email_sent. Pipeline emails (accepted, shipped, …)
        // must not overwrite workflow status.
        const invitedEmail = emailJob.to.trim().toLowerCase()
        if (ciRow?.status === 'pending') {
          await supabaseAdmin
            .from('campaign_influencers')
            .update({
              status: 'email_sent',
              email_sent_at: new Date().toISOString(),
              invited_email: invitedEmail,
            })
            .eq('id', emailJob.campaignInfluencerId)
        } else {
          await supabaseAdmin
            .from('campaign_influencers')
            .update({ invited_email: invitedEmail })
            .eq('id', emailJob.campaignInfluencerId)
        }

        // Log the action
        await supabaseAdmin.from('campaign_activity').insert({
          brand_id: brandId,
          campaign_id: payload.campaignId,
          type: 'outreach_email_sent',
          title: 'Campaign outreach sent',
          description: `Sent outreach email to ${emailJob.to}`,
          meta: {
            toEmail: emailJob.to,
            subject: emailJob.subject,
            influencer_id: emailJob.influencerId,
            token: ciRow?.token,
          },
        })

        results.push({ influencerId: emailJob.influencerId, success: true })
      } catch (err: any) {
        results.push({
          influencerId: emailJob.influencerId,
          success: false,
          error: err.message,
        })
      }
      
      // Delay before the next email to prevent SMTP rate-limiting
      await sleep(3500)
    }

    const successCount = results.filter(r => r.success).length
    const failCount    = results.filter(r => !r.success).length

    return NextResponse.json({ results, successCount, failCount })
  } catch (err: any) {
    console.error('campaign email route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
