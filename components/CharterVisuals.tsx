import type { SVGProps } from "react";

export type CharterIconName = "aircraft" | "group" | "cargo" | "empty" | "route" | "quote" | "check" | "arrow" | "search" | "menu" | "close";
const paths: Record<CharterIconName, string> = {
  aircraft: "M12 2.5v19m0-15-8 6v2l8-3 8 3v-2l-8-6m0 11-3.5 2m3.5-2 3.5 2",
  group: "M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.5 8v-1.2a4.2 4.2 0 0 1 4.2-4.2h2.6a4.2 4.2 0 0 1 4.2 4.2V19H3Zm12-13.5a2.8 2.8 0 1 1 0 5.5m1.5 2.6a4.2 4.2 0 0 1 4.5 4.2V19h-4",
  cargo: "M3.5 7 12 3l8.5 4v10L12 21l-8.5-4V7ZM3.5 7 12 11l8.5-4M12 11v10M7.7 5l8.6 4",
  empty: "M12 4a8 8 0 1 0 8 8m0-8v5h-5m5 0-4.2-3.8M12 8v5h4",
  route: "M6 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM10 7h5.5a2.5 2.5 0 0 1 0 5h-7a2.5 2.5 0 0 0 0 5H14",
  quote: "M6 3.5h8l4 4v13H6v-17Zm8 0v4h4m-9 4h6m-6 4h6",
  check: "M12 3 5 6v5c0 4.5 2.5 8 7 10 4.5-2 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4",
  arrow: "M4 12h15m-6-6 6 6-6 6",
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM16 16l4 4",
  menu: "M4 8h16M4 16h16",
  close: "M6 6l12 12M18 6 6 18",
};

export function CharterIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: CharterIconName }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}><path d={paths[name]} /></svg>;
}

const waypoints = [
  { label: "Los Angeles", code: "VNY", x: 61.51, y: 55.79, dx: -1.5, dy: 3.6, align: "start" },
  { label: "Aspen", code: "ASE", x: 73.13, y: 50.78, dx: -7, dy: -1.5, align: "start" },
  { label: "Dallas", code: "DAL", x: 83.14, y: 57.15, dx: -1, dy: 4.2, align: "start" },
  { label: "New York", code: "TEB", x: 105.94, y: 49.15, dx: 1.4, dy: -1.7, align: "end" },
  { label: "Miami", code: "OPF", x: 99.73, y: 64.09, dx: -1.5, dy: 4, align: "end" },
] as const;

export function CharterCoverageGraphic({ className }: { className?: string }) {
  return <svg className={className} viewBox="50 40 66 32" role="img" aria-label="Illustrative charter routes between Dallas, Los Angeles, Aspen, New York, and Miami">
    <rect x="50" y="40" width="66" height="32" fill="#edf4ff" />
    <image href="/brand/charter-land-outline.svg" x="0" y="0" width="360" height="180" opacity=".72" />
    <path d="M61 40v32m11-32v32m11-32v32m11-32v32m11-32v32M50 48h66M50 56h66M50 64h66" stroke="#9aacc1" strokeWidth=".08" />
    {waypoints.filter(p => p.code !== "DAL").map(p => <path key={p.code} d={`M83.14 57.15 Q${(83.14+p.x)/2} ${Math.min(57.15,p.y)-3} ${p.x} ${p.y}`} stroke="#2f5ac0" strokeWidth=".21" fill="none" strokeDasharray=".44 .28" />)}
    {waypoints.map(p => <g key={p.code}>
      <circle cx={p.x} cy={p.y} r={p.code === "DAL" ? ".88" : ".53"} fill="#2855bc" stroke="white" strokeWidth=".3" />
      <text x={p.x+p.dx} y={p.y+p.dy} textAnchor={p.align} fill="#102653" fontSize="1.6" fontWeight="650">{p.label}</text>
    </g>)}
  </svg>;
}
