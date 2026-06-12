"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import type { CampaignWithStats } from "@/lib/queries/campaigns.client";
import { CampaignsView } from "./CampaignsView";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";

// ─── Main Page ────────────────────────────────────────────────────────
export default function CampaignsPage() {
  const { userId, isLoaded } = useSupabaseUser();

  const [campaigns, setCampaigns] = useState<CampaignWithStats[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [stats, setStats] = useState({
    engagedInfluencers: 0,
    emailsSent: 0,
    responseRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    if (!isLoaded || !userId) return;
    (async () => {
      const {
        getBrandCampaigns,
        getCampaignDashboardStats,
        getCampaignActivity,
      } = await import("@/lib/queries/campaigns");

      const [camps, dashStats, acts] = await Promise.all([
        getBrandCampaigns(userId),
        getCampaignDashboardStats(userId),
        getCampaignActivity(userId, 20),
      ]);

      setCampaigns(camps);
      setStats(dashStats);
      setActivity(acts);
    })().finally(() => setIsLoading(false));
  }, [isLoaded, userId]);

  const handleCampaignDeleted = useCallback((id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-[#1a1aff]/60" />
          <p className="text-sm text-gray-400">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <CampaignsView
      campaigns={campaigns}
      activity={activity}
      stats={stats}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onDeleteCampaign={handleCampaignDeleted}
      authUserId={userId ?? ""}
    />
  );
}
