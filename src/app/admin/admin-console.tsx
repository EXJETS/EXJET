"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Gate } from "@/components/gate";
import { Stat } from "@/components/stat";
import { Button, Card, PageHeader, Segmented, Select, StatusBadge } from "@/components/ui";
import { getAircraftType } from "@/lib/data/aircraft";
import { getAirport } from "@/lib/data/airports";
import { money, shortDate } from "@/lib/format";
import { departureTime } from "@/lib/legs";
import type { BookingStatus } from "@/lib/types";
import { useApp } from "@/store/app-store";

type Tab = "bookings" | "legs" | "operators" | "users";
const STATUSES: BookingStatus[] = ["requested", "confirmed", "completed", "cancelled"];

const code = (icao: string) => getAirport(icao)?.iata ?? icao;

export function AdminConsole() {
  return <Gate role="admin" next="/admin/">{() => <Console />}</Gate>;
}

function Console() {
  const { bookings, emptyLegs, operators, users, fleet } = useApp();
  const setBookingStatus = useApp((s) => s.setBookingStatus);
  const setLegStatus = useApp((s) => s.setEmptyLegStatus);
  const setVerified = useApp((s) => s.setOperatorVerified);
  const [tab, setTab] = useState<Tab>("bookings");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");

  const gmv = bookings.filter((b) => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + b.quote.total, 0);
  const live = emptyLegs.filter((l) => l.status === "available" && departureTime(l) > Date.now());
  const shown = bookings
    .filter((b) => statusFilter === "all" || b.status === statusFilter)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const opName = (id?: string) => operators.find((o) => o.id === id)?.name ?? "Unassigned";

  return (
    <>
      <PageHeader eyebrow="Admin" title="Marketplace overview" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Booked value" value={money(gmv)} sub="confirmed + completed" />
        <Stat label="Open requests" value={String(bookings.filter((b) => b.status === "requested").length)} />
        <Stat label="Live empty legs" value={String(live.length)} />
        <Stat label="Accounts" value={String(users.length)} sub={`${operators.length} operators`} />
      </div>

      <Segmented
        className="mt-8"
        value={tab}
        onChange={setTab}
        options={[
          { value: "bookings", label: "Bookings" },
          { value: "legs", label: "Empty legs" },
          { value: "operators", label: "Operators" },
          { value: "users", label: "Users" },
        ]}
      />

      <Card className="mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          {tab === "bookings" && (
            <>
              <div className="flex items-center gap-3 border-b border-line p-3">
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "all")} className="h-9 w-auto text-[14px]">
                  <option value="all">All statuses</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </Select>
                <span className="text-[13px] text-muted">{shown.length} bookings</span>
              </div>
              <Table head={["Ref", "Route", "Date", "Aircraft", "Operator", "Total", "Status"]}>
                {shown.map((b) => (
                  <tr key={b.id}>
                    <Td mono>
                      <Link href={`/trips/view/?id=${b.id}`} className="underline-offset-2 hover:underline">
                        {b.ref}
                      </Link>
                    </Td>
                    <Td>{b.segments.map((s) => code(s.from)).concat(code(b.segments[b.segments.length - 1].to)).join(" → ")}</Td>
                    <Td>{shortDate(b.segments[0].date)}</Td>
                    <Td>{getAircraftType(b.typeId)?.name}</Td>
                    <Td>{opName(b.operatorId)}</Td>
                    <Td>{money(b.quote.total)}</Td>
                    <Td>
                      <Select
                        aria-label={`Status for ${b.ref}`}
                        value={b.status}
                        onChange={(e) => setBookingStatus(b.id, e.target.value as BookingStatus)}
                        className="h-8 w-32 rounded-full px-3 py-0 text-[13px] capitalize"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </Td>
                  </tr>
                ))}
              </Table>
            </>
          )}

          {tab === "legs" && (
            <Table head={["Route", "Departs", "Aircraft", "Operator", "Price", "Status", ""]}>
              {[...emptyLegs]
                .sort((a, b) => departureTime(a) - departureTime(b))
                .map((l) => {
                  const f = fleet.find((x) => x.id === l.fleetId);
                  return (
                    <tr key={l.id}>
                      <Td>
                        <Link href={`/empty-legs/view/?id=${l.id}`} className="hover:underline">
                          {code(l.from)} → {code(l.to)}
                        </Link>
                      </Td>
                      <Td>
                        {shortDate(l.date)} {l.time}
                      </Td>
                      <Td>{f ? `${f.tail} · ${getAircraftType(f.typeId)?.name}` : "—"}</Td>
                      <Td>{opName(l.operatorId)}</Td>
                      <Td>{money(l.price)}</Td>
                      <Td>
                        <StatusBadge status={l.status} />
                      </Td>
                      <Td>
                        {l.status === "available" && (
                          <Button size="sm" variant="ghost" onClick={() => setLegStatus(l.id, "withdrawn")}>
                            Pull listing
                          </Button>
                        )}
                      </Td>
                    </tr>
                  );
                })}
            </Table>
          )}

          {tab === "operators" && (
            <Table head={["Operator", "Base", "Safety", "Fleet", "Legs listed", "Verified"]}>
              {operators.map((o) => (
                <tr key={o.id}>
                  <Td>
                    <span className="inline-flex items-center gap-1.5">
                      {o.name}
                      {o.verified && <BadgeCheck className="h-4 w-4 text-success" />}
                    </span>
                  </Td>
                  <Td>{code(o.base)}</Td>
                  <Td>{o.safetyRating}</Td>
                  <Td>{fleet.filter((f) => f.operatorId === o.id).length}</Td>
                  <Td>{emptyLegs.filter((l) => l.operatorId === o.id).length}</Td>
                  <Td>
                    <Button size="sm" variant={o.verified ? "secondary" : "primary"} onClick={() => setVerified(o.id, !o.verified)}>
                      {o.verified ? "Revoke" : "Verify"}
                    </Button>
                  </Td>
                </tr>
              ))}
            </Table>
          )}

          {tab === "users" && (
            <Table head={["Name", "Email", "Role", "Bookings", "Joined"]}>
              {users.map((u) => (
                <tr key={u.id}>
                  <Td>{u.name}</Td>
                  <Td>{u.email}</Td>
                  <Td>
                    <span className="capitalize">{u.role}</span>
                  </Td>
                  <Td>{bookings.filter((b) => b.userId === u.id).length}</Td>
                  <Td>{new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</Td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </Card>
    </>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full min-w-[720px] text-left text-[14px]">
      <thead className="bg-canvas text-[12px] text-muted">
        <tr>
          {head.map((h, i) => (
            <th key={i} className="px-4 py-2.5 font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-line">{children}</tbody>
    </table>
  );
}

function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return <td className={`whitespace-nowrap px-4 py-3 ${mono ? "font-mono text-[13px]" : ""}`}>{children}</td>;
}
