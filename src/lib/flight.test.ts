import { describe, expect, it } from "vitest";
import { charterOptions, distanceNm, estimateSegment, quoteCharter } from "@/lib/flight";
import { getAircraftType } from "@/lib/data/aircraft";

const seg = (from: string, to: string, date = "2027-01-10") => ({ from, to, date, time: "10:00" });

describe("distanceNm", () => {
  it("matches the known Teterboro–Van Nuys great-circle distance", () => {
    expect(distanceNm("KTEB", "KVNY")).toBeGreaterThan(2120);
    expect(distanceNm("KTEB", "KVNY")).toBeLessThan(2150);
  });
  it("returns 0 for unknown airports", () => {
    expect(distanceNm("XXXX", "KVNY")).toBe(0);
  });
});

describe("estimateSegment", () => {
  it("adds a fuel stop when a light jet flies coast to coast", () => {
    expect(estimateSegment(getAircraftType("citation-cj4")!, "KTEB", "KVNY").stops).toBe(1);
  });
  it("flies nonstop on a long-range jet", () => {
    expect(estimateSegment(getAircraftType("g650er")!, "KTEB", "KVNY").stops).toBe(0);
  });
});

describe("quoteCharter", () => {
  it("charges US excise tax on domestic legs only", () => {
    const dom = quoteCharter("challenger-350", [seg("KTEB", "KPBI")], 4)!;
    const intl = quoteCharter("challenger-350", [seg("EGLF", "LFMN")], 4)!;
    expect(dom.lines.some((l) => l.label.includes("Excise"))).toBe(true);
    expect(intl.lines.some((l) => l.label.includes("Excise"))).toBe(false);
  });
  it("bills a one-hour minimum", () => {
    const q = quoteCharter("phenom-300e", [seg("KVNY", "KSNA")], 2)!;
    expect(q.lines[0].amount).toBe(5200);
  });
  it("adds crew overnights between legs on different days", () => {
    const q = quoteCharter("g280", [seg("KTEB", "KASE", "2027-01-10"), seg("KASE", "KTEB", "2027-01-13")], 4)!;
    expect(q.lines.find((l) => l.label.startsWith("Crew"))?.amount).toBe(3600);
  });
  it("totals its lines", () => {
    const q = quoteCharter("g500", [seg("KTEB", "EGLF")], 6)!;
    expect(q.total).toBe(q.lines.reduce((s, l) => s + l.amount, 0));
  });
  it("rejects aircraft that are too small", () => {
    expect(quoteCharter("phenom-300e", [seg("KTEB", "KPBI")], 9)).toBeNull();
  });
});

describe("charterOptions", () => {
  it("is sorted cheapest first and respects passenger count", () => {
    const opts = charterOptions([seg("KTEB", "KPBI")], 10);
    expect(opts.length).toBeGreaterThan(0);
    expect(opts.every((o) => o.type.seats >= 10)).toBe(true);
    for (let i = 1; i < opts.length; i++) expect(opts[i].quote.total).toBeGreaterThanOrEqual(opts[i - 1].quote.total);
  });
  it("drops aircraft that would need more than two fuel stops", () => {
    const opts = charterOptions([seg("KVNY", "OMDW")], 2);
    expect(opts.every((o) => o.stops <= 2)).toBe(true);
    expect(opts.some((o) => o.type.category === "light")).toBe(false);
  });
});
