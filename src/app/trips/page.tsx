import type { Metadata } from "next";
import { Container, Screen } from "@/components/ui";
import { TripsScreen } from "./trips-screen";

export const metadata: Metadata = { title: "My trips", robots: { index: false } };

export default function TripsPage() {
  return (
    <Screen>
      <Container className="max-w-4xl">
        <TripsScreen />
      </Container>
    </Screen>
  );
}
