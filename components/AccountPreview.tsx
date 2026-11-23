import Link from "next/link";
import { siteConfig } from "@/data/site";
import styles from "@/app/secondary.module.css";

export function AccountPreview() {
  return <section className={styles.split} aria-labelledby="client-title">
    <div>
      <h1 id="client-title">Your EXJET account</h1>
      <p>Manage saved itineraries and access your client workspace.</p>
    </div>
    <div className={styles.panel}>
      <h2>Client access</h2>
      <p>You do not need an account to compare aircraft or request a quote.</p>
      <div className={styles.actions}><Link className={styles.primary} href="/app/login/">Sign in</Link><Link href="/app/booking/">Booking verification</Link></div>
      <p>Already working with us on a trip? <a href={`mailto:${siteConfig.email.charter}`}>Contact the charter desk</a>.</p>
    </div>
  </section>;
}
