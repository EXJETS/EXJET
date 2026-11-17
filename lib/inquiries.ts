import { createAvinodeLead, avinodeStatus, resolveAvinodeAirport } from "@/integration/avinode/client";
import { siteConfig } from "@/data/site";
import { conversionEvent, fieldsFromForm, parseInquiry, type Inquiry, type InquiryIntent } from "./inquiry-validation";

export { conversionEvent, fieldsFromForm, parseInquiry };
export type { Inquiry, InquiryIntent };

export type InquiryResult =
  | { ok: true; reference: string; intent: InquiryIntent; suppressed?: boolean }
  | { ok: false; status: number; error: string };

const attempts = new Map<string, number[]>();

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

function inquiryReference() {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date()).slice(2).replaceAll("-", "");
  return `EXJ-${date}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

function throttled(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (attempts.get(forwarded) ?? []).filter((timestamp) => now - timestamp < 10 * 60_000);
  recent.push(now);
  attempts.set(forwarded, recent);
  return recent.length > 8;
}

function deskFor(intent: InquiryIntent) {
  if (intent === "cargo") return siteConfig.email.cargo;
  if (intent === "contact" || intent === "sales" || intent === "operator") return siteConfig.email.general;
  return siteConfig.email.charter;
}

function labelFor(intent: InquiryIntent) {
  return {
    charter: "Private charter",
    group: "Group charter",
    cargo: "Cargo charter",
    contact: "Contact",
    sales: "Aircraft sales",
    operator: "Operator introduction",
    "empty-leg": "Empty leg",
  }[intent];
}

function details(input: Inquiry, id: string) {
  const fields: Array<[string, string | number | undefined]> = [
    ["Reference", id],
    ["Request", labelFor(input.intent)],
    ["From", input.departure],
    ["To", input.destination],
    ["Departure date", input.date],
    ["Other dates", input.returnDate],
    ["Passengers", input.passengers],
    ["Cargo", input.cargoType],
    ["Aircraft", input.aircraft],
    ["Organization", input.organization],
    ["Name", input.name],
    ["Phone", input.phone],
    ["Email", input.email],
    ["Notes", input.notes || "None supplied"],
    ["Source", input.source || "EXJET website"],
  ];
  return fields.filter((entry): entry is [string, string | number] => entry[1] !== undefined && entry[1] !== "");
}

async function sendEmail(input: Inquiry, id: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const rows = details(input, id);
  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const htmlRows = rows.map(([label, value]) => `<tr><td style="padding:8px 18px 8px 0;color:#73767b;font-size:12px;vertical-align:top">${escapeHtml(label)}</td><td style="padding:8px 0;color:#0b0c0e;font-size:14px">${escapeHtml(String(value))}</td></tr>`).join("");
  const configured = input.intent === "cargo"
    ? process.env.RFQ_CARGO_RECIPIENTS
    : input.intent === "contact" || input.intent === "sales" || input.intent === "operator"
      ? process.env.RFQ_GENERAL_RECIPIENTS
      : process.env.RFQ_CHARTER_RECIPIENTS;
  const recipients = (configured || deskFor(input.intent)).split(",").map((item) => item.trim()).filter(Boolean);
  const from = process.env.RFQ_FROM_EMAIL || "EXJET Flight Desk <requests@exjet.com>";
  const subject = `${labelFor(input.intent)} request ${id}`;
  const internal = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: recipients,
      reply_to: input.email,
      subject,
      text,
      html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto"><p style="font-size:11px;letter-spacing:2px;color:#73767b">NEW EXJET REQUEST</p><h1 style="font-size:32px;font-weight:400">${escapeHtml(subject)}</h1><table style="width:100%;border-collapse:collapse">${htmlRows}</table></div>`,
    }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!internal.ok) return false;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [input.email],
      reply_to: deskFor(input.intent),
      subject: `EXJET has received your request · ${id}`,
      text: `Hello ${input.name},\n\nYour request has been received. An EXJET advisor will contact you ${siteConfig.responseWindow}.\n\nReference: ${id}\n\nFor an urgent request, call ${siteConfig.phone.primary.display}.\n\nEXJET\nGlobal Access, On-Demand.`,
    }),
    signal: AbortSignal.timeout(12_000),
  }).catch(() => undefined);
  return true;
}

async function sendSms(input: Inquiry, id: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const recipients = process.env.RFQ_ALERT_PHONE_NUMBERS?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
  if (!sid || !token || !from || recipients.length === 0) return false;
  const message = `${id}: ${labelFor(input.intent)} ${input.departure || ""} ${input.destination ? `→ ${input.destination}` : ""} ${input.date || ""}. ${input.name}, ${input.phone}.`.replace(/\s+/g, " ").trim();
  const results = await Promise.all(recipients.map(async (to) => {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ From: from, To: to, Body: message }),
      signal: AbortSignal.timeout(12_000),
    });
    return response.ok;
  }));
  return results.some(Boolean);
}

async function sendWebhook(input: Inquiry, id: string) {
  if (!process.env.LEAD_WEBHOOK_URL) return false;
  const response = await fetch(process.env.LEAD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.LEAD_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.LEAD_WEBHOOK_TOKEN}` } : {}),
    },
    body: JSON.stringify({ id, receivedAt: new Date().toISOString(), ...input, website: undefined }),
    signal: AbortSignal.timeout(12_000),
  });
  return response.ok;
}

async function sendAvinode(input: Inquiry, id: string) {
  if (input.intent === "cargo" || input.intent === "contact" || input.intent === "sales" || input.intent === "operator" || !avinodeStatus().enabled) return false;
  if (!input.departure || !input.destination || !input.date) return false;
  const [startAirport, endAirport] = await Promise.all([
    resolveAvinodeAirport(input.departure),
    resolveAvinodeAirport(input.destination),
  ]);
  if (!startAirport || !endAirport) return false;
  await createAvinodeLead({
    mode: input.intent === "group" ? "group" : "charter",
    contact: { name: input.name, email: input.email, phone: input.phone },
    segments: [{
      startAirport,
      endAirport,
      departureDate: input.date,
      departureTime: "12:00",
      passengers: input.passengers || 1,
    }],
    notes: [input.returnDate ? `Other dates: ${input.returnDate}` : "", input.notes || ""].filter(Boolean).join("\n"),
    clientIdentifier: id,
    domainName: "exjet.com",
  });
  return true;
}

export async function submitInquiry(request: Request, value: unknown): Promise<InquiryResult> {
  if (throttled(request)) return { ok: false, status: 429, error: "Too many requests. Please call EXJET for immediate assistance." };
  const input = parseInquiry(value);
  if (!input) return { ok: false, status: 400, error: "Please review the required details." };
  const reference = inquiryReference();
  if (input.website) return { ok: true, reference, intent: input.intent, suppressed: true };
  const delivered = await Promise.all([
    sendEmail(input, reference).catch(() => false),
    sendWebhook(input, reference).catch(() => false),
    sendAvinode(input, reference).catch(() => false),
    sendSms(input, reference).catch(() => false),
  ]);
  if (!delivered.slice(0, 3).some(Boolean)) {
    return { ok: false, status: 503, error: "Online intake is being connected. Please call or email the EXJET flight desk." };
  }
  return { ok: true, reference, intent: input.intent };
}
