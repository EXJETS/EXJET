import test from "node:test";
import assert from "node:assert/strict";
import { contentSearchItem, searchItems } from "../data/search.ts";

const page = {
  path: "/guides/maintenance", title: "Maintenance planning", description: "Compare providers", kicker: "Aircraft owners",
  sections: [{ heading: "Scope", paragraphs: ["Obtain a written proposal."], bullets: ["Core return conditions"],
    table: { caption: "Cost checklist", headers: ["Item", "Check"], rows: [["Labor", "Overtime terms"]] } }],
  facts: [{label: "Airport", value: "KDAL"}],
  faqs: [{ question: "Can the schedule change?", answer: "Material availability affects delivery." }],
};
test("finds visible bullet, table, FAQ and fact content", () => {
  const items = [contentSearchItem(page)];
  for (const query of ["core return", "overtime", "material availability", "kdal"]) {
    assert.equal(searchItems(items, query)[0]?.path, page.path, query);
  }
});
test("requires all query words and ranks title matches first", () => {
  const bodyMatch = contentSearchItem(page);
  const titleMatch = { path: "/labor", title: "Overtime terms", description: "Labor guide" };
  assert.deepEqual(searchItems([bodyMatch, titleMatch], "overtime terms").map(x => x.path), ["/labor", page.path]);
  assert.deepEqual(searchItems([bodyMatch], "overtime nonexistent"), []);
});
test("search handles typographic dashes and accents consistently", () => {
  const item = {path:"/cote", title:"Côte d’Azur – cabin Wi‑Fi", description:"Travel"};
  assert.equal(searchItems([item], "cote wi-fi")[0]?.path, item.path);
});
test("empty search includes owner hub without returning every page", () => {
  const items = [{path:"/aircraft-owners", title:"Owners", description:""}, {path:"/other", title:"Other", description:""}];
  assert.deepEqual(searchItems(items, "  ").map(x=>x.path), ["/aircraft-owners"]);
});
