import { addDays } from "@/lib/format";
import { quoteCharter } from "@/lib/flight";
import type { Booking, EmptyLeg, FleetAircraft, Operator, User } from "@/lib/types";

// Demo dataset. Dates are generated relative to "today" when the store is
// first created, so the demo never shows an inventory of departed flights.

export const SEED_OPERATORS: Operator[] = [
  { id: "op-atlantic", name: "Atlantic Executive", base: "KTEB", safetyRating: "ARGUS Platinum", verified: true },
  { id: "op-pacific", name: "Pacific Coast Jets", base: "KVNY", safetyRating: "Wyvern Wingman", verified: true },
  { id: "op-riviera", name: "Riviera Aviation", base: "LFMN", safetyRating: "IS-BAO Stage 3", verified: true },
  { id: "op-gulf", name: "Gulf Private Aviation", base: "OMDW", safetyRating: "IS-BAO Stage 3", verified: true },
  { id: "op-island", name: "Island Hop Air", base: "KOPF", safetyRating: "ARGUS Gold", verified: false },
];

export const SEED_FLEET: FleetAircraft[] = [
  { id: "fl-1", tail: "N350AE", typeId: "challenger-350", operatorId: "op-atlantic", base: "KTEB", yearOfManufacture: 2021 },
  { id: "fl-2", tail: "N650AE", typeId: "challenger-650", operatorId: "op-atlantic", base: "KTEB", yearOfManufacture: 2019 },
  { id: "fl-3", tail: "N7XAE", typeId: "g650er", operatorId: "op-atlantic", base: "KTEB", yearOfManufacture: 2022 },
  { id: "fl-4", tail: "N300PC", typeId: "phenom-300e", operatorId: "op-pacific", base: "KVNY", yearOfManufacture: 2023 },
  { id: "fl-5", tail: "N280PC", typeId: "g280", operatorId: "op-pacific", base: "KVNY", yearOfManufacture: 2020 },
  { id: "fl-6", tail: "N500PC", typeId: "praetor-500", operatorId: "op-pacific", base: "KSNA", yearOfManufacture: 2022 },
  { id: "fl-7", tail: "F-HRVA", typeId: "falcon-900lx", operatorId: "op-riviera", base: "LFMN", yearOfManufacture: 2018 },
  { id: "fl-8", tail: "F-HCJ4", typeId: "citation-cj4", operatorId: "op-riviera", base: "LFMN", yearOfManufacture: 2021 },
  { id: "fl-9", tail: "A6-GPA", typeId: "global-6000", operatorId: "op-gulf", base: "OMDW", yearOfManufacture: 2017 },
  { id: "fl-10", tail: "A6-GPB", typeId: "g500", operatorId: "op-gulf", base: "OMDW", yearOfManufacture: 2021 },
  { id: "fl-11", tail: "N560IH", typeId: "citation-xls", operatorId: "op-island", base: "KOPF", yearOfManufacture: 2016 },
];

export const DEMO_USERS: User[] = [
  { id: "u-client", name: "Alex Morgan", email: "alex@example.com", phone: "+1 212 555 0148", role: "client", createdAt: "2026-01-04T10:00:00.000Z" },
  { id: "u-operator", name: "Jordan Lee", email: "ops@atlanticexec.example", phone: "+1 201 555 0190", role: "operator", operatorId: "op-atlantic", createdAt: "2026-01-04T10:00:00.000Z" },
  { id: "u-admin", name: "EXJET Admin", email: "admin@exjet.com", phone: "+1 305 555 0100", role: "admin", createdAt: "2026-01-04T10:00:00.000Z" },
];

type LegSeed = [from: string, to: string, inDays: number, time: string, fleetId: string, price: number, flex: number];

const LEG_SEEDS: LegSeed[] = [
  ["KPBI", "KTEB", 1, "11:00", "fl-1", 9800, 2],
  ["KVNY", "KSJC", 1, "16:30", "fl-4", 3900, 1],
  ["KOPF", "MYNN", 2, "09:45", "fl-11", 3400, 2],
  ["LFMN", "LIML", 2, "17:30", "fl-8", 3300, 0],
  ["KTEB", "KASE", 3, "08:30", "fl-2", 17500, 3],
  ["KSNA", "MMSD", 4, "10:40", "fl-6", 7900, 2],
  ["LFPB", "LIEO", 4, "12:15", "fl-7", 11200, 2],
  ["OMDW", "OERK", 5, "19:00", "fl-10", 16800, 4],
  ["KVNY", "KLAS", 5, "14:00", "fl-5", 4200, 1],
  ["TNCM", "KOPF", 6, "12:00", "fl-11", 8700, 3],
  ["KTEB", "EGLF", 7, "21:30", "fl-3", 52000, 6],
  ["LSGG", "EGGW", 8, "09:15", "fl-8", 6100, 2],
  ["KAPF", "KBOS", 9, "11:30", "fl-1", 10400, 2],
  ["EGLF", "OMDW", 10, "22:00", "fl-9", 49500, 6],
  ["KASE", "KDAL", 11, "15:20", "fl-2", 9900, 3],
  ["KTRK", "KVNY", 12, "13:10", "fl-4", 3100, 2],
  ["LIRA", "LGMK", 14, "10:00", "fl-7", 9400, 4],
  ["KPBI", "TFFJ", 16, "09:00", "fl-1", 14900, 2],
];

export function seedEmptyLegs(day: string): EmptyLeg[] {
  const createdAt = new Date().toISOString();
  return LEG_SEEDS.map(([from, to, inDays, time, fleetId, price, flex], i) => ({
    id: `el-${i + 1}`,
    operatorId: SEED_FLEET.find((f) => f.id === fleetId)!.operatorId,
    fleetId,
    from,
    to,
    date: addDays(day, inDays),
    time,
    flexHours: flex,
    price,
    status: "available",
    createdAt,
  }));
}

export function seedBookings(day: string): Booking[] {
  const mk = (
    id: string,
    ref: string,
    typeId: string,
    segs: [string, string, number, string][],
    pax: number,
    status: Booking["status"],
    operatorId?: string
  ): Booking => {
    const segments = segs.map(([from, to, d, time]) => ({ from, to, date: addDays(day, d), time }));
    return {
      id,
      ref,
      userId: "u-client",
      kind: "charter",
      typeId,
      operatorId,
      segments,
      pax,
      passengers: [],
      contact: { name: "Alex Morgan", email: "alex@example.com", phone: "+1 212 555 0148" },
      notes: "",
      quote: quoteCharter(typeId, segments, pax) ?? { lines: [], total: 0 },
      status,
      createdAt: new Date().toISOString(),
    };
  };
  return [
    mk("bk-seed-1", "EXJ-4MQ8TR", "challenger-350", [["KTEB", "KPBI", 9, "09:00"], ["KPBI", "KTEB", 13, "17:00"]], 4, "confirmed", "op-atlantic"),
    mk("bk-seed-2", "EXJ-9HWK2C", "phenom-300e", [["KVNY", "KLAS", -21, "12:00"]], 3, "completed", "op-pacific"),
  ];
}
