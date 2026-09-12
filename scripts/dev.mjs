import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// Accept the supervised preview's flags while keeping Next.js as the dev server.
// Next exits when the requested port is occupied, so strictPort is implicit.
const args = process.argv.slice(2).flatMap((argument) => {
  if (argument === "--strictPort") return [];
  if (argument === "--host") return ["--hostname"];
  if (argument.startsWith("--host=")) return [argument.replace("--host=", "--hostname=")];
  return [argument];
});
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", ...args], { stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => child.kill(signal));
child.once("error", (error) => { console.error(error.message); process.exitCode = 1; });
child.once("exit", (code) => { process.exitCode = code ?? 1; });
