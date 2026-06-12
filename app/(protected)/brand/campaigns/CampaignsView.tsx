"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Users,
  Mail,
  TrendingUp,
  LayoutList,
  LayoutGrid,
  Eye,
  Trash2,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Loader2,
  Activity,
  ChevronRight,
  Calendar,
  Zap,
  DollarSign,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CampaignWithStats } from "@/lib/queries/campaigns.client";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-amber-50 text-amber-600", icon: Clock },
  active: { label: "Active", color: "bg-green-50 text-green-700", icon: Zap },
  paused: {
    label: "Paused",
    color: "bg-gray-100 text-gray-500",
    icon: AlertCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-blue-50 text-blue-600",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-500",
    icon: XCircle,
  },
} as const;
type CampaignStatusKey = keyof typeof STATUS_CONFIG;

function getStatusConfig(status: unknown) {
  if (
    typeof status === "string" &&
    Object.prototype.hasOwnProperty.call(STATUS_CONFIG, status)
  ) {
    return STATUS_CONFIG[status as CampaignStatusKey];
  }
  return STATUS_CONFIG.draft;
}

const TYPE_CONFIG = {
  paid: { label: "Paid", color: "bg-blue-50 text-blue-600", icon: DollarSign },
  paid_with_product: {
    label: "Paid + Product",
    color: "bg-blue-50 text-blue-600",
    icon: Package,
  },
} as const;

const ACTIVITY_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  campaign_created: {
    icon: Megaphone,
    color: "text-[#1a1aff]",
    bg: "bg-[#EEF2FF]",
  },
  email_sent: { icon: Send, color: "text-blue-600", bg: "bg-blue-50" },
  response_received: {
    icon: Mail,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  influencer_accepted: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  influencer_declined: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  influencer_countered: {
    icon: TrendingUp,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  campaign_launched: { icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
          color,
        )}
      >
        <Icon size={20} className="opacity-90" />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 leading-none mb-0.5">
          {value}
        </p>
        <p className="text-xs font-medium text-gray-400">{label}</p>
      </div>
    </m.div>
  );
}

function CampaignRow({
  campaign,
  onDelete,
  delay,
  authUserId,
}: {
  campaign: CampaignWithStats;
  onDelete: (id: string) => void;
  delay: number;
  authUserId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const status = getStatusConfig(campaign.status);
  const type =
    TYPE_CONFIG[campaign.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.paid;
  const targetCountries =
    (campaign as any)?.campaign_matching_config?.target_countries ??
    (campaign as any)?.target_countries ??
    [];
  const StatusIcon = status.icon;
  const TypeIcon = type.icon;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${campaign.name}"?`)) return;
    setIsDeleting(true);
    const { deleteCampaign } = await import("@/lib/queries/campaigns");
    await deleteCampaign(authUserId, campaign.id);
    onDelete(campaign.id);
  };

  return (
    <m.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ delay, duration: 0.2 }}
      onClick={() => router.push(`/brand/campaigns/${campaign.id}`)}
      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer group border-b border-gray-50 last:border-0"
    >
      {campaign.logo_url ? (
        <img
          src={campaign.logo_url}
          alt={campaign.name}
          className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0 border border-gray-100"
        />
      ) : (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm"
          style={{ background: campaign.cover_color ?? "#6366F1" }}
        >
          {campaign.cover_emoji ?? "🎯"}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{campaign.name}</p>
        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
          <Calendar size={10} />
          {new Date(campaign.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {campaign.campaign_goal && (
            <span className="px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#1a1aff] text-[10px] font-semibold">
              {campaign.campaign_goal}
            </span>
          )}
          {campaign.campaign_language && (
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">
              {campaign.campaign_language}
            </span>
          )}
          {!!targetCountries?.length && (
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">
              {targetCountries[0]}
              {targetCountries.length > 1
                ? ` +${targetCountries.length - 1}`
                : ""}
            </span>
          )}
        </div>
      </div>

      <span
        className={cn(
          "hidden lg:flex items-center gap-1 px-2.5 py-1",
          "rounded-full text-xs font-semibold",
          type.color,
        )}
      >
        <TypeIcon size={10} />
        {type.label}
      </span>

      <span
        className={cn(
          "flex items-center gap-1 px-2.5 py-1",
          "rounded-full text-xs font-semibold",
          status.color,
        )}
      >
        <StatusIcon size={10} />
        {status.label}
      </span>

      <div className="hidden md:flex items-center gap-5 text-sm">
        <div className="text-center min-w-[40px]">
          <p className="font-bold text-gray-800">{campaign.creators_count}</p>
          <p className="text-xs text-gray-400">Creators</p>
        </div>
        <div className="text-center min-w-[40px]">
          <p className="font-bold text-gray-800">{campaign.engaged_count}</p>
          <p className="text-xs text-gray-400">Engaged</p>
        </div>
        <div className="text-center min-w-[40px]">
          <p className="font-bold text-gray-800">{campaign.response_rate}%</p>
          <p className="text-xs text-gray-400">Response</p>
        </div>
      </div>

      <div
        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => router.push(`/brand/campaigns/${campaign.id}`)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          title="View campaign"
        >
          <Eye size={14} />
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete"
        >
          {isDeleting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>
    </m.div>
  );
}

function CampaignCard({
  campaign,
  onDelete,
  delay,
  authUserId,
}: {
  campaign: CampaignWithStats;
  onDelete: (id: string) => void;
  delay: number;
  authUserId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const status = getStatusConfig(campaign.status);
  const type =
    TYPE_CONFIG[campaign.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.paid;
  const targetCountries =
    (campaign as any)?.campaign_matching_config?.target_countries ??
    (campaign as any)?.target_countries ??
    [];
  const StatusIcon = status.icon;
  const TypeIcon = type.icon;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${campaign.name}"?`)) return;
    setIsDeleting(true);
    const { deleteCampaign } = await import("@/lib/queries/campaigns");
    await deleteCampaign(authUserId, campaign.id);
    onDelete(campaign.id);
  };

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay, duration: 0.2 }}
      onClick={() => router.push(`/brand/campaigns/${campaign.id}`)}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        {campaign.logo_url ? (
          <img
            src={campaign.logo_url}
            alt={campaign.name}
            className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-gray-100"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
            style={{ background: campaign.cover_color ?? "#6366F1" }}
          >
            {campaign.cover_emoji ?? "🎯"}
          </div>
        )}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => router.push(`/brand/campaigns/${campaign.id}`)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="View campaign"
          >
            <Eye size={13} />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            {isDeleting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
          </button>
        </div>
      </div>

      <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{campaign.name}</h3>
      <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
        <Calendar size={10} />
        {new Date(campaign.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>

      <div className="flex gap-1.5 mb-3 flex-wrap">
        {campaign.campaign_goal && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#1a1aff]">
            {campaign.campaign_goal}
          </span>
        )}
        {campaign.campaign_language && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            {campaign.campaign_language}
          </span>
        )}
        {!!targetCountries?.length && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            {targetCountries[0]}
            {targetCountries.length > 1
              ? ` +${targetCountries.length - 1}`
              : ""}
          </span>
        )}
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1",
            "rounded-full text-xs font-semibold",
            type.color,
          )}
        >
          <TypeIcon size={10} />
          {type.label}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1",
            "rounded-full text-xs font-semibold",
            status.color,
          )}
        >
          <StatusIcon size={10} />
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Creators", value: campaign.creators_count },
          { label: "Engaged", value: campaign.engaged_count },
          { label: "Response", value: `${campaign.response_rate}%` },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-50 rounded-xl p-2 text-center">
            <p className="text-sm font-bold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </m.div>
  );
}

type CampaignsViewProps = {
  campaigns: CampaignWithStats[];
  activity: any[];
  stats: {
    engagedInfluencers: number;
    emailsSent: number;
    responseRate: number;
  };
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  onDeleteCampaign: (id: string) => void;
  authUserId: string;
};

export function CampaignsView({
  campaigns,
  activity,
  stats,
  viewMode,
  onViewModeChange,
  onDeleteCampaign,
  authUserId,
}: CampaignsViewProps) {
  const router = useRouter();

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Megaphone size={20} className="text-[#1a1aff]" />
            <h1 className="text-xl font-black text-gray-900">Campaigns</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#EEF2FF] text-[#1a1aff] ml-1">
              {campaigns.length}
            </span>
          </div>
          <button
            onClick={() => router.push("/brand/campaigns/create/step-1")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1aff] hover:bg-[#1a1aff]/90 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={16} />
            New Campaign
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard
              icon={Users}
              label="Engaged Influencers"
              value={stats.engagedInfluencers}
              color="bg-blue-50 text-blue-500"
              delay={0}
            />
            <StatCard
              icon={Mail}
              label="Emails Sent"
              value={stats.emailsSent}
              color="bg-blue-50 text-blue-500"
              delay={0.05}
            />
            <StatCard
              icon={TrendingUp}
              label="Response Rate"
              value={`${stats.responseRate}%`}
              color="bg-green-50 text-green-500"
              delay={0.1}
            />
          </div>

          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <Megaphone size={15} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">Campaigns</span>
                    <span className="text-xs text-gray-400">({campaigns.length})</span>
                  </div>
                  <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
                    <button
                      onClick={() => onViewModeChange("list")}
                      className={cn(
                        "p-1.5 rounded-md transition-all",
                        viewMode === "list"
                          ? "bg-white shadow-sm text-[#1a1aff]"
                          : "text-gray-400 hover:text-gray-600",
                      )}
                    >
                      <LayoutList size={15} />
                    </button>
                    <button
                      onClick={() => onViewModeChange("grid")}
                      className={cn(
                        "p-1.5 rounded-md transition-all",
                        viewMode === "grid"
                          ? "bg-white shadow-sm text-[#1a1aff]"
                          : "text-gray-400 hover:text-gray-600",
                      )}
                    >
                      <LayoutGrid size={15} />
                    </button>
                  </div>
                </div>

                {campaigns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <m.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mb-4"
                    >
                      <Megaphone size={28} className="text-[#1a1aff]/40" />
                    </m.div>
                    <p className="text-gray-700 font-semibold mb-1">No campaigns yet</p>
                    <p className="text-sm text-gray-400 mb-6 max-w-xs">
                      Create your first campaign to start reaching out to influencers
                      at scale
                    </p>
                    <button
                      onClick={() => router.push("/brand/campaigns/create/step-1")}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a1aff] hover:bg-[#1a1aff]/90 text-white text-sm font-semibold transition-colors shadow-sm"
                    >
                      <Plus size={15} /> Create First Campaign
                    </button>
                  </div>
                ) : viewMode === "list" ? (
                  <AnimatePresence mode="popLayout">
                    {campaigns.map((c, i) => (
                      <CampaignRow
                        key={c.id}
                        campaign={c}
                        onDelete={onDeleteCampaign}
                        delay={i * 0.04}
                        authUserId={authUserId}
                      />
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                      {campaigns.map((c, i) => (
                        <CampaignCard
                          key={c.id}
                          campaign={c}
                          onDelete={onDeleteCampaign}
                          delay={i * 0.04}
                          authUserId={authUserId}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

            <div className="w-80 shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <Activity size={15} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">Activity Feed</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>

                <div className="max-h-[520px] overflow-y-auto">
                  {activity.length === 0 ? (
                    <div className="flex flex-col items-center py-10 text-center px-4">
                      <Activity size={24} className="text-gray-200 mb-3" />
                      <p className="text-sm text-gray-400">
                        No activity yet. Create a campaign to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {activity.map((event, i) => {
                        const activityKey =
                          event.id ??
                          `${event.created_at ?? "no-date"}-${event.type ?? "no-type"}-${event.title ?? "no-title"}-${i}`;
                        const cfg = ACTIVITY_CONFIG[event.type] ?? {
                          icon: Activity,
                          color: "text-gray-500",
                          bg: "bg-gray-50",
                        };
                        const Icon = cfg.icon;
                        return (
                          <m.div
                            key={activityKey}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer group"
                          >
                            <div
                              className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center",
                                "shrink-0 mt-0.5",
                                cfg.bg,
                              )}
                            >
                              <Icon size={14} className={cfg.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-800 leading-snug">
                                {event.title}
                              </p>
                              {event.description && (
                                <p className="text-xs text-gray-400 mt-0.5 truncate">
                                  {event.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-300 mt-1">
                                {timeAgo(event.created_at)}
                              </p>
                            </div>
                            <ChevronRight
                              size={13}
                              className="text-gray-200 group-hover:text-gray-400 shrink-0 mt-1 transition-colors"
                            />
                          </m.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}
