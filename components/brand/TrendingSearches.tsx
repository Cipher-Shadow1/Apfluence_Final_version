"use client";

import React from "react";
import { motion } from "motion/react";
import { Compass, ArrowRight } from "lucide-react";
import Image from "next/image";
import { AvatarCircles } from "../ui/avatar-circles";

export const TrendingSearches = () => {
  const cards = [
    {
      title: "Instagram's rising stars under 100k followers",
      backgroundImage: "/card 1.png",
      badge: "Discover",
      count: "+10k",
      textColor: "text-white",
      badgeBg: "bg-white/15  text-white",
      avatars: [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=A",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=B",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=C",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=D",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=E",
      ],
      btnBg: "bg-white",
      btnHover:
        "hover:brightness-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]",
    },
    {
      title: "Top engaging TikTok creators under 100K followers",
      backgroundImage: "/card 2.png",
      badge: "Discover",
      count: "+9.2k",
      textColor: "text-dark",
      badgeBg: "bg-[var(--color-bg-accent-soft)] text-[var(--color-text-accent)]",
      avatars: [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=A",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=B",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=C",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=D",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=E",
      ],
      btnBg: "bg-white",
      btnHover:
        "hover:brightness-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]",
    },
    {
      title: "Top engaging Instagram creators under 100K followers",
      backgroundImage: "/card 3.png",
      badge: "Discover",
      count: "+10k",
      textColor: "text-white",
      badgeBg: "bg-white/15  text-white",
      avatars: [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=A",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=B",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=C",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=D",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=E",
      ],
      btnBg: "bg-white",
      btnHover:
        "hover:brightness-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]",
    },
  ];

  return (
    <section className="mt-8 px-6">
      <h2 className="text-[15px] font-semibold text-gray-900 mb-4">
        Explore trending searches
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4 }}
            className={`rounded-2xl p-5 h-[190px] relative overflow-hidden flex flex-col justify-between shadow-sm group`}
          >
            <Image
              src={card.backgroundImage}
              alt={card.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={idx === 0}
            />

            <div className="relative z-10 flex flex-col items-start gap-4">
              <div
                className={`${card.badgeBg} px-2.5 py-1 rounded-full text-[12px] font-bold flex items-center gap-1.5 backdrop-blur-sm`}
              >
                <Compass className="w-3.5 h-3.5" />
                {card.badge}
              </div>
              <h3
                className={`${card.textColor} text-base font-semibold leading-tight w-[80%]`}
              >
                {card.title}
              </h3>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <AvatarCircles
                  className="pointer-events-none"
                  numPeople={card.count}
                  avatarUrls={card.avatars}
                />
              </div>

              <button
                className={`${card.btnBg} text-dark ${card.btnHover} px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-1 backdrop-blur-sm`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Explore
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
