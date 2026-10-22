"use client";

import { useState } from "react";
import { Briefcase } from "lucide-react";
import { Gate } from "@/components/gate";
import { TripCard } from "@/components/trip-card";
import { EmptyState, LinkButton, PageHeader, Segmented } from "@/components/ui";
import { today } from "@/lib/format";
import type { Booking } from "@/lib/types";
import { useApp } from "@/store/app-store";

const lastDay = (b: Booking) => b.segments[b.segments.length - 1].date;

export function TripsScreen() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const bookings = useApp((s) => s.bookings);

  return (
    <>
      <PageHeader eyebrow="Trips" title="Your flights" />
      <div className="mt-6">
        <Gate next="/trips/">
          {(user) => {
            const day = today();
            const mine = bookings.filter((b) => b.userId === user.id);
            const upcoming = mine
              .filter((b) => b.status !== "cancelled" && b.status !== "completed" && lastDay(b) >= day)
              .sort((a, b) => a.segments[0].date.localeCompare(b.segments[0].date));
            const past = mine.filter((b) => !upcoming.includes(b)).sort((a, b) => lastDay(b).localeCompare(lastDay(a)));
            const list = tab === "upcoming" ? upcoming : past;
            return (
              <>
                <Segmented
                  value={tab}
                  onChange={setTab}
                  options={[
                    { value: "upcoming", label: `Upcoming${upcoming.length ? ` · ${upcoming.length}` : ""}` },
                    { value: "past", label: "Past & cancelled" },
                  ]}
                />
                <div className="mt-5 grid gap-3">
                  {list.length ? (
                    list.map((b) => <TripCard key={b.id} booking={b} href={`/trips/view/?id=${b.id}`} />)
                  ) : (
                    <EmptyState
                      icon={<Briefcase className="h-5 w-5" />}
                      title={tab === "upcoming" ? "No upcoming trips" : "Nothing here yet"}
                      body={tab === "upcoming" ? "Get an instant quote or grab an empty leg." : undefined}
                      action={tab === "upcoming" ? <LinkButton href="/charter/">Plan a trip</LinkButton> : undefined}
                    />
                  )}
                </div>
              </>
            );
          }}
        </Gate>
      </div>
    </>
  );
}
