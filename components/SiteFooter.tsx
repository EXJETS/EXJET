import Link from "next/link";
import Image from "next/image";
import { SocialLinks } from "@/components/SocialLinks";
import { siteConfig } from "@/data/site";
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr";
import { BrokerNotice } from "@/components/BrokerNotice";

const groups = [
  { title: "Charter", links: [["Plan a flight", "/charter"], ["Group charter", "/group-charter"], ["Cargo charter", "/cargo"], ["Empty legs", "/empty-legs"]] },
  { title: "Explore", links: [["Aircraft", "/aircraft"], ["Routes", "/routes"], ["Charter pricing", "/pricing"], ["Travel Journal", "/travel-journal"]] },
  { title: "EXJET", links: [["About", "/about"], ["Safety", "/safety"], ["Help and contact", "/contact"], ["Client account", "/account"]] },
];

export function SiteFooter() {
  return <footer className="ex-footer">
    <div className="shell ex-footer-top">
      <div className="ex-footer-brand"><Link className="ex-footer-chevron" href="/" aria-label="EXJET home"><Image src="/brand/exjet-navbar-logo.png" alt="" width={96} height={96} sizes="(max-width: 820px) 32px, 48px" /></Link><p>Global Access, On-Demand.</p><a className="ex-footer-phone" href={`mailto:${siteConfig.email.general}`}>{siteConfig.email.general}</a><address className="ex-footer-address">{siteConfig.legalName}<br />{siteConfig.address.display}</address><SocialLinks compact /></div>
      {groups.map((group) => <nav className="ex-footer-desktop" key={group.title} aria-label={group.title}><h2>{group.title}</h2>{group.links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>)}
      <div className="ex-footer-mobile">
        {groups.map((group) => <details key={group.title}>
          <summary>{group.title}<CaretDownIcon size={14} aria-hidden="true" /></summary>
          <nav aria-label={group.title}>{group.links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
        </details>)}
      </div>
    </div>
    <div className="shell ex-footer-bottom"><BrokerNotice /><nav className="ex-legal-links" aria-label="Legal and website information"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/charter-terms">Charter terms</Link><Link href="/cancellations">Cancellations</Link><Link href="/cookies">Cookies</Link><Link href="/accessibility">Accessibility</Link><Link href="/editorial-standards">Editorial standards</Link></nav><p>© {new Date().getFullYear()} EXJET LLC. All rights reserved.</p></div>
  </footer>;
}
