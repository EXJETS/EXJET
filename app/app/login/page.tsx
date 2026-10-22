import Link from "next/link";
import { PortalForm } from "@/components/portal/PortalForm";
import { PortalIntro } from "@/components/portal/PortalAccess";
import { portalConfigured, safeReturnPath } from "@/lib/portal/config";
import { requestSignIn } from "../actions";
import styles from "@/components/portal/Portal.module.css";
export const metadata = { title: "Sign in" };
export default async function SignIn({ searchParams }: { searchParams: Promise<Record<string,string | string[] | undefined>> }) {
  const params = await searchParams;
  return <div className={styles.login}><PortalIntro title="Welcome to EXJET." description="Your plans, preferences and conversations. Securely in one place." /><section className={styles.panel}>
    {params.error === "expired" && <p role="alert" className={styles.error}>This link is no longer valid. Request a new sign-in link below.</p>}
    {portalConfigured() ? <PortalForm action={requestSignIn} label="Email me a sign-in link" pendingLabel="Sending link…"><input type="hidden" name="next" value={safeReturnPath(params.next)} /><label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="you@company.com" /></label><p className={styles.help}>We’ll send a one-time link to sign in or create your account. No password to remember. Review our <Link href="/privacy">privacy policy</Link> and <Link href="/terms">website terms</Link>.</p></PortalForm> : <div className={styles.notice}><h2>Client access is being prepared</h2><p>Flight search and aircraft discovery are available now. Please contact EXJET to manage an existing itinerary.</p><Link href="/app/search/" className={styles.primary}>Find a flight</Link></div>}
  </section><Link href="/contact">Need help? Contact EXJET</Link></div>;
}
