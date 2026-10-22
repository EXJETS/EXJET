import type { Metadata } from "next";
import { Container, Screen } from "@/components/ui";
import { AlertsScreen } from "./alerts-screen";

export const metadata: Metadata = { title: "Route alerts", robots: { index: false } };

export default function AlertsPage() {
  return (
    <Screen>
      <Container className="max-w-3xl">
        <AlertsScreen />
      </Container>
    </Screen>
  );
}
