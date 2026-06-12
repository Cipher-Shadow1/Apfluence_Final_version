import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import InfluencerHeader from "@/components/influencer/InfluencerHeader";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";



export default async function InfluencerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  // Not logged in → influencer sign-in
  if (!userId) {
    redirect("/sign-in/influencer");
  }

  let role = user?.user_metadata?.role as string | undefined;
  if (!role) {
    const { data: influencer } = await supabaseAdmin
      .from("influencers")
      .select("id")
      .eq("auth_user_id", userId)
      .maybeSingle();
    if (influencer?.id) role = "influencer";
  }

  // No role yet → send to sign-up to complete registration
  if (!role) {
    redirect("/sign-up/influencer");
  }

  // Wrong role → redirect to their correct dashboard
  if (role === "brand") {
    redirect("/brand");
  }

  // role === "influencer" → allow through
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <div className="flex-1">
          <InfluencerHeader />
          <main className="pt-16 px-8 pb-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
