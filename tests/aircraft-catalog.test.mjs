import assert from "node:assert/strict";
import test from "node:test";
import { approvedAircraft } from "../data/approved-aircraft.ts";

test("approved catalogue contains 72 distinct route-safe profile slugs", () => {
  assert.equal(approvedAircraft.length, 72);
  assert.equal(new Set(approvedAircraft.map(item => item.slug)).size, 72);
  for (const item of approvedAircraft) {
    assert.match(item.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(item.name && item.category && item.maker);
  }
});

test("published figures have a source and example family ranges identify their basis", () => {
  for (const item of approvedAircraft) {
    if (item.rangeNm !== undefined) {
      assert.ok(Number.isFinite(item.rangeNm) && item.rangeNm > 0, item.slug);
      if (item.family) assert.ok(item.rangeBasis, item.slug);
    }
    if (item.rangeNm !== undefined || item.maxPassengers !== undefined || item.configurationSeats !== undefined || item.maxSpeed || item.ceiling || item.cabin || item.baggage) {
      assert.ok(item.source?.label, item.slug);
      assert.match(item.source?.url ?? "", /^https:\/\//, item.slug);
    }
  }
});

test("VIP airliner profiles remain request-only", () => {
  const vip = approvedAircraft.filter(item => item.category === "VIP airliner");
  assert.ok(vip.length > 0);
  for (const item of vip) assert.equal(item.requestOnly, true, item.slug);
});
