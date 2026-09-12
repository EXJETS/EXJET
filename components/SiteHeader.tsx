"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/data/site";
import { EqualsIcon } from "@phosphor-icons/react/dist/csr/Equals";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { UserCircleIcon } from "@phosphor-icons/react/dist/csr/UserCircle";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";

const primary = [
  { href: "/private-jet-charter", label: "Charter" },
  { href: "/aircraft", label: "Aircraft" },
  { href: "/routes", label: "Routes" },
  { href: "/articles", label: "Flight Guide" },
  { href: "/contact", label: "Contact" },
];
const explore = [
  { href: "/charter", label: "Find a flight" },
  ...primary,
  { href: "/empty-legs", label: "Empty legs" },
  { href: "/group-charter", label: "Group travel" },
  { href: "/membership", label: "Membership" },
  { href: "/sales", label: "Aircraft sales" },
  { href: "/cargo", label: "Cargo charter" },
  { href: "/corporate-travel", label: "Corporate travel" },
  { href: "/aircraft-management", label: "Aircraft management" },
  { href: "/interior-completions", label: "Interior completions" },
  { href: "/airports", label: "Airports" },
  { href: "/destinations", label: "Destinations" },
  { href: "/search", label: "Search the website" },
  { href: "/about", label: "About EXJET" },
  { href: "/account", label: "Client access" },
];

function NavigationLogo({ onClick }: { onClick?: () => void }) {
  return (
    <Link className="ex-header-logo" href="/" aria-label="EXJET home" onClick={onClick}>
      <Image src="/brand/exjet-navbar-logo.png" alt="EXJET" width={1254} height={1254} loading="eager" unoptimized />
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const currentPath = pathname.replace(/\/$/, "") || "/";
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const open = menuPath === pathname;

  useEffect(() => {
    const element = dialog.current;
    if (open && element && !element.open) element.showModal();
    if (!open && element?.open) element.close();
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  const close = () => setMenuPath(null);
  return (
    <header className="ex-header">
      <div className="shell ex-header-inner">
        <NavigationLogo />
        <nav className="ex-primary-nav" aria-label="Primary navigation">
          {primary.map((link) => <Link key={link.href} href={link.href} aria-current={currentPath === link.href ? "page" : undefined}>{link.label}</Link>)}
        </nav>
        <div className="ex-header-actions">
          <Link className="ex-menu-button" href="/charter" aria-label="Search flights" aria-current={currentPath === "/charter" ? "page" : undefined}><MagnifyingGlassIcon size={20} weight="regular" aria-hidden="true" /></Link>
          <Link className="ex-menu-button" href="/account" aria-label="Your EXJET account" aria-current={currentPath === "/account" ? "page" : undefined}><UserCircleIcon size={20} weight="regular" aria-hidden="true" /></Link>
          <button className="ex-menu-button" type="button" aria-label="Explore EXJET" aria-haspopup="dialog" aria-expanded={open} aria-controls="exjet-navigation" onClick={() => setMenuPath(pathname)}>
            <EqualsIcon size={20} weight="regular" aria-hidden="true" />
          </button>
        </div>
      </div>
      <dialog ref={dialog} id="exjet-navigation" className="ex-navigation-dialog" aria-labelledby="exjet-navigation-title" onCancel={close} onClose={close}>
        <div className="ex-dialog-heading"><NavigationLogo onClick={close} /><button type="button" className="ex-menu-button" aria-label="Close navigation" onClick={close}><XIcon size={20} weight="light" aria-hidden="true" /></button></div>
        <div className="ex-dialog-content"><h2 id="exjet-navigation-title">Explore EXJET</h2>
        <nav className="ex-dialog-links" aria-label="All pages">
          {explore.map((link, index) => <Link className={index < 5 ? "ex-dialog-primary" : "ex-dialog-secondary"} key={link.href} href={link.href} aria-current={currentPath === link.href ? "page" : undefined} onClick={close}>{link.label}</Link>)}
        </nav>
        <div className="ex-dialog-contact"><span>Speak with EXJET</span><a href={siteConfig.phone.primary.href}>{siteConfig.phone.primary.display}</a></div>
        </div>
      </dialog>
    </header>
  );
}
