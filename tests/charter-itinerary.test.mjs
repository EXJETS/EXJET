import { deepEqual, equal, ok } from "node:assert/strict";
import { test } from "node:test";
import { civilDate, legLabel, parseItinerary } from "../app/api/requests/itinerary.ts";

const today = "2026-11-23";
const aliases = new Map([["DAL", "KDAL"], ["KDAL", "KDAL"], ["DALLAS LOVE FIELD", "KDAL"], ["TEB", "KTEB"]]);
const flight = { departure: "Dallas Love Field", destination: "TEB", departureIcao: "kdal", date: today, time: "09:00" };
const returnLeg = { departure: "TEB", destination: "DAL", date: "2026-11-25", time: "" };
const parse = (changes = {}) => {
  const raw = { tripType: "one_way", aircraftCategory: "midsize", passengers: "8", legs: [flight], ...changes };
  return parseItinerary(raw, Number(raw.passengers), today, aliases);
};

test("one-way preserves full details and canonicalizes codes", () => {
  const plan = parse();
  equal(plan.aircraftCategory, "midsize");
  deepEqual(plan.legs, [{ ...flight, departureIcao: "KDAL", destinationIcao: "KTEB" }]);
  equal(legLabel(plan.legs[0]), "Dallas Love Field (KDAL) to TEB (KTEB) · 2026-11-23 · 09:00 local");
});

test("round trip requires exactly reversed endpoints", () => {
  ok(parse({ tripType: "round_trip", legs: [flight, returnLeg] }));
  equal(parse({ tripType: "round_trip", legs: [flight, { ...returnLeg, destination: "MIA" }] }), null);
  equal(parse({ tripType: "round_trip", legs: [flight] }), null);
  equal(parse({ legs: [flight, returnLeg] }), null);
});

test("checks category capacity and permits category-free group passengers only above 16", () => {
  for (const [aircraftCategory, cap] of [["midsize", 8], ["large", 9], ["heavy", 13], ["ulr", 16]]) {
    ok(parse({ aircraftCategory, passengers: cap }));
    equal(parse({ aircraftCategory, passengers: cap + 1 }), null);
  }
  ok(parse({ aircraftCategory: "", passengers: 17 }));
  equal(parse({ aircraftCategory: undefined, passengers: 16 }), null);
  equal(parse({ aircraftCategory: "light" }), null);
  equal(parse({ aircraftCategory: "__proto__" }), null);
  equal(parse({ passengers: 2.5 }), null);
  equal(parse({ passengers: "1e1", aircraftCategory: "ulr" }), null);
  equal(parse({ passengers: 101, aircraftCategory: "" }), null);
});

test("rejects same airport aliases, malformed values and impossible civil dates", () => {
  equal(parse({ legs: [{ ...flight, destination: "DAL" }] }), null);
  equal(parse({ legs: [{ ...flight, departureIcao: "toolong" }] }), null);
  for (const date of ["2026-11-22", "2026-02-30", "2027-04-31", "2027-06-09Z"]) equal(parse({ legs: [{ ...flight, date }] }), null);
  for (const time of ["24:00", "12:60", "09:00Z", "9:00", 900]) equal(parse({ legs: [{ ...flight, time }] }), null);
  equal(civilDate("2028-02-29"), true);
});

test("2–6 legs must be in civil order, including known times across an untimed leg", () => {
  const later = { ...flight, destination: "MIA", date: today, time: "16:30" };
  const untimed = { ...flight, time: "" };
  ok(parse({ tripType: "multi_leg", legs: [flight, untimed, later] }));
  equal(parse({ tripType: "multi_leg", legs: [later, untimed, flight] }), null);
  ok(parse({ tripType: "round_trip", legs: [flight, { ...returnLeg, date: today, time: "08:30" }] }));
  equal(parse({ tripType: "multi_leg", legs: [returnLeg, flight] }), null);
  equal(parse({ tripType: "multi_leg", legs: [flight] }), null);
  equal(parse({ tripType: "multi_leg", legs: Array(7).fill(flight) }), null);
  equal(parse({ tripType: "invalid" }), null);
});
