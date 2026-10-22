import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EXJET",
    short_name: "EXJET",
    description: "Private jet charter, empty legs and your personal travel workspace.",
    start_url: "/app/",
    display: "standalone",
    background_color: "#f7f8f2",
    theme_color: "#203b2b",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
