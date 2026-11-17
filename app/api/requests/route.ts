import { createAvinodeLead, avinodeStatus, resolveAvinodeAirport } from "@/integration/avinode/client";
import { siteConfig } from "@/data/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestMode = "charter" | "group" | "cargo";
type IntakeRequest = {
  mode: RequestMode;
  departure: string;
  departureIcao?: string;
  destination: string;
  destinationIcao?: string;
  date: string;
  time?: string;
  passengers?: number;
  cargoType?: string;
  name: string;
  email: string;
  phone: string;
  contactPreference: "text" | "call" | "email";
  notes?: string;
  source?: string;
  website?: string;
};

type DispatchResult = { provider: string; ok: boolean };

const attempts = new Map<string, number[]>();

function clean(value: unknown, max = 500) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}

function requestId() {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `EXJ-${date}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

function parseRequest(value: unknown): IntakeRequest | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const mode = raw.mode;
  if (mode !== "charter" && mode !== "group" && mode !== "cargo") return null;

  const passengers = Number(raw.passengers);
  const submittedDate = clean(raw.date, 10);
  const parsed: IntakeRequest = {
    mode,
    departure: clean(raw.departure, 120),
    departureIcao: clean(raw.departureIcao, 4).toUpperCase() || undefined,
    destination: clean(raw.destination, 120),
    destinationIcao: clean(raw.destinationIcao, 4).toUpperCase() || undefined,
    date: submittedDate,
    time: clean(raw.time, 5) || undefined,
    passengers: Number.isFinite(passengers) ? passengers : undefined,
    cargoType: clean(raw.cargoType, 160) || undefined,
    name: clean(raw.name, 100),
    email: clean(raw.email, 180).toLowerCase(),
    phone: clean(raw.phone, 40),
    contactPreference: raw.contactPreference === "call" || raw.contactPreference === "email" ? raw.contactPreference : "text",
    notes: clean(raw.notes, 2_500) || undefined,
    source: clean(raw.source, 180) || undefined,
    website: clean(raw.website, 120) || undefined,
  };

  const dateValid = /^\d{4}-\d{2}-\d{2}$/.test(submittedDate) && !Number.isNaN(Date.parse(`${submittedDate}T12:00:00Z`));
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.email);
  const phoneValid = parsed.phone.replace(/\D/g, "").length >= 7;
  const missionValid = parsed.departure.length >= 2 && parsed.destination.length >= 2 && dateValid;
  const today = new Date().toISOString().slice(0, 10);
  const dateNotPast = submittedDate >= today;
  if (parsed.mode === "charter" && parsed.passengers && parsed.passengers > 18) parsed.mode = "group";
  const modeValid = parsed.mode === "cargo" ? Boolean(parsed.cargoType) : Boolean(parsed.passengers && parsed.passengers >= 1 && parsed.passengers <= 100);
  return missionValid && dateNotPast && modeValid && parsed.name.length >= 2 && emailValid && phoneValid ? parsed : null;
}

function throttled(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (attempts.get(forwarded) ?? []).filter((timestamp) => now - timestamp < 10 * 60_000);
  recent.push(now);
  attempts.set(forwarded, recent);
  return recent.length > 8;
}

function deskFor(mode: RequestMode) {
  return mode === "cargo" ? siteConfig.email.cargo : siteConfig.email.charter;
}

function subjectFor(mode: RequestMode, id: string) {
  const label = mode === "cargo" ? "Cargo" : mode === "group" ? "Group charter" : "Private charter";
  return `${label} request ${id}`;
}

function details(input: IntakeRequest, id: string) {
  const fields: Array<[string, string | number | undefined]> = [
    ["Reference", id],
    ["Request", input.mode === "cargo" ? "Cargo charter" : input.mode === "group" ? "Group charter" : "Private charter"],
    ["From", input.departureIcao ? `${input.departure} (${input.departureIcao})` : input.departure],
    ["To", input.destinationIcao ? `${input.destination} (${input.destinationIcao})` : input.destination],
    ["Date", input.date],
    ["Time", input.time || "To be confirmed"],
    [input.mode === "cargo" ? "Cargo" : "Passengers", input.mode === "cargo" ? input.cargoType : input.passengers],
    ["Name", input.name],
    ["Mobile", input.phone],
    ["Email", input.email],
    ["Preferred reply", input.contactPreference],
    ["Notes", input.notes || "None supplied"],
    ["Source", input.source || "EXJET website"],
  ];
  return fields.filter(([, value]) => value !== undefined) as Array<[string, string | number]>;
}

async function sendEmail(input: IntakeRequest, id: string): Promise<DispatchResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { provider: "email", ok: false };
  const fields = details(input, id);
  const rows = fields.map(([label, value]) => `<tr><td style="padding:8px 18px 8px 0;color:#73767b;font-size:12px;vertical-align:top">${escapeHtml(label)}</td><td style="padding:8px 0;color:#0b0c0e;font-size:14px">${escapeHtml(String(value))}</td></tr>`).join("");
  const text = fields.map(([label, value]) => `${label}: ${value}`).join("\n");
  const recipientConfig = input.mode === "cargo"
    ? process.env.RFQ_CARGO_RECIPIENTS
    : process.env.RFQ_CHARTER_RECIPIENTS;
  const recipients = (recipientConfig || deskFor(input.mode)).split(",").map((item) => item.trim()).filter(Boolean);
  const from = process.env.RFQ_FROM_EMAIL || "EXJET Flight Desk <requests@exjet.com>";

  const internal = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: recipients,
      reply_to: input.email,
      subject: subjectFor(input.mode, id),
      text,
      html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto"><p style="font-size:11px;letter-spacing:2px;color:#73767b">NEW EXJET REQUEST</p><h1 style="font-size:32px;font-weight:400">${escapeHtml(subjectFor(input.mode, id))}</h1><table style="width:100%;border-collapse:collapse">${rows}</table></div>`,
    }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!internal.ok) return { provider: "email", ok: false };

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [input.email],
      reply_to: deskFor(input.mode),
      subject: `EXJET has received your request · ${id}`,
      text: `Hello ${input.name},\n\nYour request has been received. An EXJET advisor is reviewing your mission and will contact you ${siteConfig.responseWindow}.\n\nReference: ${id}\nRoute: ${input.departure} to ${input.destination}\nDate: ${input.date}\n\nFor an urgent request, call ${siteConfig.phone.primary.display}.\n\nEXJET\nGlobal Access, On-Demand.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#0b0c0e"><p style="font-size:11px;letter-spacing:2px;color:#73767b">EXJET · GLOBAL ACCESS, ON-DEMAND</p><h1 style="font-size:34px;font-weight:400">Request received.</h1><p>Hello ${escapeHtml(input.name)},</p><p style="line-height:1.7">An EXJET advisor is reviewing your mission and will contact you ${siteConfig.responseWindow}.</p><div style="margin:28px 0;padding:20px;border:1px solid #d7d8da"><strong>${escapeHtml(id)}</strong><br><span style="color:#73767b">${escapeHtml(input.departure)} to ${escapeHtml(input.destination)} · ${escapeHtml(input.date)}</span></div><p style="font-size:13px;color:#73767b">Urgent request? Call <a href="${siteConfig.phone.primary.href}" style="color:#0b0c0e">${siteConfig.phone.primary.display}</a>.</p></div>`,
    }),
    signal: AbortSignal.timeout(12_000),
  }).catch(() => undefined);
  return { provider: "email", ok: true };
}

async function sendSms(input: IntakeRequest, id: string): Promise<DispatchResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const recipients = process.env.RFQ_ALERT_PHONE_NUMBERS?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
  if (!sid || !token || !from || recipients.length === 0) return { provider: "sms", ok: false };

  const message = `${id}: ${input.mode.toUpperCase()} ${input.departure} → ${input.destination}, ${input.date}. ${input.name}, ${input.phone}. Reply preference: ${input.contactPreference}.`;
  const results = await Promise.all(recipients.map(async (to) => {
    const body = new URLSearchParams({ From: from, To: to, Body: message });
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(12_000),
    });
    return response.ok;
  }));
  return { provider: "sms", ok: results.some(Boolean) };
}

async function sendWebhook(input: IntakeRequest, id: string): Promise<DispatchResult> {
  if (!process.env.LEAD_WEBHOOK_URL) return { provider: "webhook", ok: false };
  const response = await fetch(process.env.LEAD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.LEAD_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.LEAD_WEBHOOK_TOKEN}` } : {}),
    },
    body: JSON.stringify({ id, receivedAt: new Date().toISOString(), ...input, website: undefined }),
    signal: AbortSignal.timeout(12_000),
  });
  return { provider: "webhook", ok: response.ok };
}

async function sendAvinode(input: IntakeRequest, id: string): Promise<DispatchResult> {
  if (input.mode === "cargo" || !avinodeStatus().enabled) {
    return { provider: "avinode", ok: false };
  }
  const [startAirport, endAirport] = await Promise.all([
    input.departureIcao
      ? Promise.resolve({ icao: input.departureIcao, name: input.departure })
      : resolveAvinodeAirport(input.departure),
    input.destinationIcao
      ? Promise.resolve({ icao: input.destinationIcao, name: input.destination })
      : resolveAvinodeAirport(input.destination),
  ]);
  if (!startAirport || !endAirport) return { provider: "avinode", ok: false };
  await createAvinodeLead({
    mode: input.mode,
    contact: { name: input.name, email: input.email, phone: input.phone },
    segments: [{
      startAirport,
      endAirport,
      departureDate: input.date,
      departureTime: input.time || "12:00",
      passengers: input.passengers || 1,
    }],
    notes: input.notes,
    clientIdentifier: id,
    domainName: "exjet.com",
  });
  return { provider: "avinode", ok: true };
}

export async function POST(request: Request) {
  if (throttled(request)) return Response.json({ error: "Too many requests. Please call EXJET for immediate assistance." }, { status: 429 });

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 24_000) return Response.json({ error: "Request is too large." }, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const input = parseRequest(body);
  if (!input) return Response.json({ error: "Please review the required trip and contact details." }, { status: 400 });
  if (input.website) return Response.json({ ok: true, reference: requestId() });

  const id = requestId();
  const providers = await Promise.all([
    sendEmail(input, id).catch(() => ({ provider: "email", ok: false })),
    sendSms(input, id).catch(() => ({ provider: "sms", ok: false })),
    sendWebhook(input, id).catch(() => ({ provider: "webhook", ok: false })),
    sendAvinode(input, id).catch(() => ({ provider: "avinode", ok: false })),
  ]);
  const durable = providers.some((result) => result.ok && result.provider !== "sms");
  if (!durable) {
    return Response.json({ error: "Online intake is being connected. Please call or email the EXJET flight desk." }, { status: 503 });
  }

  return Response.json({ ok: true, reference: id }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
