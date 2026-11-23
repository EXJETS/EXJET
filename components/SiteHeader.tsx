"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { aviationSolutions } from "@/data/site";
import { UserCircleIcon } from "@phosphor-icons/react/dist/csr/UserCircle";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CharterIcon } from "./CharterVisuals";
import styles from "./SiteHeader.module.css";

const primary = [
  { href: "/private-jet-charter", label: "Charter" },
  { href: "/routes", label: "Routes" },
  { href: "/aircraft", label: "Aircraft" },
  { href: "/pricing", label: "Pricing" },
  { href: "/empty-legs", label: "Empty legs" },
];
const groups = [
  { title: "Ways to charter", links: aviationSolutions.map(service => [service.name, service.path]) },
  { title: "Your travel", links: [
    ["Aircraft", "/aircraft"], ["Charter pricing", "/pricing"], ["Empty legs", "/empty-legs"],
    ["Executive assistants", "/executive-assistants"], ["Family offices", "/family-office-private-aviation"], ["Sports teams", "/group-charter/sports-teams"], ["Entertainment & event travel", "/group-charter"], ["Fortune 500 teams", "/corporate-travel/fortune-500"], ["Cargo charter", "/cargo"],
  ] },
  { title: "Resources", links: [
    ["Travel Journal", "/travel-journal"],
    ["Routes", "/routes"], ["Airports", "/airports"], ["Destinations", "/destinations"],
    ["Flight Guide", "/articles"], ["Aircraft guides", "/aircraft-guides"], ["Aircraft performance", "/aircraft-performance"], ["Aircraft comparisons", "/aircraft-comparisons"], ["Charter FAQ", "/faq"],
    ["How it works", "/how-it-works"],
  ] },
  { title: "About EXJET", links: [
    ["About us", "/about"], ["Safety", "/safety"], ["Why EXJET", "/why-exjet"], ["Operator relationships", "/operator-partners"], ["Contact", "/contact"],
  ] },
];

function NavigationBrand({ onClick }: { onClick?: () => void }) {
  return <Link className={styles.brand} href="/" aria-label="EXJET home" onClick={onClick}>
    EXJET
  </Link>;
}

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const currentPath = pathname.replace(/\/$/, "") || "/";
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const open = menuPath === pathname;
  const close = () => setMenuPath(null);
  const isCurrent = (href: string) => currentPath === href;
  const isSection = (href: string) => isCurrent(href) || currentPath.startsWith(href + "/");

  useEffect(() => {
    const element = dialog.current;
    if (open && element && !element.open) { element.showModal(); element.querySelector<HTMLButtonElement>('button[aria-label="Close navigation"]')?.focus(); }
    if (!open && element?.open) { element.close(); trigger.current?.focus(); }
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return <header className={`${styles.header} ${currentPath === "/" ? styles.homeHeader : ""}`}>
    <div className={styles.bar}>
      <NavigationBrand />
      <nav className={styles.primary} aria-label="Primary navigation">
        {primary.map(link => <Link key={link.href} href={link.href} aria-current={isCurrent(link.href) ? "page" : isSection(link.href) ? "location" : undefined}>{link.label}</Link>)}
      </nav>
      <div className={styles.actions}>
        <Link className={styles.bookFlight} href="/charter" aria-current={isCurrent("/charter") ? "page" : undefined}>Plan a flight <CharterIcon name="arrow" width={17} height={17} /></Link>
        <button ref={trigger} className={styles.menuButton} type="button" aria-label="Open navigation menu" aria-haspopup="dialog" aria-expanded={open} aria-controls="exjet-navigation" onClick={() => setMenuPath(pathname)}><CharterIcon name="menu" width={22} height={22} /><span aria-hidden="true">Menu</span></button>
      </div>
    </div>
    <dialog ref={dialog} id="exjet-navigation" className={styles.dialog} aria-labelledby="exjet-navigation-title" onCancel={close} onClose={close} onClick={event => { if (event.target === dialog.current) close(); }}>
      <div className={styles.heading}><NavigationBrand onClick={close} /><button type="button" className={styles.closeButton} aria-label="Close navigation" onClick={close}><CharterIcon name="close" width={20} height={20} /></button></div>
      <div className={styles.content}>
        <h2 id="exjet-navigation-title" className={styles.label}>Explore EXJET</h2>
        <div className={styles.quickLinks}>
          <Link href="/charter" className={styles.flight} onClick={close}>Find a flight <CharterIcon name="arrow" width={22} height={22} /></Link>
          <Link href="/pricing" onClick={close}>Compare charter pricing <CharterIcon name="arrow" width={18} height={18} /></Link>
          <Link href="/contact" onClick={close}>Speak with an advisor <CharterIcon name="arrow" width={18} height={18} /></Link>
        </div>
        <div className={styles.mobileGroups}>{groups.map(group => <details key={group.title} name="exjet-mobile-navigation">
          <summary>{group.title}<CaretDownIcon size={18} aria-hidden="true" /></summary>
          <nav aria-label={group.title}>{group.links.map(([label, href]) => <Link key={href} href={href} aria-current={isCurrent(href) ? "page" : undefined} onClick={close}>{label}</Link>)}</nav>
        </details>)}</div>
        <div className={styles.contact}>
          <Link href="/search" onClick={close}><CharterIcon name="search" width={18} height={18} />Search EXJET</Link>
          <Link href="/account" onClick={close}><UserCircleIcon size={18} aria-hidden="true" />Client support</Link>
        </div>
      </div>
    </dialog>
  </header>;
}
