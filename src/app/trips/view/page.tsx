import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Screen, SkeletonList } from "@/components/ui";
import { TripDetail } from "./trip-detail";

export const metadata: Metadata = { title: "Trip", robots: { index: false } };

export default function TripPage() {
  return (
    <Screen>
      <Container className="max-w-4xl">
        <Suspense fallback={<SkeletonList />}>
          <TripDetail />
        </Suspense>
      </Container>
    </Screen>
  );
}
