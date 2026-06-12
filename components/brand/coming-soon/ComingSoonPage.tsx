"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const FloatingIconsLayer = dynamic(
  () => import("./FloatingIconsLayer"),
  {
    ssr: false,
    loading: () => null,
  },
);

export interface FloatingIcon {
  icon: LucideIcon;
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  animateX: number;
  animateY: number;
  duration: number;
  rotate?: number;
}

export interface ComingSoonPageProps {
  pageName: string;
  tagline: string;
  description: string;
  mainIcon: LucideIcon;
  mainIconColor: string;
  accentColor: string;
  accentColorLight: string;
  /** Tailwind gradient stop classes, e.g. `from-blue-50` */
  gradientFrom: string;
  /** Tailwind gradient stop classes, e.g. `to-indigo-100` */
  gradientTo: string;
  floatingIcons: FloatingIcon[];
  badge?: string;
  features?: string[];
  /** Apfluence mark above the badge (sidebar-style tile) */
  showBrandLogo?: boolean;
  /** 0–100; progress bar fill and footer line match this value */
  completionPercent: number;
  /** When set, shown in the hero tile instead of mainIcon (e.g. custom PNG artwork) */
  mainImage?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

const instant = { duration: 0, delay: 0 } as const;

export default function ComingSoonPage({
  pageName,
  tagline,
  description,
  mainIcon: MainIcon,
  mainIconColor,
  accentColor,
  accentColorLight,
  gradientFrom,
  gradientTo,
  floatingIcons,
  badge,
  features,
  showBrandLogo = false,
  completionPercent,
  mainImage,
}: ComingSoonPageProps) {
  const [mounted, setMounted] = useState(false);
  const progress = Math.min(100, Math.max(0, Math.round(completionPercent)));
  const progressWidth = `${progress}%`;

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const run = () => {
      document.documentElement.classList.add("framer-motion-ready");
      setMounted(true);
    };

    if (typeof requestIdleCallback !== "undefined") {
      idleId = requestIdleCallback(run, { timeout: 200 });
    } else {
      timeoutId = setTimeout(run, 0);
    }

    return () => {
      document.documentElement.classList.remove("framer-motion-ready");
      if (idleId !== undefined) {
        cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        className={cn(
          "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-linear-to-br px-6",
          gradientFrom,
          gradientTo,
        )}
      >
        <FloatingIconsLayer icons={floatingIcons} />

        {/* Decorative blurred blob */}
        <m.div
          className="pointer-events-none absolute h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: accentColor }}
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main card: boot = visible without motion cost; run = full stagger after idle */}
        <m.div
          key={mounted ? "run" : "boot"}
          className={cn(
            "coming-soon-card relative z-10 flex max-w-lg flex-col items-center text-center",
          )}
          initial={mounted ? { opacity: 0, y: 40 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={mounted ? { duration: 0.7, ease: "easeOut" } : instant}
        >
          {showBrandLogo ? (
            <m.div
              className="mb-5 flex justify-center"
              initial={mounted ? { opacity: 0, y: -16, scale: 0.92 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={
                mounted
                  ? { delay: 0.08, type: "spring", stiffness: 260, damping: 20 }
                  : instant
              }
            >
              <m.div
                className="flex h-14 w-14 items-center justify-center rounded-2xl p-2 shadow-lg ring-1 ring-black/6"
                style={{ background: accentColorLight }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/logo%20blue%20gradient.svg"
                  alt="Apfluence"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain object-center"
                  priority
                />
              </m.div>
            </m.div>
          ) : null}

          {badge ? (
            <m.div
              className="mb-6 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{ background: accentColorLight, color: accentColor }}
              initial={mounted ? { opacity: 0, scale: 0.8 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={mounted ? { delay: 0.2 } : instant}
            >
              {badge}
            </m.div>
          ) : null}

          <m.div
            className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center"
            initial={mounted ? { scale: 0 } : false}
            animate={{ scale: 1 }}
            transition={
              mounted
                ? { delay: 0.3, type: "spring", stiffness: 200 }
                : instant
            }
          >
            <m.div
              className="absolute inset-0 rounded-full"
              style={{ background: accentColorLight }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
            />
            <div
              className="relative flex h-28 w-28 items-center justify-center rounded-3xl shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${mainIconColor})`,
              }}
            >
              {mainImage ? (
                <Image
                  src={mainImage.src}
                  alt={mainImage.alt}
                  width={mainImage.width ?? 56}
                  height={mainImage.height ?? 56}
                  className="h-[52px] w-[52px] object-contain object-center drop-shadow-md"
                  priority
                />
              ) : (
                <MainIcon size={52} color="white" strokeWidth={1.5} />
              )}
            </div>
          </m.div>

          <m.h1
            className="mb-3 text-5xl font-black tracking-tight text-gray-900"
            initial={mounted ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={mounted ? { delay: 0.4 } : instant}
          >
            {pageName}
          </m.h1>

          <m.p
            className="mb-4 text-xl font-semibold"
            style={{ color: accentColor }}
            initial={mounted ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={mounted ? { delay: 0.5 } : instant}
          >
            {tagline}
          </m.p>

          <m.p
            className="mb-8 max-w-sm text-base leading-relaxed text-gray-500"
            initial={mounted ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={mounted ? { delay: 0.6 } : instant}
          >
            {description}
          </m.p>

          {features && features.length > 0 ? (
            <m.div
              className="mb-8 w-full rounded-2xl p-5 text-left"
              style={{ background: accentColorLight }}
              initial={mounted ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={mounted ? { delay: 0.7 } : instant}
            >
              <p
                className="mb-3 text-xs font-bold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                What&apos;s coming
              </p>
              <ul className="space-y-2">
                {features.map((f, i) => (
                  <m.li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-700"
                    initial={mounted ? { opacity: 0, x: -10 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={
                      mounted ? { delay: 0.8 + i * 0.08 } : instant
                    }
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: accentColor }}
                    />
                    {f}
                  </m.li>
                ))}
              </ul>
            </m.div>
          ) : null}

          <m.div
            className="mb-3 h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: accentColorLight }}
            initial={mounted ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={mounted ? { delay: 0.9 } : instant}
          >
            <m.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${accentColor}, ${mainIconColor})`,
              }}
              initial={mounted ? { width: "0%" } : false}
              animate={{ width: progressWidth }}
              transition={
                mounted ? { delay: 1, duration: 1.5, ease: "easeOut" } : instant
              }
            />
          </m.div>
          <m.p
            className="text-xs text-gray-400"
            initial={mounted ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={mounted ? { delay: 1.2 } : instant}
          >
            {progress}% complete — launching soon
          </m.p>
        </m.div>
      </div>
    </LazyMotion>
  );
}
