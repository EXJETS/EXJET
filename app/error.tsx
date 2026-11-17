"use client";

import Link from "next/link";
import { siteConfig } from "@/data/site";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section className="shell section ex-recovery" aria-labelledby="recovery-title">
    <p className="eyebrow">EXJET</p>
    <h1 id="recovery-title">This page couldn’t load.</h1>
    <p>Try again, or contact our team for help with your journey.</p>
    <div className="ex-inline-actions">
      <button type="button" className="button button--dark" onClick={retry}>Try again</button>
      <Link className="ex-text-link" href="/">Return home</Link>
      <a className="ex-text-link" href={siteConfig.phone.primary.href}>Call EXJET</a>
    </div>
  </section>;
}
