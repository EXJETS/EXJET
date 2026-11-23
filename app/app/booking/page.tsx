import Link from "next/link";
import { portalConfigured } from "@/lib/portal/config";
import { portalIdentity } from "@/lib/supabase/server";
import styles from "./verification.module.css";

export const metadata = { title: "Booking verification | EXJET", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function BookingVerification() {
  const configured = portalConfigured();
  const identity = configured ? await portalIdentity().catch(() => null) : null;
  const steps = ["Legal name and age", "Email verification code", "Phone verification code", "Government ID", "Additional screening if required"];
  return (
    <section className={styles.layout} aria-labelledby="booking-verification-title">
      <div className={styles.intro}>
        <Link className={styles.back} href="/charter/">← Back to charter</Link>
        <h1 id="booking-verification-title">Booking verification</h1>
        <p>Browse aircraft and request a quote without an account. Verification is for confirmed reservations.</p>
        <h2 className={styles.stepTitle}>Before a reservation</h2>
        <ol className={styles.steps}>
          {steps.map((step, index) => <li key={step}><span aria-hidden="true">{index + 1}</span>{step}</li>)}
        </ol>
      </div>
      <div className={styles.panel}>
        <h2>{identity ? "Your EXJET account" : "Client account"}</h2>
        <p>{identity ? "You are signed in. Account sign-in is separate from booking verification." : configured ? "Sign in with the link sent to your email to access your account." : "Online account access is not available here right now."}</p>
        {configured && !identity && <Link className={styles.button} href="/app/login/?next=%2Fapp%2Fbooking%2F">Sign in to EXJET</Link>}
        <div className={styles.notice}>
          <h3>Online booking is not available yet</h3>
          <p>The flight desk can confirm aircraft availability and explain verification after you request a quote. Do not send ID documents, codes or payment details by email or through the quote form.</p>
        </div>
        <div className={styles.links}><Link href="/charter/">Request a quote</Link><Link href="/contact/">Contact the flight desk</Link></div>
      </div>
    </section>
  );
}
