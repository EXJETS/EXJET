import Link from "next/link";
import { portalConfigured } from "@/lib/portal/config";
import { portalIdentity } from "@/lib/supabase/server";
import styles from "./verification.module.css";

export const metadata = { title: "Booking verification | EXJET", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function BookingVerification() {
  const configured = portalConfigured();
  const identity = configured ? await portalIdentity().catch(() => null) : null;
  return (
    <section className={styles.layout} aria-labelledby="booking-verification-title">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>EXJET charter</p>
        <h1 id="booking-verification-title">Booking verification</h1>
        <p>Compare options and request a quote without an account. For a confirmed reservation, your advisor will need a verified booking contact and an aircraft confirmed by its operator.</p>
      </div>
      <div className={styles.panel}>
        <ol className={styles.steps}>
          <li><strong>Account and email</strong><span>{identity ? "Verified for this session" : configured ? "Sign in using the link sent to your email" : "Account access is not connected here"}</span></li>
          <li><strong>Legal name and age</strong><span>Not collected on this page</span></li>
          <li><strong>Email and phone codes</strong><span>Booking-specific code checks are not connected</span></li>
          <li><strong>Government ID</strong><span>Hosted driver’s license or government ID verification is not connected</span></li>
        </ol>
        {configured && !identity && <Link className={styles.button} href="/app/login/?next=%2Fapp%2Fbooking%2F">Sign in to EXJET</Link>}
        <div className={styles.notice} role="note">
          <strong>Online booking is not available.</strong>
          <p>This page cannot confirm travel or take payment. Your advisor can confirm next steps after receiving a quote request. Do not send identification documents, codes or payment details by email or in a quote request.</p>
        </div>
        <div className={styles.links}><Link href="/charter/">Plan a flight</Link><Link href="/contact/">Contact the flight desk</Link></div>
      </div>
    </section>
  );
}
