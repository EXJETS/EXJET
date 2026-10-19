import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const origin = "https://www.exjet.com";
const source = new URL("../data/site.ts", import.meta.url).href;

function inspect(overrides) {
  const env = { ...process.env };
  for (const name of ["VERCEL_ENV", "VERCEL_URL", "NEXT_PUBLIC_SITE_URL", "NODE_ENV"]) {
    delete env[name];
  }
  const script = `
    const site = await import(${JSON.stringify(source)});
    console.log(JSON.stringify({
      indexable: site.isPublicProduction,
      origin: site.siteOrigin,
      route: site.absoluteUrl("/routes/dallas-to-miami/"),
      organization: site.organizationJsonLd(),
      localBusiness: site.localBusinessJsonLd(),
    }));
  `;
  return JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    env: { ...env, ...overrides },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }));
}

const scenarios = [
  ["Vercel production with no configured site URL", { VERCEL_ENV: "production", NODE_ENV: "production", VERCEL_URL: "exjet-preview.vercel.app" }, true],
  ["Vercel production with a stale preview URL", { VERCEL_ENV: "production", NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://exjet-preview.vercel.app" }, true],
  ["Vercel preview inheriting the public URL", { VERCEL_ENV: "preview", NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: origin }, false],
  ["Vercel development inheriting the public URL", { VERCEL_ENV: "development", NODE_ENV: "development", NEXT_PUBLIC_SITE_URL: origin }, false],
  ["custom staging environment", { VERCEL_ENV: "staging", NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: origin }, false],
  ["local production build without opt-in", { NODE_ENV: "production" }, false],
  ["local development with the public URL", { NODE_ENV: "development", NEXT_PUBLIC_SITE_URL: origin }, false],
  ["explicit non-Vercel production build", { NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: `${origin}/` }, true],
  ["non-Vercel build with a malformed URL", { NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "http://[" }, false],
];

for (const [name, env, indexable] of scenarios) {
  test(name, () => {
    const result = inspect(env);
    assert.equal(result.indexable, indexable);
    assert.equal(result.origin, origin);
    assert.equal(result.route, `${origin}/routes/dallas-to-miami/`);
    assert.equal(result.organization.url, origin);
    assert.equal(result.localBusiness.url, origin);
    assert.equal(new URL(result.organization.logo).origin, origin);
    assert.equal(new URL(result.localBusiness.image).origin, origin);
  });
}
