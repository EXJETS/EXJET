"use client";

import { useSearchParams } from "next/navigation";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/csr/Envelope";
import { siteConfig } from "@/data/site";
import { selectedLabel } from "./selection";

export function ContactPreference({ aircraft, categories }: { aircraft: Record<string, string>; categories: Record<string, string> }) {
  const params = useSearchParams();
  const aircraftName = selectedLabel(aircraft, params.get("aircraft"));
  const category = selectedLabel(categories, params.get("category"));
  const preference = aircraftName || category || (params.get("service") === "empty-leg" ? "Empty-leg match" : "");
  if (!preference) return null;
  const subject = `EXJET enquiry: ${preference}`;
  const body = `I would like to discuss ${preference}.\n\nOrigin:\nDestination:\nTravel dates:\nPassengers:\nAdditional requirements:`;
  return <section className="ex-contact-preference" aria-label="Your selected preference">
    <p>Selected preference</p><h2>{preference}</h2>
    <p>Send this preference to an advisor, or use the search below to explore available aircraft.</p>
    <a className="button button--dark" href={`mailto:${siteConfig.email.charter}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}><EnvelopeIcon size={18} aria-hidden="true" /> Email this request</a>
  </section>;
}
