import Link from "next/link";
import { BellIcon } from "@phosphor-icons/react/dist/ssr";
import { PortalIntro } from "@/components/portal/PortalAccess";
import styles from "@/components/portal/Portal.module.css";
export const metadata={title:"Flight alerts"};
export default function Alerts(){return <><PortalIntro title="Stay close to the right opportunity." description="Flexible routes and dates are the starting point for empty-leg travel."/><section className={styles.panel}><div className={styles.empty}><BellIcon size={36} weight="light" aria-hidden="true"/><h2>Automated flight alerts are not available yet.</h2><p>Explore current opportunities or discuss your preferred routes with EXJET. No alert subscription has been created.</p><Link className={styles.primary} href="/app/empty-legs/">Explore empty legs</Link></div></section></>;}
