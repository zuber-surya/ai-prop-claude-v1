import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // picsum.photos serves the seed script's placeholder property photos
    // (prisma/seed.ts) - not a real image host, MVP fixture data only.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
