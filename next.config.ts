import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Fixes incorrect root inference when multiple lockfiles exist above this app.
    root: path.join(__dirname),
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  compress: true,

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  async headers() {
    return [
      {
        // Request pathnames omit the `(protected)` route group — e.g. `/brand/campaigns`
        source: "/brand/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
