import React from "react";

export default function InfluencerResultCardSkeleton() {
  const shimmerStyle = {
    background: "linear-gradient(90deg, #e2e2e8 25%, #f3f3f7 50%, #e2e2e8 75%)",
    backgroundSize: "400px 100%",
    animation: "shimmer 1.5s infinite linear",
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
      {/* Inline keyframes definition since React supports adding style tags, but to avoid multiple tags when 6 render, it's safe to just inject it once globally if possible, or use module. But since the instructions allowed inline, we can inject a quick style block here. */}
      <style suppressHydrationWarning>{`
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
      `}</style>

      {/* Left Section: Avatar (28x28 = 112px) */}
      <div className="relative h-28 w-28 flex-shrink-0">
        <div className="w-full h-full rounded-2xl" style={shimmerStyle} />
        {/* Actions Pill Placeholder */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-8 bg-white p-1 rounded-full shadow-sm border border-gray-100 flex gap-1.5 overflow-hidden">
          <div className="h-full w-full rounded-full" style={shimmerStyle} />
        </div>
      </div>

      {/* Info Section: Name, Location, Bio */}
      <div className="flex-1 min-w-[200px] flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          {/* Name */}
          <div className="h-6 w-32 rounded-md" style={shimmerStyle} />
          {/* Location pill */}
          <div className="h-5 w-20 rounded-full" style={shimmerStyle} />
        </div>
        {/* Username */}
        <div className="h-4 w-24 rounded-md mb-2" style={shimmerStyle} />
        {/* Bio */}
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-full rounded-sm" style={shimmerStyle} />
          <div className="h-3.5 w-3/4 rounded-sm" style={shimmerStyle} />
        </div>
      </div>

      {/* Gallery Section: 3 Thumbnails (84x84) */}
      <div className="hidden lg:flex gap-2.5 flex-shrink-0 ml-auto">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[84px] w-[84px] rounded-xl overflow-hidden shadow-sm border border-gray-100"
            style={shimmerStyle}
          />
        ))}
      </div>

      {/* Stats Section */}
      <div className="flex flex-col flex-shrink-0 gap-2.5 w-48 md:border-l md:border-r border-gray-100 md:px-5 py-1">
        {/* Authenticity Pill */}
        <div className="h-6 w-20 rounded-md mb-1" style={shimmerStyle} />
        <div className="flex flex-col gap-2">
          {/* 3 platform rows */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 w-12 rounded-sm" style={shimmerStyle} />
              <div className="h-4 w-8 rounded-sm" style={shimmerStyle} />
            </div>
          ))}
        </div>
      </div>

      {/* Tags / Niches Section (w-40) */}
      <div className="hidden xl:flex flex-col gap-2 flex-shrink-0 w-40 py-1">
        {/* "Niches" label */}
        <div className="h-3 w-12 rounded-sm mb-1" style={shimmerStyle} />
        <div className="flex flex-wrap gap-1.5">
          {/* 3 tags */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-6 w-[45%] rounded-md"
              style={shimmerStyle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
