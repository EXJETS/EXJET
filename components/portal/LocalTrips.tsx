"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight';
import { BookmarkSimpleIcon } from '@phosphor-icons/react/dist/csr/BookmarkSimple';
import { CopyIcon } from '@phosphor-icons/react/dist/csr/Copy';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
import { EnvelopeSimpleIcon } from '@phosphor-icons/react/dist/csr/EnvelopeSimple';
import { readLocalTrips, TRIPS_KEY, tripText, type LocalTrip } from '@/lib/itinerary';
import { siteConfig } from '@/data/site';
import s from './Journey.module.css';
export function LocalTrips() {
  const [trips, setTrips] = useState<LocalTrip[] | null>(null);
  const [status, setStatus] = useState('');
  const [removed, setRemoved] = useState<LocalTrip | null>(null);
  useEffect(() => { function read() { try { setTrips(readLocalTrips()); } catch { setTrips([]); setStatus('Saved plans could not be read in this browser.'); } } read(); window.addEventListener('storage', read); return () => window.removeEventListener('storage', read); }, []);
  function persist(next: LocalTrip[]) { try { localStorage.setItem(TRIPS_KEY, JSON.stringify(next)); setTrips(next); return true; } catch { setStatus('Your browser could not save this change.'); return false; } }
  async function copy(trip: LocalTrip) { try { await navigator.clipboard.writeText(tripText(trip)); setStatus('Itinerary copied.'); } catch { setStatus('Copy is unavailable. You can select and copy the itinerary text.'); } }
  return <section className={s.savedTrips}><div className={s.storageNote}><BookmarkSimpleIcon size={19} aria-hidden="true"/><p>Saved on this browser only. These are trip plans, not confirmed bookings.</p></div>
    {status && <p className={s.feedback} role="status">{status}</p>}{removed && <div className={s.undo} role="status">Trip removed.<button type="button" onClick={() => { if (persist([removed, ...(trips || [])].slice(0,50))) setRemoved(null); }}>Undo</button></div>}
    {trips === null ? <p role="status">Loading your saved plans…</p> : trips.length ? <div className={s.savedList}>{trips.map(trip => <article className={s.tripCard} key={trip.id}><div className={s.sectionHead}><span className={s.eyebrow}>{trip.type.replaceAll('-', ' ')} · {trip.passengers} PASSENGERS</span><button className={s.iconButton} type="button" aria-label={`Remove ${trip.name}`} onClick={() => { if (persist(trips.filter(item=>item.id!==trip.id))) setRemoved(trip); }}><TrashIcon size={20} aria-hidden="true"/></button></div><ol className={s.reviewLegs}>{trip.segments.map((flight, i) => <li key={i}><div><strong>{flight.from}</strong><ArrowRightIcon size={18} aria-label="to"/><strong>{flight.to}</strong></div><time dateTime={flight.date}>{flight.date}</time></li>)}</ol><div className={s.reviewActions}><button className={s.secondary} type="button" onClick={()=>copy(trip)}><CopyIcon size={18} aria-hidden="true"/>Copy itinerary</button><a className={s.primary} href={`mailto:${siteConfig.email.charter}?subject=${encodeURIComponent('EXJET charter itinerary')}&body=${encodeURIComponent(tripText(trip))}`}>Email itinerary <EnvelopeSimpleIcon size={18} aria-hidden="true"/></a></div></article>)}</div> : <div className={s.emptyState}><div className={s.emptyIcon}><BookmarkSimpleIcon size={33} weight="light" aria-hidden="true"/></div><p className={s.eyebrow}>THE START OF SOMETHING GOOD</p><h2>Your next journey lives here.</h2><p>Build an itinerary, save it, and return when you’re ready.<br/>No account needed to start planning.</p><Link className={s.primary} href="/app/search/#plan-trip">Plan a trip <ArrowRightIcon size={18} aria-hidden="true"/></Link></div>}
  </section>;
}
