import type { NextConfig } from "next";

// Fully static export: the same `out/` folder is deployed to Vercel and
// bundled into the iOS app by Capacitor (see capacitor.config.ts).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;
