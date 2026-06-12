import { BrandHomeClient } from "@/components/brand/BrandHomeClient";
import { createClient } from "@/lib/supabase/server";

export default async function BrandHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim();
  const firstName = fullName?.split(/\s+/)[0] || "there";

  return <BrandHomeClient firstName={firstName} />;
}
