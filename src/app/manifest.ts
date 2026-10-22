import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EXJET — Private jet charter",
    short_name: "EXJET",
    description: "Charter a private jet or fly an empty leg.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5f0",
    theme_color: "#f7f5f0",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
