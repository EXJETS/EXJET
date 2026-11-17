export const inquiryIntents = ["charter", "group", "cargo", "contact", "sales", "operator", "empty-leg"] as const;
export type InquiryIntent = (typeof inquiryIntents)[number];

export type Inquiry = {
  intent: InquiryIntent;
  departure?: string;
  destination?: string;
  date?: string;
  returnDate?: string;
  passengers?: number;
  cargoType?: string;
  name: string;
  email: string;
  phone: string;
  organization?: string;
  aircraft?: string;
  notes?: string;
  source?: string;
  website?: string;
};

function clean(value: unknown, max = 500) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value).slice(0, max);
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function dallasToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
}

function asIntent(value: unknown): InquiryIntent | null {
  return inquiryIntents.includes(value as InquiryIntent) ? (value as InquiryIntent) : null;
}

export function parseInquiry(value: unknown): Inquiry | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const intent = asIntent(raw.intent) || asIntent(raw.mode);
  if (!intent) return null;

  const passengers = Number(raw.passengers);
  const date = clean(raw.date, 10);
  const parsed: Inquiry = {
    intent,
    departure: clean(raw.departure, 120) || undefined,
    destination: clean(raw.destination, 120) || undefined,
    date: date || undefined,
    returnDate: clean(raw.returnDate, 80) || undefined,
    passengers: Number.isFinite(passengers) ? passengers : undefined,
    cargoType: clean(raw.cargoType, 160) || undefined,
    name: clean(raw.name, 100),
    email: clean(raw.email, 180).toLowerCase(),
    phone: clean(raw.phone, 40),
    organization: clean(raw.organization, 160) || undefined,
    aircraft: clean(raw.aircraft, 160) || undefined,
    notes: clean(raw.notes, 2_500) || undefined,
    source: clean(raw.source, 180) || undefined,
    website: clean(raw.website, 200) || undefined,
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.email);
  const phoneValid = parsed.phone.replace(/\D/g, "").length >= 7;
  if (parsed.name.length < 2 || !emailValid || !phoneValid) return null;

  const tripIntent = parsed.intent === "charter" || parsed.intent === "group" || parsed.intent === "cargo" || parsed.intent === "empty-leg";
  if (!tripIntent) return parsed;

  const dateValid = Boolean(parsed.date && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) && !Number.isNaN(Date.parse(`${parsed.date}T12:00:00Z`)));
  const routeValid = Boolean(parsed.departure && parsed.departure.length >= 2 && parsed.destination && parsed.destination.length >= 2);
  if (!dateValid || !routeValid || parsed.date! < dallasToday()) return null;
  if (parsed.departure!.toLowerCase() === parsed.destination!.toLowerCase()) return null;
  if (parsed.intent === "cargo") return parsed.cargoType ? parsed : null;
  if (!parsed.passengers || parsed.passengers < 1 || parsed.passengers > 100) return null;
  if (parsed.intent === "charter" && parsed.passengers > 18) parsed.intent = "group";
  return parsed;
}

export function fieldsFromForm(form: FormData) {
  const value: Record<string, string> = {};
  for (const [key, entry] of form.entries()) {
    if (typeof entry === "string" && !(key in value)) value[key] = entry;
  }
  return value;
}

export function conversionEvent(intent: InquiryIntent) {
  return intent === "contact" || intent === "sales" || intent === "operator" ? "contact_request" : "quote_request";
}
