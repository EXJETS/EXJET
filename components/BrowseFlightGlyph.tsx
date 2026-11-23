import type { SVGProps } from "react";

export type BrowseGlyphName = "forward" | "back" | "close" | "menu" | "account" | "route" | "pin" | "chevron" | "search" | "aircraft" | "empty";
const paths: Record<BrowseGlyphName,string> = {
  forward:"M4 12h15m-6-6 6 6-6 6",
  back:"M20 12H5m6-6-6 6 6 6",
  close:"M5 5l14 14M19 5 5 19",
  menu:"M4 7h16M4 12h16M4 17h10",
  account:"M12 3a4 4 0 1 0 .01 0M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1",
  route:"M5 7a2 2 0 1 0 .01 0M19 17a2 2 0 1 0 .01 0M9 7h7l-8 10h7",
  pin:"M12 22s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12Zm0-10a2.2 2.2 0 1 0-.01 0",
  chevron:"m6 9 6 6 6-6",
  search:"M10 4a6 6 0 1 0 .01 0m4.5 10.5L20 20",
  aircraft:"m12 2 2 7 8 5v2l-8-3v5l3 2v2l-5-2-5 2v-2l3-2v-5l-8 3v-2l8-5 2-7Z",
  empty:"M12 6v6h4m4 0a8 8 0 1 1-2.3-5.7L21 9m0-5v5h-5",
};

export function BrowseFlightGlyph({name,...rest}: SVGProps<SVGSVGElement>&{name:BrowseGlyphName}) {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}><path d={paths[name]}/></svg>;
}
