import type { Metadata } from "next";
import Link from "next/link";
import { TrackInquiry } from "@/components/TrackInquiry";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: "Request received | EXJET" },
  robots: { index: false, follow: false },
};

export default async function RequestReceivedPage({ searchParams }: { searchParams: Promise<{ ref?: string; error?: string; kind?: string }> }) {
  const params = await searchParams;
  const event = params.kind === "contact_request" ? "contact_request" : "quote_request";
  const received = Boolean(params.ref) && !params.error;
  const message = params.error === "rate"
    ? "Too many requests just arrived from this connection. Please call EXJET and the desk will take the details directly."
    : params.error === "delivery"
      ? "The form reached EXJET, but online delivery is not connected in this environment yet. Please call or email so the request is not lost."
      : "Some required details were missing or could not be read. Go back and check the name, email, phone, and, for a trip, the cities and departure date.";
  return (
    <section className="section">
      <div className="shell split-copy">
        <p className="eyebrow"><span />{received ? "Request received" : "Request not sent"}</p>
        <h1>{received ? "An advisor will be in touch." : "Please try another way."}</h1>
        <div>
          {received ? (
            <>
              <TrackInquiry event={event} />
              <p>Your reference is <strong>{params.ref}</strong>. An EXJET advisor will contact you {siteConfig.responseWindow}. A request does not reserve an aircraft. The licensed third-party carrier identified for the trip operates the flight.</p>
            </>
          ) : <p>{message}</p>}
          <p>Call <a href={siteConfig.phone.primary.href}>{siteConfig.phone.primary.display}</a> or email <a href={`mailto:${siteConfig.email.charter}`}>{siteConfig.email.charter}</a>. Sales and ownership questions can go to <a href={`mailto:${siteConfig.email.general}`}>{siteConfig.email.general}</a>.</p>
          <p><Link href="/charter">Return to the quote form</Link> · <Link href="/contact">Contact</Link></p>
        </div>
      </div>
    </section>
  );
}
