"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, ChevronDown, LogOut, Settings } from "lucide-react";
import ListsDropdown from "@/components/brand/lists/ListsDropdown";
import BrandProfileModal from "@/components/brand/profile/BrandProfileModal";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";

interface BrandList {
  id: string;
  name: string;
  color: string | null;
  influencer_count: number;
  created_at: string;
}

export const Header = () => {
  const [fallbackTab, setFallbackTab] = useState("Find creators");
  const [lists, setLists] = useState<BrandList[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string | null>(null);

  const { userId, firstName } = useSupabaseUser();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // Sync active tab with current route
  const activeTab = useMemo(() => {
    if (pathname === "/brand/selected") return "Selected";
    if (pathname === "/brand" || pathname === "/brand/discovery") return "Find creators";
    return fallbackTab;
  }, [pathname, fallbackTab]);

  const tabs = [
    { label: "Find creators", badge: null },
    { label: "Selected", badge: selectedCount, badgeColor: "bg-[var(--color-success)]" },
    { label: "Rejected", badge: 0 },
    { label: "Suggested", badge: 0 },
  ];

  const fetchBrandProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const { getBrandProfile } = await import("@/app/actions/brand");
      const data = await getBrandProfile(userId);
      
      if (data) {
        setBrandLogo(data.logo_url);
        setBrandName(data.company_name);
      }
    } catch (err) {
      console.error("Failed to fetch brand profile", err);
    }
  }, [userId]);

  // Fetch brand lists on mount (for dropdown + selected count)
  useEffect(() => {
    if (!userId) return;

    const fetchLists = async () => {
      try {
        const { getBrandLists } = await import("@/lib/queries/lists.client");
        const data = await getBrandLists(userId);
        setLists(data);

        // Calculate total influencers across all lists for "Selected" badge
        const total = data.reduce(
          (sum: number, l: BrandList) => sum + (l.influencer_count ?? 0),
          0
        );
        setSelectedCount(total);
      } catch (err) {
        console.error("Failed to fetch brand lists:", err);
      }
    };

    void fetchLists();
    void fetchBrandProfile();
  }, [userId, fetchBrandProfile]);

  const handleTabClick = (label: string) => {
    switch (label) {
      case "Selected":
        router.push("/brand/selected");
        break;
      case "Find creators":
        router.push("/brand");
        break;
      default:
        // Other tabs — keep tab highlight behavior for now
        setFallbackTab(label);
    }
  };

  return (
    <header className="h-[52px] bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-14 z-50">
      {/* Lists dropdown */}
      <ListsDropdown
        lists={lists}
        authUserId={userId ?? ""}
        onListsChange={setLists}
      />

      <nav className="flex items-center gap-8 h-full">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleTabClick(tab.label)}
            className={`relative h-full flex items-center gap-2 text-[14px] font-medium transition-colors ${
              activeTab === tab.label
                ? "text-[var(--color-text-link)]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.badge !== null && (
              <span
                className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] text-white ${tab.badgeColor || "bg-gray-200 text-gray-500"}`}
              >
                {tab.badge}
              </span>
            )}
            {activeTab === tab.label && (
              <motion.div
                layoutId="header-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-text-link)]"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-gray-700 hover:text-gray-900 cursor-pointer">
          <BookOpen className="w-4 h-4" />
          <span className="text-[14px] font-medium">Learn</span>
        </div>

        {/* Profile Dropdown Container */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl
                       hover:bg-gray-100 transition-colors group"
          >
            {brandLogo ? (
              <img
                src={brandLogo}
                alt={brandName || ""}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#2b2ef8]/10
                              flex items-center justify-center">
                <span className="text-xs font-bold text-[#2b2ef8]">
                  {(brandName || firstName || "BR").slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 hidden md:block">
              {brandName || firstName || "Account"}
            </span>
            <ChevronDown
              size={14}
              className={`text-gray-400 hidden md:block transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                >
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    <Settings size={16} className="text-gray-400" />
                    Manage Account
                  </button>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      void supabase.auth.signOut();
                      router.push("/");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} className="text-red-400" />
                    Log out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Brand Profile Modal */}
      <BrandProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          void fetchBrandProfile(); // Refresh logo and name after closing the modal
        }}
      />
    </header>
  );
};
