import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: [".next/**", ".next-api/**", "node_modules/**", "e2e/screenshots/**", "playwright-report/**", "test-results/**", "next-env.d.ts"] },
];

export default config;
