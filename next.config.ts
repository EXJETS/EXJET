import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1", "terminal.local"],
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: false,
  },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'self'",
          "form-action 'self'",
          "script-src 'self' 'unsafe-inline' https://apps.avinode.com https://www.google.com https://www.gstatic.com https://www.recaptcha.net",
          "style-src 'self' 'unsafe-inline' https://apps.avinode.com",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com https://apps.avinode.com https://www.google.com https://www.gstatic.com",
          "frame-src 'self' https://apps.avinode.com https://www.google.com https://www.recaptcha.net",
        ].join("; "),
      },
    ];
    return [{ source: "/:path*", headers: security }];
  },
  async redirects() {
    return [
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
