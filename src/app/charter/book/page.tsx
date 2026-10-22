import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Screen, SkeletonList } from "@/components/ui";
import { BookScreen } from "./book-screen";

export const metadata: Metadata = { title: "Book your flight", robots: { index: false } };

export default function BookPage() {
  return (
    <Screen>
      <Container>
        <Suspense fallback={<SkeletonList />}>
          <BookScreen />
        </Suspense>
      </Container>
    </Screen>
  );
}
