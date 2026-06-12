"use client";

import { useEffect, useState } from "react";

export default function MobileBlocker() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check(); // Initial check
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/no-phones.png"
        alt="Desktop only"
        className="mb-6 w-40"
      />
      <h2 className="mb-3 text-center text-xl font-bold text-gray-900">
        This screen is not large enough
      </h2>
      <p className="max-w-xs text-center text-sm leading-relaxed text-gray-500">
        To fully enjoy all the great features we offer, please switch to a larger screen.
      </p>
    </div>
  );
}
