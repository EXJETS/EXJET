import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Screen, SkeletonList } from "@/components/ui";
import { CharterScreen } from "./charter-screen";

export const metadata: Metadata = {
  title: "Charter a private jet",
  description: "Instant, transparent quotes on every class of private jet — from light jets to ultra-long-range.",
};

export default function CharterPage() {
  return (
    <Screen>
      <Container>
        <Suspense fallback={<SkeletonList />}>
          <CharterScreen />
        </Suspense>
      </Container>
    </Screen>
  );
}
