"use client";
import Link from "next/link";
import styles from "@/components/portal/Portal.module.css";
export default function ApplicationError({ reset }: { reset: () => void }) {
  return <section className={styles.panel} role="alert"><h1>Your workspace is temporarily unavailable.</h1><p>Please try again. For time-sensitive flight support, contact EXJET.</p><button type="button" className={styles.primary} onClick={reset}>Try again</button> <Link className={styles.secondary} href="/contact">Contact EXJET</Link></section>;
}
