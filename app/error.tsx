"use client";

import Link from "next/link";
import { siteConfig } from "@/data/site";
import styles from "./secondary.module.css";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section className={styles.recovery} aria-labelledby="recovery-title">
    <h1 id="recovery-title">This page couldn’t load</h1>
    <p>Try again, or contact the flight desk for help.</p>
    <div className={styles.actions}>
      <button type="button" className={styles.primary} onClick={retry}>Try again</button>
      <Link href="/">Return home</Link>
      <a href={`mailto:${siteConfig.email.general}`}>Email EXJET</a>
    </div>
  </section>;
}
