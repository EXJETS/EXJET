import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EXJET",
    short_name: "EXJET",
    description: "Private jet charter and empty leg flights.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f4f4",
    theme_color: "#0b0c0e",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
