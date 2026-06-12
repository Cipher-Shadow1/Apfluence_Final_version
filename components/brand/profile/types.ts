export interface BrandData {
  id: string;
  email: string;
  company_name: string;
  website: string | null;
  industry: string | null;
  logo_url: string | null;
  gmail_smtp_user: string | null;
  gmail_smtp_app_password: string | null;
  country_code: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  preferred_language: string | null;
  secondary_language: string | null;
  currency: string | null;
  phone_whatsapp: string | null;
  billing_legal_name: string | null;
  tax_id: string | null;
  invoice_email: string | null;
  finance_contact_name: string | null;
  shipping_from_country: string | null;
  shipping_from_city: string | null;
  shipping_notes_default: string | null;
  brand_voice_default: string | null;
  mandatory_terms_default: string | null;
  forbidden_terms_default: string | null;
}
