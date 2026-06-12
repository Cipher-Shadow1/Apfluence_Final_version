"use client";

import { motion } from "motion/react";
import InfluencerCard from "./InfluencerCard";

export default function InfluencerDiscoverySection() {
  const influencers = [
    {
      profilePhoto:
        "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsJTIwaGVhZHNob3R8ZW58MXx8fHwxNzc0MzE5MTg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      name: "Lily Smith",
      country: "United States",
      countryFlag: "🇺🇸",
      bio: "NJ&NYC • Sharing hidden thrift gem and helping you g...",
      contentThumbnails: [
        {
          imageUrl:
            "https://images.unsplash.com/photo-1772449099746-a50b5d9742db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWZlc3R5bGUlMjBmYXNoaW9uJTIwY2l0eSUyMHN0cmVldHxlbnwxfHx8fDE3NzQzNzYxMjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          hasTikTokIcon: true,
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1682955376565-df2db78248db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwY29mZmVlJTIwYWVzdGhldGljJTIwbGlmZXN0eWxlfGVufDF8fHx8MTc3NDM3NjEyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1642287040066-2bd340523289?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwYXJjaGl0ZWN0dXJlJTIwdXJiYW4lMjBuaWdodHxlbnwxfHx8fDE3NzQzNzYxMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
      ],
      score: 94,
      followers: [
        { platform: "TikTok", count: "2.4M" },
        { platform: "Instagram", count: "1.5M" },
      ],
      tags: [{ label: "Wellness" }, { label: "Lifestyle" }, { label: "City" }],
    },
    {
      profilePhoto:
        "https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMHBob3RvfGVufDF8fHx8MTc3NDM3NjExOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      name: "Will Spencer",
      country: "United States",
      countryFlag: "🇺🇸",
      bio: "Professional photographer capturing life's best moments...",
      contentThumbnails: [
        {
          imageUrl:
            "https://images.unsplash.com/photo-1646034296147-d8ed3aace9a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBwaG90b2dyYXBoeSUyMGFkdmVudHVyZSUyMG1vdW50YWlufGVufDF8fHx8MTc3NDM3NjEyMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          hasTikTokIcon: true,
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1648498029913-8876faf6809a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMGJlYWNoJTIwdHJhdmVsJTIwd2F2ZXN8ZW58MXx8fHwxNzc0Mzc2MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1642287040066-2bd340523289?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwYXJjaGl0ZWN0dXJlJTIwdXJiYW4lMjBuaWdodHxlbnwxfHx8fDE3NzQzNzYxMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          hasTikTokIcon: true,
        },
      ],
      score: 89,
      followers: [
        { platform: "TikTok", count: "728k" },
        { platform: "Instagram", count: "440k" },
      ],
      tags: [{ label: "Photograph" }, { label: "Travel" }],
      hasCustomerBadge: true,
    },
    {
      profilePhoto:
        "https://images.unsplash.com/photo-1710357956769-232ef8e9e1aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBtYW4lMjBwb3J0cmFpdCUyMHNtaWxlfGVufDF8fHx8MTc3NDM3NjExOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      name: "Alexandre Silva",
      country: "Brasil",
      countryFlag: "🇧🇷",
      bio: "Fitness enthusiast & yoga instructor helping you stay fit...",
      contentThumbnails: [
        {
          imageUrl:
            "https://images.unsplash.com/photo-1758274536471-912e9d20d4fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwZml0bmVzcyUyMGV4ZXJjaXNlJTIwd2VsbG5lc3N8ZW58MXx8fHwxNzc0Mzc2MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          hasTikTokIcon: true,
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1722605341100-5cdba3a450fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWxsbmVzcyUyMG1lZGl0YXRpb24lMjBoZWFsdGh5JTIwbGlmZXN0eWxlfGVufDF8fHx8MTc3NDM3NjEyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1642287040066-2bd340523289?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwYXJjaGl0ZWN0dXJlJTIwdXJiYW4lMjBuaWdodHxlbnwxfHx8fDE3NzQzNzYxMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
      ],
      score: 92,
      followers: [
        { platform: "TikTok", count: "1.2M" },
        { platform: "Instagram", count: "890k" },
      ],
      tags: [{ label: "Yoga" }, { label: "Fitness" }, { label: "City" }],
      hasCustomerBadge: true,
      hasGreenDotCountry: true,
      reactions: {
        likes: "12.4k",
        comments: "2.1k",
      },
    },
    {
      profilePhoto:
        "https://images.unsplash.com/photo-1763070605733-e420828395ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjB3b21hbiUyMHBvcnRyYWl0JTIwZWxlZ2FudHxlbnwxfHx8fDE3NzQzNzYxMjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      name: "Clémence D.",
      country: "France",
      countryFlag: "🇫🇷",
      bio: "Paris based • Art, culture, and everyday beauty...",
      contentThumbnails: [
        {
          imageUrl:
            "https://images.unsplash.com/photo-1767330855801-8ba9eb8f81e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdWx0dXJlJTIwYXJ0JTIwY3JlYXRpdmUlMjBkZXNpZ258ZW58MXx8fHwxNzc0Mzc2MTIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1682955376565-df2db78248db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwY29mZmVlJTIwYWVzdGhldGljJTIwbGlmZXN0eWxlfGVufDF8fHx8MTc3NDM3NjEyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          hasTikTokIcon: true,
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1646034296147-d8ed3aace9a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBwaG90b2dyYXBoeSUyMGFkdmVudHVyZSUyMG1vdW50YWlufGVufDF8fHx8MTc3NDM3NjEyMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
      ],
      score: 97,
      followers: [
        { platform: "TikTok", count: "3.1M" },
        { platform: "Instagram", count: "2.2M" },
      ],
      tags: [{ label: "Lifestyle" }, { label: "Culture" }, { label: "Travel" }],
      reactions: {
        likes: "8.9k",
        comments: "1.5k",
      },
    },
  ];

  const features = [
    {
      title: "Creators who already love your brand",
      description:
        "Creators are 7x more likely to want to collaborate if they're already your customers.",
    },
    {
      title: "Not just any creators. The right ones",
      description:
        "Find perfect creators whose data, content & performance fit your brand",
      hasBlinkingCursor: true,
    },
    {
      title: "Data driven tracking",
      description:
        "Make smarter decisions with data-rich creator profiles to reach double digit ",
      hasROILink: true,
    },
    {
      title: "Let creators come to you.",
      description:
        "No manual discovery or outreach, no delays: scale faster with Upfluence Marketplace.",
    },
  ];

  return (
    <section
      className="min-h-screen px-5 md:px-10 lg:px-20 py-16 lg:py-[100px] pb-12 lg:pb-20 relative overflow-hidden"
      style={{
        background: "#EEF1F8",
      }}
    >
      <div className="mx-auto max-w-[1440px] relative">
        {/* Vertical Dashed Border Separator — hidden on mobile */}
        <div
          className="hidden lg:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2"
          style={{
            borderLeft: "1.5px dashed rgba(100, 120, 200, 0.25)",
          }}
        />

        <div className="flex flex-col-reverse lg:flex-row">
          {/* Left Column - Influencer Cards Stack */}
          <div className="w-full lg:w-1/2 pr-0 lg:pr-[60px] flex items-center justify-center lg:justify-end mt-10 lg:mt-0">
            <div className="flex flex-col gap-2 w-full max-w-[540px]">
              {influencers.map((influencer, index) => (
                <InfluencerCard key={index} {...influencer} />
              ))}
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="w-full lg:w-1/2 pl-0 lg:pl-[80px] flex items-center">
            <div className="flex flex-col">
              {/* Section Label */}
              <div
                className="uppercase tracking-[0.12em]"
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#FF4422",
                  marginBottom: "16px",
                }}
              >
                INFLUENCER DISCOVERY
              </div>

              {/* H2 Headline */}
              <h2
                className="font-manrope"
                style={{
                  fontSize: "clamp(28px, 4vw, 52px)",
                  fontWeight: 800,
                  color: "#0F1629",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  marginBottom: "32px",
                  maxWidth: "480px",
                }}
              >
                Find the best influencers
              </h2>

              {/* Feature List */}
              <div className="flex flex-col gap-6 lg:gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 lg:gap-4">
                    {/* Icon Badge */}
                    <div
                      className="flex-shrink-0 rounded-full flex items-center justify-center"
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "#2B2EF8",
                      }}
                    >
                      <svg
                        className="text-white"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>

                    {/* Text Block */}
                    <div className="flex-1">
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#0F1629",
                          marginBottom: "4px",
                        }}
                      >
                        {feature.title}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 400,
                          color: "#6B7280",
                          lineHeight: 1.55,
                          maxWidth: "380px",
                        }}
                      >
                        {feature.description}
                        {feature.hasROILink && (
                          <>
                            <a
                              href="#"
                              style={{
                                color: "#2B2EF8",
                                textDecoration: "none",
                              }}
                              className="hover:opacity-75"
                            >
                              ROI
                            </a>
                            .
                          </>
                        )}
                        {feature.hasBlinkingCursor && (
                          <span
                            style={{
                              color: "#0F1629",
                              animation: "blink 1s step-end infinite",
                            }}
                          >
                            |
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* LEARN MORE Link */}
              <a
                href="#"
                className="uppercase tracking-[0.08em] inline-flex items-center gap-1.5 group"
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#2B2EF8",
                  marginTop: "32px",
                  textDecoration: "none",
                  width: "fit-content",
                }}
              >
                <span className="group-hover:opacity-75 transition-opacity duration-200">
                  LEARN MORE
                </span>
                <span
                  className="transition-transform duration-200 group-hover:translate-x-[3px]"
                  style={{ fontSize: "13px" }}
                >
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Blinking cursor animation */}
      <style>{`
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
