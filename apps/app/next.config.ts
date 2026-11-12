import type { NextConfig } from "next";

import path from "node:path";

const config: NextConfig = {
  turbopack: { root: path.join(__dirname) },
  outputFileTracingRoot: path.join(__dirname),
  // Separate output dir lets the mock e2e and the real-API e2e build side by side.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  // Same-origin API: the browser calls /v1/* on the app origin and Next proxies it to the API, so the httpOnly
  // session cookie is first-party in dev (:3001 -> :8000) and in production (app.exjet.com/v1 -> API).
  async rewrites() {
    const api = (process.env.API_ORIGIN ?? "http://localhost:8000").replace(/\/+$/, "");
    return [{ source: "/v1/:path*", destination: `${api}/v1/:path*` }];
  },
};

export default config;
