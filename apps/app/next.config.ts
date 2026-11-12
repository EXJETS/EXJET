import type { NextConfig } from "next";

import path from "node:path";

const config: NextConfig = {
  turbopack: { root: path.join(__dirname) },
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  poweredByHeader: false,
};

export default config;
