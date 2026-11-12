import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export default async function globalSetup() {
  const api = path.resolve(__dirname, "../../../api");
  const out = path.resolve(__dirname, ".tmp");
  execSync(`uv run python ${path.resolve(__dirname, "make_pdfs.py")} ${out}`, { cwd: api, stdio: "inherit", env: { ...process.env, EXJET_ENV: "dev" } });
  // FBO dataset uploaded through Company OS by the journey (the dev seed has no FBOs). Airport values are real; FBO names are synthetic.
  fs.writeFileSync(
    path.join(out, "fbos.csv"),
    [
      "ICAO,Airport Name,Latitude,Longitude,IATA,City,State,Elevation,Longest Runway,Time Zone,FBO,FBO Phone,FBO Email",
      "KVNY,Van Nuys Airport,34.2098,-118.49,VNY,Van Nuys,CA,802,8001,America/Los_Angeles,SYNTHETIC FBO One,818-555-0100,fbo1@example.com",
      "KVNY,Van Nuys Airport,34.2098,-118.49,VNY,Van Nuys,CA,802,8001,America/Los_Angeles,SYNTHETIC FBO Two,818-555-0101,fbo2@example.com",
    ].join("\n") + "\n",
  );
  // One admin login for the whole run (the API rate-limits logins per address); specs reuse this session cookie.
  const res = await fetch("http://localhost:8000/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Requested-With": "exjet" },
    body: JSON.stringify({ email: "admin@example.com", password: "dev-admin-password-1" }),
  });
  if (!res.ok) throw new Error(`admin login failed: ${res.status}`);
  const setCookie = res.headers.getSetCookie().find((c) => c.startsWith("exjet_session="));
  if (!setCookie) throw new Error("no session cookie");
  const value = setCookie.split(";")[0].slice("exjet_session=".length);
  fs.writeFileSync(
    path.join(out, "admin-state.json"),
    JSON.stringify({ cookies: [{ name: "exjet_session", value, domain: "localhost", path: "/", expires: -1, httpOnly: true, secure: false, sameSite: "Lax" }], origins: [] }),
  );
}
