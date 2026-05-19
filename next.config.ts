import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keep client-side router cache warm for 30s on hover/prefetch
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  // Reduce cold start time by limiting unnecessary polyfills
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
