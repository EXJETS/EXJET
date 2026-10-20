import test from "node:test";
import assert from "node:assert/strict";
import { selectedLabel } from "../components/selection.ts";

test("contact selections accept known aircraft and reject unknown URL values", () => {
  const options = { "citation-latitude": "Citation Latitude" };
  assert.equal(selectedLabel(options, "citation-latitude"), "Citation Latitude");
  for (const key of [null, "", "unknown", "__proto__", "constructor", "toString", "hasOwnProperty"]) {
    assert.equal(selectedLabel(options, key), "");
  }
});

test("inherited or malformed options cannot become contact-page content", () => {
  const options = Object.create({ "citation-latitude": "Inherited aircraft" });
  options.invalid = { name: "Not a label" };
  assert.equal(selectedLabel(options, "citation-latitude"), "");
  assert.equal(selectedLabel(options, "invalid"), "");
});
