import { describe, expect, it } from "vitest";
import { decodeItinerary, encodeItinerary, validateItinerary, type Itinerary } from "@/lib/itinerary";

const it1: Itinerary = {
  trip: "round-trip",
  pax: 4,
  segments: [
    { from: "KTEB", to: "KPBI", date: "2027-01-10", time: "09:00" },
    { from: "KPBI", to: "KTEB", date: "2027-01-14", time: "17:30" },
  ],
};

describe("itinerary encoding", () => {
  it("round-trips through the URL", () => {
    expect(decodeItinerary(new URLSearchParams(encodeItinerary(it1)))).toEqual(it1);
  });
  it("rejects unknown airports", () => {
    expect(decodeItinerary(new URLSearchParams("legs=KTEB.ZZZZ.2027-01-10.09:00"))).toBeNull();
  });
  it("clamps passengers", () => {
    expect(decodeItinerary(new URLSearchParams("pax=99&legs=KTEB.KPBI.2027-01-10.09:00"))?.pax).toBe(19);
  });
});

describe("validateItinerary", () => {
  it("accepts a valid trip", () => {
    expect(validateItinerary(it1, "2027-01-01")).toBeNull();
  });
  it("rejects past dates and out-of-order legs", () => {
    expect(validateItinerary(it1, "2027-01-11")).toMatch(/past/);
    const swapped = { ...it1, segments: [it1.segments[1], it1.segments[0]] };
    expect(validateItinerary(swapped, "2027-01-01")).toMatch(/before/);
  });
});
