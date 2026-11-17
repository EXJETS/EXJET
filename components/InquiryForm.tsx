import Link from "next/link";
import type { InquiryIntent } from "@/lib/inquiries";
import { siteConfig } from "@/data/site";

type InquiryFormProps = {
  intent: InquiryIntent;
  source: string;
  heading: string;
  intro: string;
  submitLabel?: string;
  showTrip?: boolean;
  organizationLabel?: string;
  aircraft?: string;
  id?: string;
};

export function InquiryForm({
  intent,
  source,
  heading,
  intro,
  submitLabel = "Request a quote",
  showTrip = false,
  organizationLabel,
  aircraft,
  id = "inquiry",
}: InquiryFormProps) {
  const trip = showTrip || intent === "charter" || intent === "cargo" || intent === "empty-leg" || intent === "group";
  return (
    <form id={id} className="inquiry-form" method="post" action="/api/requests/">
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="source" value={source} />
      {aircraft ? <input type="hidden" name="aircraft" value={aircraft} /> : null}
      <h2>{heading}</h2>
      <p>{intro}</p>
      {trip ? (
        <div className="inquiry-form__trip">
          <label><span>{intent === "cargo" ? "Origin" : "From"}</span><input name="departure" required maxLength={120} autoComplete="off" placeholder="City or airport" /></label>
          <label><span>To</span><input name="destination" required maxLength={120} autoComplete="off" placeholder="City or airport" /></label>
          <label><span>Departure date</span><input name="date" type="date" required min={new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date())} /></label>
          <label><span>Return or other dates</span><input name="returnDate" maxLength={80} placeholder="Optional" /></label>
          {intent === "cargo" ? (
            <label><span>Cargo</span><input name="cargoType" required maxLength={160} placeholder="What is moving, and any handling needs" /></label>
          ) : (
            <label><span>Passengers</span><input name="passengers" type="number" inputMode="numeric" min={1} max={100} required defaultValue={intent === "group" ? 12 : 2} /></label>
          )}
        </div>
      ) : null}
      <div className="inquiry-form__identity">
        <label><span>Name</span><input name="name" required minLength={2} maxLength={100} autoComplete="name" /></label>
        <label><span>Email</span><input name="email" type="email" inputMode="email" required maxLength={180} autoComplete="email" /></label>
        <label><span>Phone</span><input name="phone" type="tel" inputMode="tel" required maxLength={40} autoComplete="tel" /></label>
        {organizationLabel ? <label><span>{organizationLabel}</span><input name="organization" maxLength={160} autoComplete="organization" /></label> : null}
        {intent === "sales" && !aircraft ? <label><span>Aircraft of interest</span><input name="aircraft" maxLength={160} placeholder="Model, year, or the mission you want to fly" /></label> : null}
      </div>
      <label className="inquiry-form__notes"><span>Notes</span><textarea name="notes" maxLength={2500} rows={4} placeholder="Schedule, baggage, pets, cabin needs, or anything the advisor should know." /></label>
      <label className="quote-form__honeypot" aria-hidden="true"><span>Website</span><input name="website" tabIndex={-1} autoComplete="off" /></label>
      <p className="inquiry-form__disclosure">EXJET arranges charter as a broker. The licensed third-party air carrier identified for the trip operates the flight. Sending this form does not reserve an aircraft.</p>
      <button className="button button--dark" type="submit">{submitLabel}</button>
      <p className="inquiry-form__fine">By submitting, you agree that EXJET may contact you about this request. Read the <Link href="/privacy">privacy policy</Link>. For something urgent, call <a href={siteConfig.phone.primary.href}>{siteConfig.phone.primary.display}</a>.</p>
    </form>
  );
}
