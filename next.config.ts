import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Vercel-safety: never fail a build on a lint rule, never on unused types.
  // The local `npm run lint` still runs them manually.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Local `tsc --noEmit` passes; don't let stale build-time type probing
    // block deploys.
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
