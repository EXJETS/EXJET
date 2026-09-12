import Link from "next/link";

export default function NotFound() {
  return <section className="not-found"><div className="shell"><p className="eyebrow eyebrow--light"><span />404</p><h1>This route is not on the itinerary.</h1><p>The page may have moved, or the address may be incomplete.</p><div><Link className="button button--light" href="/">Return home <span>→</span></Link><Link href="/contact">Request a flight</Link></div></div></section>;
}
