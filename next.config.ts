import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1", "terminal.local"],
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/citation-latitude",
        destination: "/aircraft/citation-latitude",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
