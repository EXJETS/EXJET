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
  };
}
