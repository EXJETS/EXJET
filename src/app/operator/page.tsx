import type { Metadata } from "next";
import { Container, Screen } from "@/components/ui";
import { OperatorConsole } from "./operator-console";

export const metadata: Metadata = { title: "Operator console", robots: { index: false } };

export default function OperatorPage() {
  return (
    <Screen>
      <Container>
        <OperatorConsole />
      </Container>
    </Screen>
  );
}
