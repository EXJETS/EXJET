import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SocialLinks } from "@/components/SocialLinks";
import { siteConfig, aviationSolutions } from "@/data/site";
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr";
import { BrokerNotice } from "@/components/BrokerNotice";

const groups = [
  { title: "Services", links: aviationSolutions.map(service => [service.name, service.path]) },
  { title: "Explore", links: [["Aircraft", "/aircraft"], ["Empty legs", "/empty-legs"], ["Travel Journal", "/travel-journal"], ["Routes", "/routes"], ["Airports", "/airports"], ["Destinations", "/destinations"], ["Charter pricing", "/pricing"], ["Aircraft guides", "/aircraft-guides"], ["Flight Guide", "/articles"]] },
  { title: "Your travel", links: [["Executive assistants", "/executive-assistants"], ["Family offices", "/family-office-private-aviation"], ["Fortune 500 teams", "/corporate-travel/fortune-500"], ["Sports teams", "/group-charter/sports-teams"], ["Entertainment & events", "/group-charter"], ["Aircraft owners", "/aircraft-owners"], ["Membership", "/membership"]] },
  { title: "EXJET", links: [["About", "/about"], ["Why EXJET", "/why-exjet"], ["Safety", "/safety"], ["How it works", "/how-it-works"], ["Operator relationships", "/operator-partners"], ["Partnerships", "/partnership"], ["Client support", "/account"], ["Contact", "/contact"]] },
];

export function SiteFooter() {
  return <footer className="ex-footer">
    <div className="shell ex-footer-top">
      <div className="ex-footer-brand"><Logo className="ex-footer-logo" /><p>Global Access, On-Demand.</p><a className="ex-footer-phone" href={siteConfig.phone.primary.href}>{siteConfig.phone.primary.display}</a><address className="ex-footer-address">{siteConfig.legalName}<br />{siteConfig.address.display}</address><SocialLinks compact /></div>
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
