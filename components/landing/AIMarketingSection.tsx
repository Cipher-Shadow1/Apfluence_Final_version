"use client";

import { useState } from "react";
import { Sparkles, User, Zap } from "lucide-react";
import { AnimatedGradientCard } from "../ui/AnimatedGradientCard";
import Image from "next/image";

export default function AIMarketingSection() {
  const [activeTab, setActiveTab] = useState("ai-campaigns");

  const tabs = [
    {
      id: "ai-campaigns",
      label: "AI-Powered Campaigns",
      icon: Sparkles,
    },
    {
      id: "creator-selection",
      label: "Intelligent Creator Selection",
      icon: User,
    },
    {
      id: "automated-outreach",
      label: "Automated Creator Outreach",
      icon: Zap,
    },
  ];

  return (
    <section className="w-full bg-white py-12 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-5 md:px-10 lg:px-20">
        {/* Headline */}
        <h2
          className="font-manrope text-center mx-auto"
          style={{
            fontSize: "clamp(32px, 5vw, 64px)",
            fontWeight: 800,
            color: "#0F1629",
            lineHeight: 1.2,
            letterSpacing: "-0.025em",
            marginBottom: "32px",
            maxWidth: "700px",
          }}
        >
          AI-Powered
          <br />
          Influencer Marketing
        </h2>

        {/* Tab Switcher */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 lg:mb-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full transition-all duration-200"
                style={{
                  background: isActive ? "#FFFFFF" : "transparent",
                  border: isActive ? "1.5px solid var(--color-primary)" : "none",
                  fontSize: "12px",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--color-primary)" : "var(--color-text-faint)",
                  boxShadow: isActive
                    ? "0 2px 8px rgba(43, 46, 248, 0.15)"
                    : "none",
                }}
              >
                <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">
                  {tab.label.split(" ").slice(0, 2).join(" ")}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Feature Card — responsive layout */}
        <div
          className="relative overflow-hidden mx-auto"
          style={{
            maxWidth: "1100px",
            borderRadius: "24px",
            background:
              "linear-gradient(135deg, #3B42F5 0%, #2525F5 40%, #1515CC 100%)",
          }}
        >
          <div className="flex flex-col md:flex-row min-h-[320px] md:min-h-[420px] lg:min-h-[480px]">
            {/* Left Side - Person + Overlays */}
            <div className="relative w-full md:w-[45%] flex-shrink-0">
              {/* Person Image */}
              <div className="relative w-full h-[280px] md:h-full">
                <Image
                  src="https://images.unsplash.com/photo-1760488029475-41ff1eaa904b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGhvbGRpbmclMjBza2luY2FyZSUyMHByb2R1Y3QlMjB0dWJlfGVufDF8fHx8MTc3NDM3NjcwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Influencer"
                  fill
                  className="object-cover object-top"
                  priority
                />

                {/* Floating Orb */}
                <div
                  className="absolute flex items-center justify-center"
                  style={{
                    top: "20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "40px",
                    height: "40px",
                    background: "rgba(255,255,255,0.25)",
                    border: "1px solid rgba(255,255,255,0.4)",
                    borderRadius: "50%",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      background: "rgba(255,255,255,0.5)",
                      borderRadius: "50%",
                    }}
                  />
                </div>
              </div>

              {/* Floating Input Card — hidden on small mobile, shown from sm */}
              <div
                className="hidden sm:block absolute bg-white"
                style={{
                  bottom: "24px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "min(280px, 85%)",
                  borderRadius: "16px",
                  padding: "16px",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                }}
              >
                {/* Label */}
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#0F1629",
                    marginBottom: "10px",
                  }}
                >
                  Enter your brand website 🔥
                </div>

                {/* URL Input */}
                <input
                  type="text"
                  placeholder="www.yourbrand.com"
                  className="w-full mb-2"
                  style={{
                    background: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    padding: "7px 12px",
                    fontSize: "12px",
                    color: "#9CA3AF",
                    outline: "none",
                  }}
                />

                {/* AI Response */}
                <div className="flex items-start gap-2">
                  <div
                    className="flex-shrink-0"
                    style={{
                      width: "18px",
                      height: "18px",
                      background:
                        "linear-gradient(135deg, #3B42F5 0%, #1515CC 100%)",
                      borderRadius: "50%",
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      background: "#F3F4F6",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      fontSize: "11px",
                      color: "#6B7280",
                    }}
                  >
                    Let's get to know each other!
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Text Content */}
            <AnimatedGradientCard
              speed={1.2}
              colors={["#1212C8", "#2B2EF8", "#3D4AE8", "#2525F5", "#0A0F8C"]}
              className="flex-1 flex flex-col justify-center items-center md:items-end p-6 md:p-8 lg:p-12 lg:pr-[60px] rounded-2xl"
            >
              {/* Headline */}
              <h3
                className="font-manrope text-center md:text-right"
                style={{
                  fontSize: "clamp(22px, 3vw, 40px)",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                  maxWidth: "420px",
                  marginBottom: "28px",
                }}
              >
                Jaice is the first AI campaign
                <br className="hidden md:block" /> co-pilot that works like a
                true
                <br className="hidden md:block" /> teammate
              </h3>

              {/* CTA Button */}
              <button
                className="transition-all duration-200 hover:bg-[var(--color-bg-hover)] hover:scale-105"
                style={{
                  background: "#FFFFFF",
                  color: "#1A1D2E",
                  fontSize: "14px",
                  fontWeight: 700,
                  padding: "12px 24px",
                  borderRadius: "9999px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  cursor: "pointer",
                }}
              >
                Discover Jaice
              </button>
            </AnimatedGradientCard>
          </div>
        </div>
      </div>
    </section>
  );
}
