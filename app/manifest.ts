import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EXJET",
    short_name: "EXJET",
    description: "Global private aircraft charter access, on demand.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f4f2",
    theme_color: "#0b0c0e",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
