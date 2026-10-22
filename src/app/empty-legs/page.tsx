import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Screen, SkeletonList } from "@/components/ui";
import { EmptyLegsScreen } from "./empty-legs-screen";

export const metadata: Metadata = {
  title: "Empty leg flights",
  description: "Fly a whole private jet for a fraction of the charter price. Live empty legs, fixed all-in prices.",
};

export default function EmptyLegsPage() {
  return (
    <Screen>
      <Container>
        <Suspense fallback={<SkeletonList />}>
          <EmptyLegsScreen />
        </Suspense>
      </Container>
    </Screen>
  );
}
