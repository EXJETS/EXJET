import type { NextConfig } from "next";
import retirements from "./data/public-route-retirements.json";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1", "terminal.local"],
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: false,
  },
  async redirects() {
    return [
      ...Object.entries(retirements.redirected).map(([source, destination]) => ({
        source, destination: `${destination}/`, statusCode: 301,
      })),
      {
        source: "/citation-latitude",
        destination: "/aircraft/citation-latitude/",
        statusCode: 301,
      },
      {
        source: "/airports/kpbi",
        destination: "/airports/kdjt/",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
