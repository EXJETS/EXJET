import test from "node:test";
import assert from "node:assert/strict";
import { parseInquiry } from "../lib/inquiry-validation.ts";

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
const future = new Date(`${today}T12:00:00Z`);
future.setUTCDate(future.getUTCDate() + 14);
const date = future.toISOString().slice(0, 10);

const quote = {
  intent: "charter",
  departure: "Dallas",
  destination: "Teterboro",
  date,
  returnDate: "flexible return",
  passengers: "4",
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+1 407 747 5288",
  notes: "Two bags",
};

test("a complete quote request passes validation", () => {
  const parsed = parseInquiry(quote);
  assert.equal(parsed?.intent, "charter");
  assert.equal(parsed?.passengers, 4);
  assert.equal(parsed?.email, "ada@example.com");
});

test("quote requests require a route, a future date, and contact details", () => {
  assert.equal(parseInquiry({ ...quote, destination: "Dallas" }), null);
  assert.equal(parseInquiry({ ...quote, date: "2020-01-01" }), null);
  assert.equal(parseInquiry({ ...quote, email: "not-an-email" }), null);
  assert.equal(parseInquiry({ ...quote, phone: "12" }), null);
  assert.equal(parseInquiry({ ...quote, name: "A" }), null);
  assert.equal(parseInquiry({ ...quote, passengers: "0" }), null);
});

test("contact, sales, and operator notes do not require a route", () => {
  const contact = parseInquiry({ intent: "contact", name: "Zakaria Yasin", email: "owner@exjet.com", phone: "4077475288", notes: "Call after 2" });
  assert.equal(contact?.intent, "contact");
  assert.equal(parseInquiry({ intent: "sales", name: "Buyer", email: "buyer@example.com", phone: "(214) 555-0100", aircraft: "Citation M2" })?.aircraft, "Citation M2");
  assert.equal(parseInquiry({ intent: "operator", name: "Ops", email: "ops@example.com", phone: "+1-214-555-0199", organization: "Example Air" })?.organization, "Example Air");
});

test("a large charter party is routed as a group request", () => {
  assert.equal(parseInquiry({ ...quote, passengers: 24 })?.intent, "group");
});

test("the honeypot is preserved for the caller to suppress", () => {
  assert.equal(parseInquiry({ ...quote, website: "https://spam.example" })?.website, "https://spam.example");
});
