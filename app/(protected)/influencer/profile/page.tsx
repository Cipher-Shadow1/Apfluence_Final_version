"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getInfluencerWithDetailsByUserId } from "@/lib/queries/influencers";
import type { NormalizedInfluencer } from "@/components/brand/sidepanel/influencer-side-panel.types";
import { InfluencerPublicProfileView } from "@/components/influencer/InfluencerPublicProfileView";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";

export default function InfluencerProfilePage() {
  const { userId, isLoaded } = useSupabaseUser();
  const [influencer, setInfluencer] = useState<NormalizedInfluencer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    void (async () => {
      const data = await getInfluencerWithDetailsByUserId(userId);
      setInfluencer(data);
      setIsLoading(false);
    })();
  }, [isLoaded, userId]);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2b2ef8]" />
      </div>
    );
  }

  if (!influencer) {
    return (
      <section className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">No profile linked</h2>
        <p className="mt-2 text-sm text-slate-600">
          We couldn&apos;t find a creator profile tied to your account yet. After your
          profile is created in our system, your brand preview will show here.
        </p>
        <Link
          href="/influencer/settings"
          className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Open settings
        </Link>
      </section>
    );
  }

  return <InfluencerPublicProfileView influencer={influencer} />;
}
