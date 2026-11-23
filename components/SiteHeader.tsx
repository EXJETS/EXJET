"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrowseFlightGlyph as Icon } from "./BrowseFlightGlyph";
import styles from "./SiteHeader.module.css";

const primary = [
  ["/aircraft","Explore aircraft"], ["/charter", "Plan a flight"], ["/empty-legs","Empty legs"], ["/app/trips","Your trips"],
] as const;
const groups=[
  ["Fly",[["Private jet charter","/charter"],["Charter guide","/private-jet-charter"],["Empty legs","/empty-legs"],["Charter pricing","/pricing"],["How it works","/how-it-works"]]],
  ["Explore",[["Aircraft","/aircraft"],["Airports","/airports"],["Routes","/routes"],["Travel Journal","/travel-journal"],["Destinations","/destinations"]]],
  ["Support",[["Contact us","/contact"],["Client account","/account"],["Safety","/safety"],["Charter FAQ","/faq"],["About EXJET","/about"]]],
] as const;

export function SiteHeader(){
  const path=usePathname()||"/", current=path.replace(/\/$/,"")||"/";
  const [menuPath,setMenuPath]=useState<string|null>(null);
  const menu=useRef<HTMLDialogElement>(null), trigger=useRef<HTMLButtonElement>(null);
  const open=menuPath===path;
  const close=()=>setMenuPath(null);

  useEffect(()=>{
    const panel=menu.current;
    if(open && panel && !panel.open){panel.showModal();panel.querySelector<HTMLButtonElement>('button[aria-label="Close navigation"]')?.focus();}
    if(!open && panel?.open){panel.close();trigger.current?.focus();}
    document.body.classList.toggle("menu-open",open);
    return ()=>document.body.classList.remove("menu-open");
  },[open]);

  return <header className={styles.header}>
    <div className={styles.bar}>
      <Link className={styles.brand} href="/" aria-label="EXJET home">EXJET<span>Charter</span></Link>
      <nav className={styles.primary} aria-label="Primary navigation">
        {primary.map(([href,label])=><Link key={href} href={href} aria-current={current===href?"page":current.startsWith(href+"/")?"location":undefined}>{label}</Link>)}
      </nav>
      <div className={styles.actions}>
        <Link href="/search/" className={styles.search} aria-label="Search EXJET"><Icon name="search" width={19} height={19}/></Link>
        <Link href="/account/" className={styles.account} aria-label="Client account"><Icon name="account" width={17} height={17}/><span>Client account</span></Link>
        <button ref={trigger} type="button" className={styles.menuButton} aria-label="Open navigation menu" aria-haspopup="dialog" aria-controls="exjet-navigation" aria-expanded={open} onClick={()=>setMenuPath(path)}><Icon name="menu" width={20} height={20}/></button>
      </div>
    </div>
    <dialog className={styles.dialog} ref={menu} id="exjet-navigation" aria-labelledby="exjet-navigation-title" onCancel={close} onClose={close} onClick={event=>{if(event.target===menu.current)close();}}>
      <div className={styles.menuInner}>
        <div className={styles.menuTitle}><h2 id="exjet-navigation-title">Explore EXJET</h2><button className={styles.close} type="button" aria-label="Close navigation" onClick={close}><Icon name="close"/></button></div>
        <div className={styles.menuHighlights}><Link href="/charter/" onClick={close}>Plan a flight <Icon name="forward"/></Link><Link href="/search/" onClick={close}>Search the site <Icon name="search"/></Link></div>
        {groups.map(([title,links])=><details key={title} className={styles.group}><summary>{title}<Icon name="chevron"/></summary><nav aria-label={title}>
          {links.map(([label,href])=><Link key={href} href={href} onClick={close} aria-current={current===href?"page":undefined}>{label}</Link>)}
        </nav></details>)}
      </div>
    </dialog>
  </header>;
}
