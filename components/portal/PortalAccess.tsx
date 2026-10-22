import Link from "next/link";
import { LockKeyIcon } from "@phosphor-icons/react/dist/ssr";
import { portalConfigured } from "@/lib/portal/config";
import styles from "./Portal.module.css";
export function PortalAccess({ next, title = "Your private workspace" }: { next: string; title?: string }) {
  return <section className={styles.panel}><div className={styles.empty}><LockKeyIcon size={36} weight="light" aria-hidden="true" /><h2>{title}</h2><p>{portalConfigured() ? "Sign in with your email to access your account, saved plans and EXJET conversations." : "Client accounts are being prepared. You can explore aircraft and search flights now, or contact EXJET for help with your journey."}</p>{portalConfigured() ? <Link className={styles.primary} href={`/app/login/?next=${encodeURIComponent(next)}`}>Sign in securely</Link> : <Link className={styles.primary} href="/app/search/">Find a flight</Link>}</div></section>;
}
export function DataUnavailable() { return <div className={styles.notice} role="alert"><h2>We couldn’t load your records</h2><p>Please refresh the page or contact EXJET if the issue continues. Your records have not been changed.</p><Link href="/contact">Contact EXJET</Link></div>; }
export function PortalIntro({ eyebrow = "EXJET workspace", title, description, children }: { eyebrow?: string; title: string; description: string; children?: React.ReactNode }) {
  return <div className={styles.intro}><div><p className={styles.eyebrow}>{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{children}</div>;
}
