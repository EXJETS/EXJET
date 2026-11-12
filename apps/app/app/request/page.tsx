import { Suspense } from "react";
import { TripForm } from "@/components/TripForm";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "New trip" };

export default function RequestPage() {
  return (
    <>
      <PageHeader title="New trip">Describe the mission in plain language or fill in the details. Every trip is a request for quote to operators.</PageHeader>
      <Suspense><TripForm /></Suspense>
    </>
  );
}
