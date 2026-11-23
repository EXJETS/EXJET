import retirements from "./public-route-retirements.json";

const removed = new Set(retirements.removed);
const retired = new Set([...removed, ...Object.keys(retirements.redirected)]);

export function isRetiredPublicPath(path: string) {
  return retired.has(path.split(/[?#]/, 1)[0].replace(/\/+$/, ""));
}
