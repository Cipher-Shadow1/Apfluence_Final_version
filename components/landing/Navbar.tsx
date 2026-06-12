"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ── Dropdown content data ──────────────────────────────────────────────────
// ... (omitted for brevity in replacement, but I will include the whole block if needed)
const dropdownData: Record<string, { heading: string; items: string[] }[]> = {
  Features: [
    {
      heading: "Campaign Management",
      items: [
        "Campaign Builder",
        "AI Co-pilot",
        "Analytics Dashboard",
        "ROI Tracker",
      ],
    },
    {
      heading: "Creator Tools",
      items: [
        "Influencer Discovery",
        "Audience Analysis",
        "Brand Match Score",
        "Contract Manager",
      ],
    },
  ],
  "Use Cases": [
    {
      heading: "By Goal",
      items: [
        "Brand Awareness",
        "Product Launches",
        "User Generated Content",
        "Affiliate Marketing",
      ],
    },
    {
      heading: "By Team",
      items: ["Marketing Teams", "Agencies", "E-commerce Brands", "Startups"],
    },
  ],
  "Creator Marketplace": [
    {
      heading: "Discover",
      items: [
        "Browse Creators",
        "Top Niches",
        "Rising Talent",
        "Verified Creators",
      ],
    },
    {
      heading: "Manage",
      items: [
        "My Campaigns",
        "Saved Creators",
        "Outreach Hub",
        "Payment History",
      ],
    },
  ],
  "Free tools": [
    {
      heading: "Instagram tools",
      items: [
        "Fake Follower Checker",
        "Instagram Audit Tool",
        "Instagram Engagement Tool",
        "Find Instagram Creators",
        "Instagram follower count",
        "Compare Instagram Influencers",
        "Insta Pricing",
      ],
    },
    {
      heading: "TikTok tools",
      items: [
        "TikTok Audit Tool",
        "TikTok Engagement Checker",
        "Find TikTok Creators",
        "TikTok follower count",
        "Compare TikTok Influencers",
      ],
    },
    {
      heading: "Twitter/X tools",
      items: [
        "Twitter Audit Tool",
        "Twitter Engagement Checker",
        "Find Twitter/X Creators",
        "X/Twitter follower count",
        "Compare X/Twitter Influencers",
      ],
    },
    {
      heading: "YouTube tools",
      items: [
        "YouTube Audit Tool",
        "YouTube Engagement Checker",
        "Find YouTube Creators",
        "YouTube subscriber count",
        "Compare YouTube Influencers",
      ],
    },
    {
      heading: "Pinterest tools",
      items: [
        "Pinterest Audit Tool",
        "Find Pinterest Creators",
        "Pinterest follower count",
        "Compare Pinterest Influencers",
      ],
    },
    {
      heading: "E-commerce tools",
      items: ["CPM Calculator", "FBA Calculator", "Time Saving Calculator"],
    },
  ],
  Resources: [
    {
      heading: "Learn",
      items: ["Blog", "Case Studies", "Guides & Ebooks", "Webinars"],
    },
    {
      heading: "Support",
      items: ["Help Center", "API Docs", "Community", "Contact Us"],
    },
  ],
};

// ── Dropdown panel ─────────────────────────────────────────────────────────
function DropdownPanel({ label }: { label: string }) {
  const sections = dropdownData[label];
  if (!sections) return null;

  const isFreeTools = label === "Free tools";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[200] p-6"
      style={{ minWidth: isFreeTools ? 880 : 420 }}
    >
      {/* little arrow */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />

      <div
        className="grid gap-x-8 gap-y-1"
        style={{
          gridTemplateColumns: `repeat(${Math.min(sections.length, isFreeTools ? 3 : 2)}, 1fr)`,
        }}
      >
        {sections.map((section) => (
          <div key={section.heading} className="mb-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {section.heading}
            </p>
            {section.items.map((item) => (
              <a
                key={item}
                href="/this-is-a-test"
                className="block py-1 text-[13px] text-gray-700 hover:text-[var(--color-primary)] transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Nav item with hover dropdown ───────────────────────────────────────────
function NavItem({
  label,
  hasDropdown,
}: {
  label: string;
  hasDropdown: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  };
  const hide = () => {
    timerRef.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return (
    <div ref={ref} className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button className="flex items-center gap-1 text-[14px] font-medium text-white/90 hover:text-white transition-colors py-1">
        <span>{label}</span>
        {hasDropdown && (
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-[10px] h-[10px]" />
          </motion.span>
        )}
      </button>

      {hasDropdown && (
        <AnimatePresence>
          {open && <DropdownPanel label={label} />}
        </AnimatePresence>
      )}
    </div>
  );
}

// ── Main Navbar ────────────────────────────────────────────────────────────
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { label: "Features", hasDropdown: true },
    { label: "Use Cases", hasDropdown: true },
    { label: "Creator Marketplace", hasDropdown: true },
    { label: "Pricing", hasDropdown: false },
    { label: "Free tools", hasDropdown: true },
    { label: "Resources", hasDropdown: true },
  ];

  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-[100]"
      style={{ background: "linear-gradient(135deg, var(--color-primary), #1212C8)" }}
    >
      {/* Main bar */}
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-6 lg:px-10">
        {/* Logo */}
        <div
          className="text-white font-black text-[22px]"
          style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
        >
          <span
            className="text-white font-black text-[20px] relative z-10"
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            <Image src="/logo.svg" alt="Apfluence" width={160} height={40} className="h-10 w-auto" priority />
          </span>
        </div>

        {/* Center Navigation */}
        <div className="hidden lg:flex items-center gap-7">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              label={item.label}
              hasDropdown={item.hasDropdown}
            />
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-6">
          <button
            onClick={() => router.push("/sign-in/influencer")}
            className="text-[14px] font-medium text-white/90 hover:text-white transition-opacity"
          >
            For Creators
          </button>
          <button
            onClick={() => router.push("/sign-in/brand")}
            className="text-[14px] font-medium text-white/90 hover:text-white transition-opacity"
          >
            For Brands
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/sign-in/brand")}
            className="px-5 py-2.5 bg-[var(--color-primary-cta)] text-white text-[14px] font-semibold rounded-lg hover:bg-[var(--color-primary-hover-alt)] transition-colors"
          >
            Get Started
          </motion.button>
        </div>

        {/* Mobile: CTA + Hamburger */}
        <div className="flex lg:hidden items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/sign-in/brand")}
            className="px-4 py-2 bg-[var(--color-primary-cta)] text-white text-[13px] font-semibold rounded-lg"
          >
            Get Started
          </motion.button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white p-1"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-t border-white/10"
            style={{ background: "linear-gradient(135deg, var(--color-primary), #1212C8)" }}
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className="flex items-center justify-between py-3 px-2 text-[15px] font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <span>{item.label}</span>
                  {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                </button>
              ))}
              <div className="border-t border-white/15 mt-2 pt-3 flex flex-col gap-2">
                <button
                  onClick={() => router.push("/sign-in/influencer")}
                  className="py-2.5 px-2 text-[15px] font-medium text-white/90 hover:text-white text-left hover:bg-white/10 rounded-lg transition-all"
                >
                  For Creators
                </button>
                <button
                  onClick={() => router.push("/sign-in/brand")}
                  className="py-2.5 px-2 text-[15px] font-medium text-white/90 hover:text-white text-left hover:bg-white/10 rounded-lg transition-all"
                >
                  For Brands
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
