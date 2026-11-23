import Link from "next/link";
import { BrokerNotice } from "@/components/BrokerNotice";
import { siteConfig } from "@/data/site";
import { BrowseFlightGlyph as Icon } from "./BrowseFlightGlyph";
import styles from "./SiteFooter.module.css";

const groups = [
  ["Fly",[["Plan a flight","/charter"],["Private jet charter","/private-jet-charter"],["Empty legs","/empty-legs"],["Charter pricing","/pricing"]]],
  ["Explore",[["Aircraft","/aircraft"],["Airports","/airports"],["Routes","/routes"],["Travel Journal","/travel-journal"]]],
  ["EXJET",[["About","/about"],["Safety","/safety"],["Help and contact","/contact"],["Client account","/account"]]],
] as const;
const legal = [
  ["Privacy","/privacy"],["Terms","/terms"],["Charter terms","/charter-terms"],["Cancellations","/cancellations"],["Cookies","/cookies"],["Accessibility","/accessibility"],["Editorial standards","/editorial-standards"],
] as const;

export function SiteFooter(){
  return <footer className={styles.footer}>
    <div className={styles.shell}>
      <div className={styles.main}>
        <div className={styles.identity}>
          <Link className={styles.name} href="/" aria-label="EXJET home">EXJET</Link>
          <p>Global Access. On-Demand.</p>
          <a className={styles.email} href={`mailto:${siteConfig.email.general}`}>{siteConfig.email.general}</a>
          <address>{siteConfig.legalName}<br/>{siteConfig.address.display}</address>
          <div className={styles.social}><a href={siteConfig.social.instagram}>Instagram</a><a href={siteConfig.social.linkedin}>LinkedIn</a></div>
        </div>
        {groups.map(([title,links])=><nav key={title} aria-label={title}><h2>{title}</h2>{links.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}</nav>)}
      </div>
      <div className={styles.bottom}>
        <BrokerNotice className={styles.notice}/>
        <nav className={styles.legal} aria-label="Legal and website information">{legal.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}</nav>
        <div className={styles.outro}><p>© {new Date().getFullYear()} EXJET LLC. All rights reserved.</p><a href="#main-content">Back to content <Icon name="forward" width={16} height={16}/></a></div>
      </div>
    </div>
  </footer>;
}
