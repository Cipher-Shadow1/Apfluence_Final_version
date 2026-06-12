"use client";

import { m } from "framer-motion";
import { type LucideIcon } from "lucide-react";

export interface FloatingIconLayerItem {
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

interface FloatingIconsLayerProps {
  icons: FloatingIconLayerItem[];
}

export default function FloatingIconsLayer({ icons }: FloatingIconsLayerProps) {
  return (
    <>
      {icons.map((fi, i) => {
        const Icon = fi.icon;
        return (
          <m.div
            key={i}
            className="pointer-events-none absolute select-none"
            style={{ left: `${fi.initialX}%`, top: `${fi.initialY}%` }}
            animate={{
              x: [0, fi.animateX, 0],
              y: [0, fi.animateY, 0],
              rotate: fi.rotate ? [0, fi.rotate, 0] : [0, 0, 0],
              opacity: [0.08, 0.18, 0.08],
            }}
            transition={{
              duration: fi.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon size={fi.size} color={fi.color} />
          </m.div>
        );
      })}
    </>
  );
}
