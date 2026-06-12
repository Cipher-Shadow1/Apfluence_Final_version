"use client";

import { cn } from "@/lib/utils";
import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTwitter,
} from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import React from "react";

export function CenteredWithLogo() {
  const pages = [
    { title: "Features", href: "#" },
    { title: "Use Cases", href: "#" },
    { title: "Creator Marketplace", href: "#" },
    { title: "Pricing", href: "#" },
    { title: "Resources", href: "#" },
    { title: "Privacy", href: "#" },
    { title: "Terms", href: "#" },
  ];

  return (
    <div
      className="border-t px-8 py-20 w-full relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0F1629 0%, #1A1D2E 100%)",
        borderColor: "rgba(43, 46, 248, 0.2)",
      }}
    >
      {/* Background Glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(43,46,248,0.15) 0%, rgba(123,47,247,0) 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto text-sm justify-between items-start md:px-8 relative z-10">
        <div className="flex flex-col items-center justify-center w-full relative overflow-hidden">
          <div className="mr-0 md:mr-4 md:flex mb-8">
            <AnimatedLogo />
          </div>

          <ul className="transition-colors flex sm:flex-row flex-col list-none gap-6 md:gap-8">
            {pages.map((page, idx) => (
              <li key={"pages" + idx} className="list-none">
                <Link
                  className="transition-colors font-medium text-white/70 hover:text-[var(--color-primary)]"
                  href={page.href}
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>

          <GridLineHorizontal className="max-w-7xl mx-auto mt-10 mb-2 opacity-50" />
        </div>

        <div className="flex sm:flex-row flex-col justify-between mt-8 items-center w-full">
          <p className="text-white/50 mb-8 sm:mb-0">
            &copy; 2026 Apfluence &middot; All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-white/50 hover:text-[var(--color-primary)] transition-colors"
            >
              <IconBrandTwitter className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-white/50 hover:text-[var(--color-primary)] transition-colors"
            >
              <IconBrandLinkedin className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-white/50 hover:text-[var(--color-primary)] transition-colors"
            >
              <IconBrandGithub className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-white/50 hover:text-[var(--color-primary)] transition-colors"
            >
              <IconBrandFacebook className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-white/50 hover:text-[var(--color-primary)] transition-colors"
            >
              <IconBrandInstagram className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const GridLineHorizontal = ({
  className,
  offset,
}: {
  className?: string;
  offset?: string;
}) => {
  return (
    <div
      style={
        {
          "--background": "#0F1629",
          "--color": "rgba(43, 46, 248, 0.4)", // Electric blue line
          "--height": "1px",
          "--width": "6px",
          "--fade-stop": "90%",
          "--offset": offset || "200px",
          maskComposite: "exclude",
        } as React.CSSProperties
      }
      className={cn(
        "w-[calc(100%+var(--offset))] h-[var(--height)]",
        "bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        className,
      )}
    />
  );
};

const AnimatedLogo = () => {
  return (
    <Link
      href="/"
      className="flex flex-col items-center justify-center space-y-2 group"
    >
      <motion.div
        animate={{
          boxShadow: [
            "0px 0px 0px rgba(43,46,248,0)",
            "0px 0px 20px rgba(43,46,248,0.6)",
            "0px 0px 0px rgba(43,46,248,0)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #2B2EF8, #1212C8)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Shine effect inside the logo */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1,
          }}
          className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"
        />
        <span
          className="text-white font-black text-[20px] relative z-10"
          style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
        >
          <Image
            src="/logo.svg"
            alt="Apfluence"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
        </span>
      </motion.div>
      <span className="font-semibold text-[15px] text-white tracking-wide">
        Apfluence
      </span>
    </Link>
  );
};
