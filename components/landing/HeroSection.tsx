"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { LogoCloudMarquee } from "../ui/LogoCloudMarquee";

export default function HeroSection() {
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor animation
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section
      className="min-h-screen pt-[80px] lg:pt-[100px] pb-4 lg:pb-10 px-5 md:px-10 lg:px-20 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--color-primary) 0%, #1212C8 100%)",
      }}
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left Column */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 text-center lg:text-left"
          >
            {/* H1 Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-white mx-auto lg:mx-0 max-w-[520px]"
              style={{
                fontFamily: "Manrope, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(36px, 6vw, 80px)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Creators Programs
              <br />
              on Autopilot
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="mt-4 lg:mt-6 mx-auto lg:mx-0 max-w-[380px] text-[15px] lg:text-[16px] text-white/80 leading-relaxed"
            >
              Influencer marketing, affiliate programs, creator management, user
              generated content, brand ambassadors: build valuable partnerships
              to grow your business.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-8 lg:mt-10 flex items-center justify-center lg:justify-start gap-6 lg:gap-8"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 lg:px-7 py-3 bg-[var(--color-primary-cta)] text-white text-[14px] lg:text-[15px] font-semibold rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Get Started
              </motion.button>

              <button className="text-white text-[14px] lg:text-[15px] font-medium hover:opacity-80 transition-opacity flex items-center">
                I'm a Creator
                <span
                  className="ml-1 inline-block w-[2px] h-[18px] bg-white"
                  style={{
                    opacity: showCursor ? 1 : 0,
                    transition: "opacity 0.1s step-end",
                  }}
                />
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column - Hero Image */}
          <motion.div
            variants={itemVariants}
            className="flex-1 flex items-center justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[560px] lg:max-w-none lg:w-full">
              <img
                src="/hero.png"
                alt="Apfluence platform preview"
                className="w-full h-auto object-contain drop-shadow-2xl"
                style={{
                  maxHeight: "calc(100vh - 140px)",
                  objectFit: "contain",
                  objectPosition: "center",
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Logo cloud — sits below hero content, inside same section */}
        <div className=" [&_.logo-cloud-wrapper]:py-4 [&_.logo-cloud-wrapper]:md:py-6">
          <LogoCloudMarquee />
        </div>
      </div>
    </section>
  );
}
