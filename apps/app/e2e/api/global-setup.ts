import { execSync } from "node:child_process";
import path from "node:path";

export default function globalSetup() {
  const api = path.resolve(__dirname, "../../../api");
  const out = path.resolve(__dirname, ".tmp");
  execSync(`uv run python ${path.resolve(__dirname, "make_pdfs.py")} ${out}`, { cwd: api, stdio: "inherit", env: { ...process.env, EXJET_ENV: "dev" } });
}
