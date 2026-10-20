"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteConfig, aviationSolutions } from "@/data/site";
import { EqualsIcon } from "@phosphor-icons/react/dist/csr/Equals";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PhoneIcon } from "@phosphor-icons/react/dist/csr/Phone";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import styles from "./SiteHeader.module.css";

const primary = [
  { href: "/services", label: "Services" },
  { href: "/private-jet-charter", label: "Charter" },
  { href: "/aircraft", label: "Aircraft" },
  { href: "/articles", label: "Flight Guide" },
  { href: "/contact", label: "Contact" },
];
const groups = [
  { title: "Services", links: aviationSolutions.map(service => [service.name, service.path]) },
  { title: "Plan your flight", links: [
    ["Aircraft", "/aircraft"], ["Charter pricing", "/pricing"], ["Empty legs", "/empty-legs"],
    ["Executive assistants", "/executive-assistants"], ["Family offices", "/family-office-private-aviation"], ["Group travel", "/group-charter"], ["Corporate travel", "/corporate-travel"], ["Cargo charter", "/cargo"],
  ] },
  { title: "Explore EXJET", links: [
    ["All services", "/services"], ["Aviation consulting", "/business-aviation-consulting"],
    ["Routes", "/routes"], ["Airports", "/airports"], ["Destinations", "/destinations"],
    ["Flight Guide", "/articles"], ["Aircraft performance", "/aircraft-performance"], ["Aircraft comparisons", "/aircraft-comparisons"], ["Charter FAQ", "/faq"],
    ["About EXJET", "/about"], ["Safety", "/safety"],
    ["Membership", "/membership"], ["Client support", "/account"],
  ] },
];

function NavigationLogo({ onClick }: { onClick?: () => void }) {
  return <Link className="ex-header-logo" href="/" aria-label="EXJET home" onClick={onClick}>
    <Image src="/brand/exjet-navbar-logo.png" alt="" width={96} height={96} sizes="48px" loading="eager" />
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

  useEffect(() => {
    const element = dialog.current;
    if (open && element && !element.open) { element.showModal(); element.querySelector<HTMLButtonElement>('button[aria-label="Close navigation"]')?.focus(); }
    if (!open && element?.open) { element.close(); trigger.current?.focus(); }
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return <header className="ex-header">
    <div className="shell ex-header-inner">
      <NavigationLogo />
      <nav className="ex-primary-nav" aria-label="Primary navigation">
        {primary.map(link => <Link key={link.href} href={link.href} aria-current={isCurrent(link.href) ? "page" : undefined}>{link.label}</Link>)}
      </nav>
      <div className="ex-header-actions">
        <Link className="ex-menu-button" href="/search" title="Search EXJET" aria-label="Search EXJET" aria-current={isCurrent("/search") ? "page" : undefined}><MagnifyingGlassIcon size={20} aria-hidden="true" /></Link>
        <a className="ex-menu-button" href={siteConfig.phone.primary.href} title="Call EXJET" aria-label={`Call EXJET at ${siteConfig.phone.primary.display}`}><PhoneIcon size={20} aria-hidden="true" /></a>
        <button ref={trigger} className="ex-menu-button" type="button" aria-label="Explore EXJET" aria-haspopup="dialog" aria-expanded={open} aria-controls="exjet-navigation" onClick={() => setMenuPath(pathname)}><EqualsIcon size={20} aria-hidden="true" /></button>
      </div>
    </div>
    <dialog ref={dialog} id="exjet-navigation" className={styles.dialog} aria-labelledby="exjet-navigation-title" onCancel={close} onClose={close} onClick={event => { if (event.target === dialog.current) close(); }}>
      <div className={styles.heading}><NavigationLogo onClick={close} /><button type="button" className="ex-menu-button" aria-label="Close navigation" onClick={() => { close(); trigger.current?.focus(); }}><XIcon size={20} aria-hidden="true" /></button></div>
      <div className={styles.content}>
        <h2 id="exjet-navigation-title" className={styles.label}>Explore EXJET</h2>
        <div className={styles.quickLinks}>
          <Link href="/charter" className={styles.flight} onClick={close}>Find a flight <ArrowRightIcon size={22} aria-hidden="true" /></Link>
          <Link href="/contact" onClick={close}>Speak with an advisor <ArrowRightIcon size={18} aria-hidden="true" /></Link>
        </div>
        <div className={styles.groups}>{groups.map(group => <nav key={group.title} aria-label={group.title}>
          <h3>{group.title}</h3>{group.links.map(([label, href]) => <Link key={href} href={href} aria-current={isCurrent(href) ? "page" : undefined} onClick={close}>{label}</Link>)}
        </nav>)}</div>
        <div className={styles.contact}><span>Global Access. On-Demand.</span><a href={siteConfig.phone.primary.href}><PhoneIcon size={18} aria-hidden="true" />{siteConfig.phone.primary.display}</a></div>
      </div>
    </dialog>
  </header>;
}
