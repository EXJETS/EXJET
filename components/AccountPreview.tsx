import Link from "next/link";
import { siteConfig } from "@/data/site";
export function AccountPreview() {
  return <section className="account-page"><div className="shell account-layout">
    <div className="account-story"><p className="eyebrow">EXJET client access</p><h1>A personal point of contact.</h1><p>For your itinerary, documents, or a new flight request, contact the EXJET team directly.</p></div>
    <div className="account-panel"><p className="ex-kicker">Client portal preview</p><h2>Your journey starts with a conversation.</h2><p>Online sign-in and saved trip records are not available yet. No account or password is needed to request a flight.</p><Link className="button button--dark" href="/contact">Contact EXJET</Link><a className="ex-inline-link" href={siteConfig.phone.primary.href}>{siteConfig.phone.primary.display}</a></div>
  </div></section>;
}
