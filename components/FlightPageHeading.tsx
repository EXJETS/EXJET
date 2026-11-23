import Link from "next/link";
import styles from "./FlightPageHeading.module.css";

export function FlightPageHeading({ label, title, description, links = [] }: {
  label: string;
  title: string;
  description: string;
  links?: ReadonlyArray<readonly [string, string]>;
}) {
  return <header className={styles.heading}><div className={styles.inner}>
    <div><p className={styles.label}>{label}</p><h1>{title}</h1><p className={styles.description}>{description}</p></div>
    {links.length > 0 && <nav aria-label={label + " shortcuts"} className={styles.shortcuts}>{links.map(([text, href]) => <Link href={href} key={href}>{text}</Link>)}</nav>}
  </div></header>;
}
