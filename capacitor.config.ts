import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.exjet.app",
  appName: "EXJET",
  // `next build` writes the static site here; `cap sync ios` copies it into the app bundle.
  webDir: "out",
  ios: {
    contentInset: "never",
    backgroundColor: "#f7f5f0",
    scheme: "EXJET",
  },
};

export default config;
