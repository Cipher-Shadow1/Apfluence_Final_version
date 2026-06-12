"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";

export function Header() {
  const router = useRouter();
  const supabase = createClient();
  const { firstName } = useSupabaseUser();

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
      <h1 className="text-sm font-semibold text-slate-900">
        Influencer Workspace
      </h1>
      <div className="flex items-center gap-3">
        <p className="text-xs text-slate-500">
          {firstName ? `Hi, ${firstName}` : "Manage your creator dashboard"}
        </p>
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/sign-in/influencer");
          }}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
