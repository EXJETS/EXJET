import test from "node:test";
import assert from "node:assert/strict";
import { matchFleet, parseFleetCatalog } from "../lib/charter-fleet.ts";
const record = (id, tail, seats, coverage) => ({
  id, tail, modelSlug: "citation-latitude", seats, category: "midsize", coverage,
});
const float = record("sample-floating", "N123AB", 8, { kind: "floating_us" });
const hou = record("sample-hou", "N456CD", 6, { kind: "home_base", airport: "KHOU" });
const yyz = record("sample-yyz", "N789EF", 8, { kind: "home_base", airport: "CYYZ" });
test("US departures show floating candidates plus only the matching airport's home-based aircraft", () => {
  const rows = parseFleetCatalog([hou, yyz, float]);
  assert.deepEqual(matchFleet(rows, "KHOU", 4), { floating: [], based: [hou] });
  assert.deepEqual(matchFleet(rows, "KHOU", 4, true), { floating: [float], based: [hou] });
  assert.deepEqual(matchFleet(rows, "KDAL", 4, true), { floating: [float], based: [] });
  assert.deepEqual(matchFleet(rows, "PHNL", 8, true), { floating: [float], based: [] });
  assert.deepEqual(matchFleet(rows, "PANC", 8, true), { floating: [float], based: [] });
  assert.deepEqual(matchFleet(rows, "KHOU", 7, true), { floating: [float], based: [] });
  assert.deepEqual(matchFleet(rows, " CYYZ ", 4, true), { floating: [], based: [yyz] });
  assert.deepEqual(matchFleet(rows, "Dallas", 4, true), { floating: [], based: [] });
});
test("unknown bases, bad categories, duplicates, private fields and over-capacity seats are not published", () => {
  const rows = parseFleetCatalog([null, { ...hou, tail: "HZ-SK3" }, { ...hou, tail: "N012" }, { ...float, secret: "private" }, float,
    { ...hou, coverage: { kind: "home_base", airport: "HOU" } },
    { ...hou, category: "__proto__" }, { ...hou, seats: 17 }, { ...hou, coverage: { kind: "unknown" } }]);
  assert.deepEqual(rows, [float]);
  assert.deepEqual(parseFleetCatalog({ fallback: [float] }), []);
});
