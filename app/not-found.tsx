import Link from "next/link";
import styles from "./secondary.module.css";

export default function NotFound() {
  return <section className={styles.recovery} aria-labelledby="missing-title">
    <title>Page Not Found | EXJET</title>
    <p className={styles.eyebrow}>404</p>
    <h1 id="missing-title">Page not found</h1>
    <p>The page may have moved, or the address may be incomplete.</p>
    <div className={styles.actions}><Link className={styles.primary} href="/">Return home</Link><Link href="/charter/">Plan a flight</Link></div>
  </section>;
}
