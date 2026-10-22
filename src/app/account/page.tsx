import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Screen, SkeletonList } from "@/components/ui";
import { AccountScreen } from "./account-screen";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default function AccountPage() {
  return (
    <Screen>
      <Container className="max-w-xl">
        <Suspense fallback={<SkeletonList count={2} />}>
          <AccountScreen />
        </Suspense>
      </Container>
    </Screen>
  );
}
