import { Container, EmptyState, LinkButton, Screen } from "@/components/ui";

export default function NotFound() {
  return (
    <Screen>
      <Container className="max-w-xl">
        <EmptyState title="Page not found" body="That page has flown off somewhere." action={<LinkButton href="/">Back home</LinkButton>} />
      </Container>
    </Screen>
  );
}
