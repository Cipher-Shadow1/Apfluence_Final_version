import { redirect } from "next/navigation";
import { Sidebar } from "@/components/brand/Sidebar";
import MobileBlocker from "@/components/brand/MobileBlocker";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function BrandLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  // Not logged in → brand sign-in
  if (!userId) {
    redirect("/sign-in/brand");
  }

  let role = user?.user_metadata?.role as string | undefined;
  if (!role) {
    const { data: brand } = await supabaseAdmin
      .from("brands")
      .select("id")
      .eq("auth_user_id", userId)
      .maybeSingle();
    if (brand?.id) role = "brand";
  }

  // No role yet → send to sign-up to complete registration
  if (!role) {
    redirect("/sign-up/brand");
  }

  // Wrong role → redirect to their correct dashboard
  if (role === "influencer") {
    redirect("/influencer");
  }

  // role === "brand" → allow through
  return (
    <>
      <MobileBlocker />
      <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 relative pl-14 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}
