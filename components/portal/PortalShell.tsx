"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CompassIcon } from '@phosphor-icons/react/dist/csr/Compass';
import { AirplaneTiltIcon } from '@phosphor-icons/react/dist/csr/AirplaneTilt';
import { LightningIcon } from '@phosphor-icons/react/dist/csr/Lightning';
import { BookmarkSimpleIcon } from '@phosphor-icons/react/dist/csr/BookmarkSimple';
import { MapPinIcon } from '@phosphor-icons/react/dist/csr/MapPin';
import { ChatCircleIcon } from '@phosphor-icons/react/dist/csr/ChatCircle';
import { UserCircleIcon } from '@phosphor-icons/react/dist/csr/UserCircle';
import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import { ListIcon } from '@phosphor-icons/react/dist/csr/List';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import { PhoneIcon } from '@phosphor-icons/react/dist/csr/Phone';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight';
import { siteConfig } from '@/data/site';
import styles from './Portal.module.css';
const links = [
  { path: '/app/', label: 'Explore', Icon: CompassIcon },
  { path: '/app/search/', label: 'Private charter', Icon: AirplaneTiltIcon },
  { path: '/app/empty-legs/', label: 'Empty legs', Icon: LightningIcon },
  { path: '/app/aircraft/', label: 'Aircraft collection', Icon: AirplaneTiltIcon },
  { path: '/app/trips/', label: 'Saved trips', Icon: BookmarkSimpleIcon },
  { path: '/app/locations/', label: 'Saved airports', Icon: MapPinIcon },
  { path: '/app/messages/', label: 'Your advisor', Icon: ChatCircleIcon },
];
export function PortalShell({ children, name, signedIn }: { children: React.ReactNode; name?: string; signedIn: boolean }) {
  const path = (usePathname() || '/app/').replace(/\/?$/, '/');
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const open = menuPath === path;
  useEffect(() => { const el = dialog.current; if (open && !el?.open) el?.showModal(); if (!open && el?.open) { el.close(); trigger.current?.focus(); } if (open) document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, [open]);
  const navigation = <>{links.map(({ path: href, label, Icon }, index) => <div key={href}>{index === 4 && <p className={styles.navLabel}>YOUR WORKSPACE</p>}<Link href={href} aria-current={path === href ? 'page' : undefined} onClick={() => setMenuPath(null)}><Icon size={21} weight={path === href ? 'fill' : 'regular'} aria-hidden="true"/>{label}{href === '/app/empty-legs/' && <span className={styles.navDot}/>}</Link></div>)}</>;
  return <div className={styles.app}>
    <aside className={styles.sidebar}>
      <Link href="/app/" className={styles.brand} aria-label="EXJET app home"><Image src="/brand/exjet-navbar-logo.png" alt="" width={42} height={42}/><span>EXJET<small>PRIVATE AVIATION</small></span></Link>
      <p className={styles.navLabel}>A WORLD OF POSSIBILITIES</p><nav aria-label="Application navigation">{navigation}</nav>
      <div className={styles.concierge}><span className={styles.conciergeIcon}><ChatCircleIcon size={22} aria-hidden="true"/></span><h2>A person, not a process.</h2><p>Let’s find the right way<br/>to get you there.</p><Link href="/contact">Talk to EXJET <ArrowUpRightIcon size={17} aria-hidden="true"/></Link></div>
      <div className={styles.sidebarBottom}><Link href="/services">Aviation services <ArrowUpRightIcon size={16} aria-hidden="true"/></Link><Link href="/">EXJET home <ArrowUpRightIcon size={16} aria-hidden="true"/></Link></div>
    </aside>
    <div className={styles.workspace}>
      <header className={styles.topbar}><div className={styles.breadcrumb}><span>EXJET</span><span>/</span>{links.find(link => link.path === path)?.label || 'Your workspace'}</div><Link className={styles.mobileBrand} href="/app/" aria-label="EXJET app home"><Image src="/brand/exjet-navbar-logo.png" alt="" width={32} height={32}/><span>EXJET</span></Link><div className={styles.topbarActions}><a href={siteConfig.phone.primary.href} className={styles.contactTop}><PhoneIcon size={17} aria-hidden="true"/>Speak with EXJET</a><Link className={styles.account} href={signedIn ? '/app/settings/' : '/app/login/'}><UserCircleIcon size={23} aria-hidden="true"/><span>{signedIn ? name || 'Account' : 'Client access'}</span></Link></div></header>
      <div className={styles.content}>{children}</div>
      <footer className={styles.footer}><span>EXJET <span aria-hidden="true">·</span> A different perspective.</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link></div></footer>
    </div>
    <nav className={styles.mobileNav} aria-label="Mobile application navigation">{[links[0], links[1], links[2], links[4]].map(({ path: href, label, Icon }) => <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}><Icon size={22} weight={path === href ? 'fill' : 'regular'} aria-hidden="true"/><span>{label === 'Private charter' ? 'Charter' : label}</span></Link>)}<button ref={trigger} type="button" aria-label="Open app menu" aria-haspopup="dialog" aria-expanded={open} onClick={() => setMenuPath(path)}><ListIcon size={22} aria-hidden="true"/><span>More</span></button></nav>
    <dialog ref={dialog} className={styles.mobileMenu} aria-labelledby="app-menu-title" onCancel={() => setMenuPath(null)} onClose={() => setMenuPath(null)} onClick={event => { if (event.target === dialog.current) setMenuPath(null); }}><div className={styles.menuHead}><h2 id="app-menu-title">Your EXJET</h2><button type="button" aria-label="Close app menu" onClick={() => setMenuPath(null)}><XIcon size={22} aria-hidden="true"/></button></div><nav aria-label="All app pages">{navigation}<Link href="/app/settings/" onClick={() => setMenuPath(null)}><UserCircleIcon size={20} aria-hidden="true"/>Account</Link><Link href="/services" onClick={() => setMenuPath(null)}>Aviation services <ArrowRightIcon size={18} aria-hidden="true"/></Link></nav></dialog>
  </div>;
}
