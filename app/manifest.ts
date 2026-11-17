import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EXJET",
    short_name: "EXJET",
    description: "Global private aircraft charter access, on demand.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f4f4",
    theme_color: "#ffffff",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
