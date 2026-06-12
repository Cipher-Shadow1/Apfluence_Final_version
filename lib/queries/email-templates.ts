import { createClient } from '@/lib/supabase/client';

export interface EmailTemplate {
  id: string;
  brand_id: string;
  name: string;
  subject: string | null;
  body: string | null;
  created_at: string;
}

export async function getBrandEmailTemplates(brandId: string): Promise<EmailTemplate[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('brand_email_templates')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching brand email templates:', error);
    return [];
  }
  return data || [];
}

export async function saveBrandEmailTemplate(
  brandId: string,
  name: string,
  subject: string | null,
  body: string | null
): Promise<EmailTemplate | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('brand_email_templates')
    .insert([{ brand_id: brandId, name, subject, body }])
    .select()
    .single();

  if (error) {
    console.error('Error saving brand email template:', error);
    return null;
  }
  return data;
}

export async function deleteBrandEmailTemplate(templateId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('brand_email_templates')
    .delete()
    .eq('id', templateId);

  if (error) {
    console.error('Error deleting brand email template:', error);
    return false;
  }
  return true;
}
