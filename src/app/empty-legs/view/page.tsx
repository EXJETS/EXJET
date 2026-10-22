import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Screen, SkeletonList } from "@/components/ui";
import { LegDetail } from "./leg-detail";

export const metadata: Metadata = { title: "Empty leg" };

export default function LegPage() {
  return (
    <Screen>
      <Container>
        <Suspense fallback={<SkeletonList />}>
          <LegDetail />
        </Suspense>
      </Container>
    </Screen>
  );
}
