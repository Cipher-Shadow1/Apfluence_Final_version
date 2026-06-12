"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CampaignWizardProvider,
  useWizard,
  TOTAL_STEPS,
} from "@/components/brand/campaigns/wizard/CampaignWizardContext";
import { getBrandLists } from "@/lib/queries/lists.client";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";

// ── Extract current step from pathname ─────────────────────────────────
function getStepFromPath(pathname: string): number {
  const match = pathname.match(/step-(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

// ── Stepper ────────────────────────────────────────────────────────────
function Stepper({ current }: { current: number }) {
  const steps = [
    { label: "Type" },
    { label: "Information" },
    { label: "Compensation" },
    { label: "Documents" },
    { label: "Email settings" },
    { label: "Finalize" },
  ] as const;

  const active = "#1a1aff";
  const line = "#E5E7EB";
  const ring = "#D1D5DB";
  const muted = "#6B7280";

  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        {steps.map((s, i) => {
          const step = i + 1;
          const isCompleted = step < current;
          const isActive = step === current;

          return (
            <div key={s.label} className="flex items-center min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  className="shrink-0"
                  aria-hidden="true"
                >
                  {isCompleted ? (
                    <>
                      <circle cx="11" cy="11" r="10" fill="#10B981" />
                      <path
                        d="M6.2 11.3l3 3.1 6.7-7"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  ) : isActive ? (
                    <>
                      <circle cx="11" cy="11" r="10" fill={active} />
                      <text
                        x="11"
                        y="14.2"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="700"
                        fill="white"
                        fontFamily="Inter, ui-sans-serif, system-ui"
                      >
                        {step}
                      </text>
                    </>
                  ) : (
                    <>
                      <circle
                        cx="11"
                        cy="11"
                        r="9.5"
                        fill="white"
                        stroke={ring}
                      />
                      <text
                        x="11"
                        y="14.2"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="#9CA3AF"
                        fontFamily="Inter, ui-sans-serif, system-ui"
                      >
                        {step}
                      </text>
                    </>
                  )}
                </svg>

                <span
                  className={cn(
                    "text-xs whitespace-nowrap",
                    isActive
                      ? "font-semibold text-[#1a1aff]"
                      : "font-medium text-[#6B7280]",
                  )}
                >
                  {s.label}
                  {"optional" in s && s.optional ? (
                    <span className="text-gray-400"> (optional)</span>
                  ) : null}
                </span>
              </div>

              {i < steps.length - 1 && (
                <div className="mx-3 h-px w-8 bg-[#E5E7EB] shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Bottom Nav ─────────────────────────────────────────────────────────
function WizardFooter() {
  const { currentStep, goNext, goBack, canGoNext, isCreating, handleCreate } =
    useWizard();

  if (currentStep === 1) return null;

  const primaryLabel =
    currentStep === 1
      ? "Configure my campaign"
      : currentStep < TOTAL_STEPS
        ? "Continue"
        : "Create Campaign";

  return (
    <div className="border-t border-[#E5E7EB] bg-white px-8 py-4 flex items-center justify-between">
      <button
        type="button"
        onClick={goBack}
        className={cn(
          "text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors",
        )}
      >
        {currentStep === 1 ? (
          "Cancel"
        ) : (
          <span className="inline-flex items-center gap-2">
            <ChevronLeft size={16} />
            Back
          </span>
        )}
      </button>

      <button
        type="button"
        disabled={!canGoNext() || isCreating}
        onClick={() => {
          if (currentStep < TOTAL_STEPS) goNext();
          else handleCreate();
        }}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "px-6 py-2.5 rounded-xl text-sm font-semibold",
          "transition-colors",
          !canGoNext() || isCreating
            ? "bg-[#F3F4F6] text-gray-400 cursor-not-allowed"
            : "bg-[#1a1aff] hover:bg-[#1a1aff] text-white",
        )}
      >
        {isCreating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Creating...
          </>
        ) : (
          <span className="inline-flex items-center gap-2">
            {primaryLabel}
            {currentStep < TOTAL_STEPS ? (
              <ChevronRight size={16} />
            ) : (
              <Check size={16} />
            )}
          </span>
        )}
      </button>
    </div>
  );
}

// ── Lists loader ───────────────────────────────────────────────────────
function ListsLoader() {
  const { setLists } = useWizard();
  const { userId, isLoaded } = useSupabaseUser();

  useEffect(() => {
    if (!isLoaded || !userId) return;
    getBrandLists(userId).then(setLists).catch(console.error);
  }, [isLoaded, userId, setLists]);

  return null;
}

// ── Inner layout (needs context) ───────────────────────────────────────
function WizardInner({ children }: { children: React.ReactNode }) {
  const { error } = useWizard();
  const { name, coverEmoji, coverColor } = useWizard();
  const pathname = usePathname();
  const current = getStepFromPath(pathname);

  const campaignTitle = name?.trim() ? name.trim() : "New campaign";

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen flex flex-col bg-white">
        {/* ── Fixed wizard shell (matches screenshot) ─────────── */}
        <div className="border-b border-gray-100">
          <div className="w-full px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-[20px] font-bold text-gray-900">Campaigns</h1>
              <Link
                href="/brand/campaigns"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={16} />
                Back
              </Link>
            </div>

            {/* Wizard header (avatar + name) */}
            <div className="mt-5 flex items-center gap-3">
              <p className="text-[14px] font-semibold text-gray-900">
                {campaignTitle}
              </p>
            </div>

            {/* Stepper */}
            <div className="mt-4 pb-3">
              <Stepper current={current} />
            </div>
          </div>
        </div>

        {/* ── Content area (changes per step) ─────────────────── */}
        <div className="flex-1 overflow-y-auto bg-[#f7f7f7] flex flex-col">
          <div
            className={cn(
              "w-full px-6 flex-1 flex flex-col",
              current === 1 ? "py-0" : "py-8",
            )}
          >
            <m.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              {children}
            </m.div>

            {error && (
              <m.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm text-red-500 text-center font-medium"
              >
                {error}
              </m.p>
            )}
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <WizardFooter />

        {/* ── Background loaders ─────────────────────────────── */}
        <ListsLoader />
      </div>
    </LazyMotion>
  );
}

// ── Exported layout ────────────────────────────────────────────────────
export default function CreateCampaignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentStep = getStepFromPath(pathname);

  return (
    <CampaignWizardProvider currentStep={currentStep}>
      <WizardInner>{children}</WizardInner>
    </CampaignWizardProvider>
  );
}
