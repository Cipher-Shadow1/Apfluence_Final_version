"use client";

import {
  DollarSign,
  Package,
  ArrowRight,
  Check,
  Users,
  Truck,
  Megaphone,
  CreditCard,
  FileCheck2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWizard } from "@/components/brand/campaigns/wizard/CampaignWizardContext";
import { FaBullhorn } from "react-icons/fa6";

function CardImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-full rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      <div className="w-full aspect-[355/138] overflow-hidden flex items-center justify-center">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>
    </div>
  );
}

type CampaignTypeKey = "paid" | "paid_with_product";

function Stars({ value }: { value: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "text-[12px] leading-none",
            i < value ? "text-amber-400" : "text-gray-200",
          )}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function StageItem({
  icon: Icon,
  title,
  description,
  color,
  isLast,
}: {
  icon: any;
  title: string;
  description: string;
  color: string;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      <div className="relative">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center border"
          style={{ background: `${color}14`, borderColor: `${color}33` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        {!isLast && (
          <div className="absolute left-1/2 top-10 -translate-x-1/2 w-px h-[34px] bg-[#E5E7EB]" />
        )}
      </div>
      <div className="flex-1 -mt-0.5">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-0.5 text-xs text-[#6B7280] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function Step1Page() {
  const { campaignType, setCampaignType, canGoNext, goNext, goBack } =
    useWizard();
  const selected = campaignType as CampaignTypeKey | null;
  const canConfigure = Boolean(selected) && canGoNext();

  const stageSets: Record<
    CampaignTypeKey,
    Array<{
      icon: any;
      title: string;
      description: string;
      color: string;
    }>
  > = {
    paid: [
      {
        icon: Users,
        title: "Invite influencers",
        description: "Identify and invite the best creators to collaborate",
        color: "#1a1aff",
      },
      {
        icon: FileCheck2,
        title: "Review influencer drafts",
        description: "Approve posts to ensure brand safety",
        color: "#06B6D4",
      },
      {
        icon: FaBullhorn,
        title: "Share publication instructions",
        description: "Ensure your campaign is executed correctly",
        color: "#10B981",
      },
      {
        icon: CreditCard,
        title: "Send payments",
        description: "Easily issue secure influencer payments",
        color: "#F59E0B",
      },
    ],
    paid_with_product: [
      {
        icon: Users,
        title: "Invite influencers",
        description: "Identify and invite the best creators to collaborate",
        color: "#1a1aff",
      },
      {
        icon: Truck,
        title: "Send product",
        description: "Import and ship your products in one click",
        color: "#F59E0B",
      },
      {
        icon: FaBullhorn,
        title: "Share publication instructions",
        description: "Ensure your campaign is executed correctly",
        color: "#10B981",
      },
      {
        icon: CreditCard,
        title: "Send payments",
        description: "Optionally add a flat fee and pay creators securely",
        color: "#06B6D4",
      },
    ],
  };

  const configCopy: Record<
    CampaignTypeKey,
    {
      title: string;
      description: string;
      metrics: { reply: string; creators: string; rating: 1 | 2 | 3 | 4 | 5 };
    }
  > = {
    paid: {
      title: "Paid promotion",
      description: "Payment in exchange for posts.",
      metrics: { reply: "12% – 28%", creators: "Micro to mid", rating: 4 },
    },
    paid_with_product: {
      title: "Paid promotion with gifting",
      description: "Product and payment for posts.",
      metrics: { reply: "5% – 15%", creators: "Large to celebrity", rating: 5 },
    },
  };

  const [hovered, setHovered] = (
    require("react") as typeof import("react")
  ).useState<CampaignTypeKey | null>(null);

  return (
    <div className="grid grid-cols-12 flex-1">
      {/* Left: title and two cards */}
      <div className="col-span-12 lg:col-span-8 pr-0 lg:pr-8 flex flex-col">
        <div className="mb-6">
          <h2 className="text-[18px] font-bold text-gray-900">
            Select a campaign type
          </h2>
          <p className="mt-1 text-[13px] text-[#6B7280] max-w-3xl">
            A campaign type can be anything from product seeding to a paid
            collaboration. Select one to start working with creators.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:flex-wrap gap-5">
          {(
            [
              {
                key: "paid" as const,
                title: "Paid promotion",
                description: "Payment in exchange for posts.",
                tags: ["Full control", "High reply rate"],
                icon: DollarSign,
                imageSrc: "/paid.png",
              },
              {
                key: "paid_with_product" as const,
                title: "Paid promotion with gifting",
                description: "Product and payment for posts.",
                tags: ["Product gifting", "Optional flat fee"],
                icon: Package,
                imageSrc: "/paid_with_gif.png",
              },
            ] as const
          ).map((card) => {
            const isSelected = selected === card.key;
            const isHovered = hovered === card.key;
            const Icon = card.icon;

            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setCampaignType(card.key)}
                onMouseEnter={() => setHovered(card.key)}
                onMouseLeave={() =>
                  setHovered((prev) => (prev === card.key ? null : prev))
                }
                className={cn(
                  "relative text-left group rounded-xl border bg-white",
                  // shrink ~1.5x vs previous sizing
                  // make cards a bit bigger (taller/wider feel)
                  "p-5 flex flex-col min-h-[220px] w-full md:w-[355px] max-w-full",
                  "transition-all duration-200 ease-out",
                  isSelected
                    ? "border-[#1a1aff] bg-[#EEF2FF]/35"
                    : "border-[#E5E7EB] hover:border-[#1a1aff] hover:shadow-[0_10px_26px_rgba(17,24,39,0.10)]",
                )}
              >
                {/* Image Container */}
                <div
                  className={cn(
                    "w-full overflow-hidden transition-all duration-300 ease-in-out origin-top",
                    isHovered
                      ? "max-h-0 opacity-0 mb-0 scale-y-90 pointer-events-none border-transparent"
                      : "max-h-[160px] opacity-100 mb-3 scale-y-100 border border-[#E5E7EB] rounded-xl bg-white",
                  )}
                >
                  <div className="w-full aspect-[355/138] flex items-center justify-center">
                    <img
                      src={card.imageSrc}
                      alt={card.title}
                      className="w-full h-full object-contain pointer-events-none"
                      draggable={false}
                    />
                  </div>
                </div>



                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900">
                      {card.title}
                    </p>
                    <p className="mt-1 text-[12px] text-[#6B7280]">
                      {card.description}
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#1a1aff]">
                    <Icon size={15} />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {card.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EEF2FF] text-[#1a1aff]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Metrics Container */}
                <div
                  className={cn(
                    "w-full overflow-hidden transition-all duration-300 ease-in-out",
                    isHovered
                      ? "max-h-[160px] opacity-100 mt-auto pt-4 border-t border-[#EEF2FF]"
                      : "max-h-0 opacity-0 mt-0 pt-0 pointer-events-none border-transparent",
                  )}
                >
                  <div className="grid grid-cols-3 gap-3 text-left">
                    <div>
                      <p className="text-[10px] text-[#6B7280]">
                        Positive reply rate
                      </p>
                      <p className="mt-1 text-[11px] font-semibold text-gray-900">
                        {configCopy[card.key].metrics.reply}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6B7280]">
                        Typical creators
                      </p>
                      <p className="mt-1 text-[11px] font-semibold text-gray-900">
                        {configCopy[card.key].metrics.creators}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6B7280]">
                        Efficiency rating
                      </p>
                      <div className="mt-1">
                        <Stars value={configCopy[card.key].metrics.rating} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected check */}
                {isSelected && (
                  <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-[#1a1aff] text-white flex items-center justify-center shadow-sm">
                    <Check size={14} />
                  </div>
                )}

                {/* Arrow */}
                <div className="mt-auto pt-3 flex justify-end text-[#9CA3AF] group-hover:text-[#1a1aff] transition-colors">
                  <ArrowRight size={16} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: sidebar panel (white full-height) */}
      <div className="col-span-12 lg:col-span-4 mt-6 lg:mt-0 lg:-my-8 lg:-mr-6 lg:bg-white lg:px-8 lg:py-8 relative border-t lg:border-t-0 border-[#E5E7EB]">
        <div className="hidden lg:block absolute inset-y-0 left-0 w-px bg-[#E5E7EB]" />

        {/* Integrated sidebar (no card container) */}
        <div className="sticky top-6 h-[calc(78vh-3rem)] flex flex-col overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[16px] font-bold text-gray-900">
                {selected
                  ? configCopy[selected].title
                  : "Select a campaign type"}
              </p>
              <p className="mt-1 text-[12px] text-[#6B7280]">
                {selected
                  ? configCopy[selected].description
                  : "Choose a template and configure your campaign"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col flex-1">
            <p className="text-[12px] font-semibold text-gray-900">
              Campaign stages
            </p>

            <div className="mt-4 space-y-4">
              {(selected
                ? stageSets[selected]
                : stageSets.paid_with_product
              ).map((s, idx, arr) => (
                <StageItem
                  key={s.title}
                  icon={s.icon}
                  title={s.title}
                  description={s.description}
                  color={s.color}
                  isLast={idx === arr.length - 1}
                />
              ))}
            </div>

            {/* Next Step Action */}
            <div className="mt-auto pt-6 pb-4">
              <button
                type="button"
                disabled={!canConfigure}
                onClick={goNext}
                className={cn(
                  "w-full inline-flex items-center justify-center gap-2",
                  "px-6 py-3 rounded-xl text-[14px] font-semibold",
                  "transition-colors",
                  !canConfigure
                    ? "bg-[#F3F4F6] text-gray-400 cursor-not-allowed"
                    : "bg-[#1a1aff] hover:bg-[#1a1aff] text-white",
                )}
              >
                Configure my campaign
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
