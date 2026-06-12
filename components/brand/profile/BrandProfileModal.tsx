"use client";

import { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "motion/react";
import { X, User, Building2, Mail, Shield, Loader2 } from "lucide-react";
import { getBrandProfile } from "@/app/actions/brand";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";

import type { BrandData } from "./types";
import { ProfileTab } from "./tabs/ProfileTab";
import { CompanyTab } from "./tabs/CompanyTab";
import { OutreachTab } from "./tabs/OutreachTab";
import { SecurityTab } from "./tabs/SecurityTab";

type Section = "profile" | "company" | "outreach" | "security";

interface BrandProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BrandProfileModal({
  isOpen,
  onClose,
}: BrandProfileModalProps) {
  const { userId, isLoaded } = useSupabaseUser();
  const [activeSection, setActiveSection] = useState<Section>("profile");

  // Brand data from Supabase
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [isLoadingBrand, setIsLoadingBrand] = useState(false);

  // Load brand data when modal opens
  useEffect(() => {
    if (!isOpen || !userId) return;
    setIsLoadingBrand(true);

    const loadBrand = async () => {
      try {
        const data = await getBrandProfile(userId);
        setBrandData(data as BrandData);
      } catch (err) {
        console.error("Failed to load brand profile", err);
      } finally {
        setIsLoadingBrand(false);
      }
    };

    loadBrand();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const sidebarItems = [
    { id: "profile", label: "Brand Profile", icon: User },
    { id: "company", label: "Company details", icon: Building2 },
    { id: "outreach", label: "Email Outreach", icon: Mail },
    { id: "security", label: "Security", icon: Shield },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <LazyMotion features={domAnimation}>
          {/* Overlay */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="w-full max-w-[800px] h-[600px] bg-white rounded-2xl shadow-xl flex overflow-hidden pointer-events-auto"
            >
              {/* Sidebar */}
              <div className="w-[240px] bg-gray-50/50 border-r border-gray-100 flex flex-col">
                <div className="p-6">
                  <h2 className="text-base font-bold text-gray-900">
                    Settings
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage your brand profile
                  </p>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                  {sidebarItems.map((item) => {
                    const isActive = activeSection === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as Section)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-white text-[#2b2ef8] shadow-sm shadow-[#2b2ef8]/5"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <Icon
                          size={16}
                          className={
                            isActive ? "text-[#2b2ef8]" : "text-gray-400"
                          }
                        />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
                {/* Header */}
                <div className="h-16 flex items-center justify-end px-6 border-b border-gray-100 flex-shrink-0">
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-8 max-w-2xl">
                    {!isLoaded || isLoadingBrand ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2
                          size={20}
                          className="animate-spin text-[#2b2ef8]"
                        />
                      </div>
                    ) : brandData ? (
                      <>
                        {activeSection === "profile" && (
                          <ProfileTab
                            authUserId={userId ?? ""}
                            initialData={brandData}
                            onUpdate={(newData) =>
                              setBrandData((prev) =>
                                prev ? { ...prev, ...newData } : prev,
                              )
                            }
                          />
                        )}
                        {activeSection === "company" && (
                          <CompanyTab
                            authUserId={userId ?? ""}
                            initialData={brandData}
                            onUpdate={(newData) =>
                              setBrandData((prev) =>
                                prev ? { ...prev, ...newData } : prev,
                              )
                            }
                          />
                        )}
                        {activeSection === "outreach" && (
                          <OutreachTab
                            authUserId={userId ?? ""}
                            initialData={brandData}
                            onUpdate={(newData) =>
                              setBrandData((prev) =>
                                prev ? { ...prev, ...newData } : prev,
                              )
                            }
                          />
                        )}
                        {activeSection === "security" && <SecurityTab />}
                      </>
                    ) : (
                      <div className="text-center py-12 text-sm text-gray-500">
                        Failed to load profile data.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </m.div>
          </div>
        </LazyMotion>
      )}
    </AnimatePresence>
  );
}
