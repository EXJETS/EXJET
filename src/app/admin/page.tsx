import type { Metadata } from "next";
import { Container, Screen } from "@/components/ui";
import { AdminConsole } from "./admin-console";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default function AdminPage() {
  return (
    <Screen>
      <Container>
        <AdminConsole />
      </Container>
    </Screen>
  );
}
