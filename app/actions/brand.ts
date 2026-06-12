"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

async function getBrandIdByAuthUserId(authUserId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("brands")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

export async function getBrandProfile(authUserId: string) {
  const brandSelect = `id, email, company_name, website, industry, logo_url,
      brand_settings ( timezone, preferred_language, secondary_language, currency, country_code, region, city, phone_whatsapp ),
      brand_billing ( billing_legal_name, tax_id, invoice_email, finance_contact_name ),
      brand_shipping ( shipping_from_country, shipping_from_city, shipping_notes_default ),
      brand_content_defaults ( brand_voice_default, mandatory_terms_default, forbidden_terms_default ),
      brand_smtp ( gmail_smtp_user, gmail_smtp_app_password )`;

  const { data: byAuthUserId, error: byAuthUserIdError } = await supabaseAdmin
    .from("brands")
    .select(brandSelect)
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (byAuthUserIdError) {
    throw new Error(byAuthUserIdError.message);
  }
  if (byAuthUserId) {
    const settings = (byAuthUserId as any).brand_settings ?? {};
    const billing = (byAuthUserId as any).brand_billing ?? {};
    const shipping = (byAuthUserId as any).brand_shipping ?? {};
    const contentDefaults = (byAuthUserId as any).brand_content_defaults ?? {};
    const smtp = (byAuthUserId as any).brand_smtp ?? {};

    return {
      ...(byAuthUserId as any),
      timezone: settings.timezone ?? null,
      preferred_language: settings.preferred_language ?? null,
      secondary_language: settings.secondary_language ?? null,
      currency: settings.currency ?? null,
      country_code: settings.country_code ?? null,
      region: settings.region ?? null,
      city: settings.city ?? null,
      phone_whatsapp: settings.phone_whatsapp ?? null,
      billing_legal_name: billing.billing_legal_name ?? null,
      tax_id: billing.tax_id ?? null,
      invoice_email: billing.invoice_email ?? null,
      finance_contact_name: billing.finance_contact_name ?? null,
      shipping_from_country: shipping.shipping_from_country ?? null,
      shipping_from_city: shipping.shipping_from_city ?? null,
      shipping_notes_default: shipping.shipping_notes_default ?? null,
      brand_voice_default: contentDefaults.brand_voice_default ?? null,
      mandatory_terms_default: contentDefaults.mandatory_terms_default ?? null,
      forbidden_terms_default: contentDefaults.forbidden_terms_default ?? null,
      gmail_smtp_user: smtp.gmail_smtp_user ?? null,
      gmail_smtp_app_password: smtp.gmail_smtp_app_password ?? null,
    };
  }

  // Backfill link for older brand rows that were created before auth_user_id mapping.
  const { data: authUser, error: authUserError } =
    await supabaseAdmin.auth.admin.getUserById(authUserId);
  if (authUserError) {
    throw new Error(authUserError.message);
  }
  const email = authUser.user?.email?.toLowerCase().trim();
  if (!email) {
    return null;
  }

  const { data: byEmail, error: byEmailError } = await supabaseAdmin
    .from("brands")
    .select(brandSelect)
    .eq("email", email)
    .is("auth_user_id", null)
    .maybeSingle();

  if (byEmailError) {
    throw new Error(byEmailError.message);
  }
  if (!byEmail) {
    return null;
  }

  const { error: updateError } = await supabaseAdmin
    .from("brands")
    .update({ auth_user_id: authUserId })
    .eq("id", byEmail.id);
  if (updateError) {
    throw new Error(updateError.message);
  }

  const settings = (byEmail as any).brand_settings ?? {};
  const billing = (byEmail as any).brand_billing ?? {};
  const shipping = (byEmail as any).brand_shipping ?? {};
  const contentDefaults = (byEmail as any).brand_content_defaults ?? {};
  const smtp = (byEmail as any).brand_smtp ?? {};

  return {
    ...(byEmail as any),
    auth_user_id: authUserId,
    timezone: settings.timezone ?? null,
    preferred_language: settings.preferred_language ?? null,
    secondary_language: settings.secondary_language ?? null,
    currency: settings.currency ?? null,
    country_code: settings.country_code ?? null,
    region: settings.region ?? null,
    city: settings.city ?? null,
    phone_whatsapp: settings.phone_whatsapp ?? null,
    billing_legal_name: billing.billing_legal_name ?? null,
    tax_id: billing.tax_id ?? null,
    invoice_email: billing.invoice_email ?? null,
    finance_contact_name: billing.finance_contact_name ?? null,
    shipping_from_country: shipping.shipping_from_country ?? null,
    shipping_from_city: shipping.shipping_from_city ?? null,
    shipping_notes_default: shipping.shipping_notes_default ?? null,
    brand_voice_default: contentDefaults.brand_voice_default ?? null,
    mandatory_terms_default: contentDefaults.mandatory_terms_default ?? null,
    forbidden_terms_default: contentDefaults.forbidden_terms_default ?? null,
    gmail_smtp_user: smtp.gmail_smtp_user ?? null,
    gmail_smtp_app_password: smtp.gmail_smtp_app_password ?? null,
  };
}

export async function updateBrandProfile(
  authUserId: string,
  data: {
    company_name?: string;
    logo_url?: string | null;
    city?: string | null;
    preferred_language?: string | null;
    currency?: string | null;
    phone_whatsapp?: string | null;
  }
) {
  const brandId = await getBrandIdByAuthUserId(authUserId);
  if (!brandId) throw new Error("Brand profile not found.");

  const { city, preferred_language, currency, phone_whatsapp, ...brandPatch } = data;
  const { error: brandError } = await supabaseAdmin
    .from("brands")
    .update(brandPatch)
    .eq("id", brandId);
  if (brandError) throw new Error(brandError.message);

  const { error: settingsError } = await supabaseAdmin
    .from("brand_settings")
    .upsert(
      {
        brand_id: brandId,
        city: city ?? null,
        preferred_language: preferred_language ?? null,
        currency: currency ?? null,
        phone_whatsapp: phone_whatsapp ?? null,
      },
      { onConflict: "brand_id" },
    );
  if (settingsError) throw new Error(settingsError.message);
  return true;
}

export async function updateBrandCompany(
  authUserId: string,
  data: {
    industry?: string | null;
    website?: string | null;
    city?: string | null;
    preferred_language?: string | null;
    currency?: string | null;
    phone_whatsapp?: string | null;
  }
) {
  const brandId = await getBrandIdByAuthUserId(authUserId);
  if (!brandId) throw new Error("Brand profile not found.");

  const { city, preferred_language, currency, phone_whatsapp, ...brandPatch } = data;
  const { error: brandError } = await supabaseAdmin
    .from("brands")
    .update(brandPatch)
    .eq("id", brandId);
  if (brandError) throw new Error(brandError.message);

  const { error: settingsError } = await supabaseAdmin
    .from("brand_settings")
    .upsert(
      {
        brand_id: brandId,
        city: city ?? null,
        preferred_language: preferred_language ?? null,
        currency: currency ?? null,
        phone_whatsapp: phone_whatsapp ?? null,
      },
      { onConflict: "brand_id" },
    );
  if (settingsError) throw new Error(settingsError.message);
  return true;
}

export async function updateBrandDefaults(
  authUserId: string,
  data: {
    country_code?: string | null;
    region?: string | null;
    city?: string | null;
    timezone?: string | null;
    preferred_language?: string | null;
    secondary_language?: string | null;
    currency?: string | null;
    phone_whatsapp?: string | null;
    billing_legal_name?: string | null;
    tax_id?: string | null;
    invoice_email?: string | null;
    finance_contact_name?: string | null;
    shipping_from_country?: string | null;
    shipping_from_city?: string | null;
    shipping_notes_default?: string | null;
    brand_voice_default?: string | null;
    mandatory_terms_default?: string | null;
    forbidden_terms_default?: string | null;
  }
) {
  const brandId = await getBrandIdByAuthUserId(authUserId);
  if (!brandId) throw new Error("Brand profile not found.");

  const {
    country_code,
    region,
    city,
    timezone,
    preferred_language,
    secondary_language,
    currency,
    phone_whatsapp,
    billing_legal_name,
    tax_id,
    invoice_email,
    finance_contact_name,
    shipping_from_country,
    shipping_from_city,
    shipping_notes_default,
    brand_voice_default,
    mandatory_terms_default,
    forbidden_terms_default,
  } = data;

  const { error: settingsError } = await supabaseAdmin
    .from("brand_settings")
    .upsert(
      {
        brand_id: brandId,
        country_code: country_code ?? null,
        region: region ?? null,
        city: city ?? null,
        timezone: timezone ?? null,
        preferred_language: preferred_language ?? null,
        secondary_language: secondary_language ?? null,
        currency: currency ?? null,
        phone_whatsapp: phone_whatsapp ?? null,
      },
      { onConflict: "brand_id" },
    );
  if (settingsError) throw new Error(settingsError.message);

  const { error: billingError } = await supabaseAdmin
    .from("brand_billing")
    .upsert(
      {
        brand_id: brandId,
        billing_legal_name: billing_legal_name ?? null,
        tax_id: tax_id ?? null,
        invoice_email: invoice_email ?? null,
        finance_contact_name: finance_contact_name ?? null,
      },
      { onConflict: "brand_id" },
    );
  if (billingError) throw new Error(billingError.message);

  const { error: shippingError } = await supabaseAdmin
    .from("brand_shipping")
    .upsert(
      {
        brand_id: brandId,
        shipping_from_country: shipping_from_country ?? null,
        shipping_from_city: shipping_from_city ?? null,
        shipping_notes_default: shipping_notes_default ?? null,
      },
      { onConflict: "brand_id" },
    );
  if (shippingError) throw new Error(shippingError.message);

  const { error: defaultsError } = await supabaseAdmin
    .from("brand_content_defaults")
    .upsert(
      {
        brand_id: brandId,
        brand_voice_default: brand_voice_default ?? null,
        mandatory_terms_default: mandatory_terms_default ?? null,
        forbidden_terms_default: forbidden_terms_default ?? null,
      },
      { onConflict: "brand_id" },
    );
  if (defaultsError) throw new Error(defaultsError.message);

  return true;
}

export async function updateBrandOutreach(
  authUserId: string,
  appPassword: string | null
) {
  const brandId = await getBrandIdByAuthUserId(authUserId);
  if (!brandId) throw new Error("Brand profile not found.");

  const { error } = await supabaseAdmin
    .from("brand_smtp")
    .upsert(
      { brand_id: brandId, gmail_smtp_app_password: appPassword },
      { onConflict: "brand_id" },
    );

  if (error) {
    throw new Error(error.message);
  }
  return true;
}
