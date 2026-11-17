"use client";
import Link from 'next/link';
import { useId, useRef, useState, type FormEvent } from 'react';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight';
import { ArrowsLeftRightIcon } from '@phosphor-icons/react/dist/csr/ArrowsLeftRight';
import { AirplaneTakeoffIcon } from '@phosphor-icons/react/dist/csr/AirplaneTakeoff';
import { AirplaneLandingIcon } from '@phosphor-icons/react/dist/csr/AirplaneLanding';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check';
import { BookmarkSimpleIcon } from '@phosphor-icons/react/dist/csr/BookmarkSimple';
import { CopyIcon } from '@phosphor-icons/react/dist/csr/Copy';
import { EnvelopeSimpleIcon } from '@phosphor-icons/react/dist/csr/EnvelopeSimple';
import { localDate } from '@/components/localDate';
import { itineraryError, readLocalTrips, TRIPS_KEY, tripText, type FlightSegment, type LocalTrip } from '@/lib/itinerary';
import { siteConfig } from '@/data/site';
import s from './Journey.module.css';

const airports = ['Dallas Love Field (DAL)', 'New York · Teterboro (TEB)', 'Miami · Opa-locka (OPF)', 'Los Angeles · Van Nuys (VNY)', 'Aspen (ASE)', 'Las Vegas · Harry Reid (LAS)', 'Palm Beach (PBI)', 'Chicago · Midway (MDW)', 'London · Farnborough (FAB)', 'Paris · Le Bourget (LBG)', 'Dubai · Al Maktoum (DWC)', 'Cabo San Lucas (CSL)'];
const emptySegment: FlightSegment = { from: '', to: '', date: '' };
export function TripPlanner() {
  const id = useId();
  const [type, setType] = useState<LocalTrip['type']>('one-way');
  const [segments, setSegments] = useState<FlightSegment[]>([{ ...emptySegment }]);
  const [passengers, setPassengers] = useState(2);
  const [review, setReview] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const today = localDate();
  function changeType(next: LocalTrip['type']) {
    setType(next); setReview(false); setSaved(false); setError('');
    setSegments(current => next === 'one-way' ? [current[0]] : next === 'round-trip' ? [current[0], { from: current[0].to, to: current[0].from, date: current[1]?.date || '' }] : current.length > 1 ? current : [...current, { from: current[0].to, to: '', date: '' }]);
  }
  function update(index: number, key: keyof FlightSegment, value: string) {
    setSegments(current => {
      const updated = current.map((flight, i) => i === index ? { ...flight, [key]: value } : flight);
      if (type === 'round-trip' && index === 0 && key !== 'date') updated[1] = { ...updated[1], from: updated[0].to, to: updated[0].from };
      return updated;
    }); setSaved(false); setError('');
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const current = segments.map((_, index) => ({ from: String(fields.get(`from-${index}`) || '').trim(), to: String(fields.get(`to-${index}`) || '').trim(), date: String(fields.get(`date-${index}`) || '') }));
    const count = Number(fields.get('passengers'));
    const problem = itineraryError(current, count, today);
    if (problem) { setError(problem); return; }
    setSegments(current); setPassengers(count); setReview(true); setError(''); setMessage('');
    requestAnimationFrame(() => heading.current?.focus());
  }
  function save() {
    setError('');
    try {
      const trips = readLocalTrips();
      const trip: LocalTrip = { id: Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join(''), name: `${segments[0].from} to ${segments[0].to}`, type, passengers, segments, savedAt: new Date().toISOString() };
      localStorage.setItem(TRIPS_KEY, JSON.stringify([trip, ...trips].slice(0, 50)));
      setSaved(true); setMessage('Saved on this browser. No booking or request has been made.');
    } catch { setError('Your browser could not save this plan. You can copy the itinerary instead.'); }
  }
  async function copy() {
    setError('');
    try { await navigator.clipboard.writeText(tripText({ segments, passengers })); setMessage('Itinerary copied.'); }
    catch { setError('Copy is unavailable in this browser. Select the itinerary text to copy it.'); }
  }
  return <section className={s.planner} aria-label="Charter trip planner">
    <div className={s.plannerTop}><div className={s.segmented} role="group" aria-label="Trip type">{([['one-way', 'One way'], ['round-trip', 'Round trip'], ['multi-city', 'Multi-city']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={type === value} onClick={() => changeType(value)}>{label}</button>)}</div><span className={s.plannerLabel}>Your aircraft. Your schedule.</span></div>
    {review ? <div className={s.review}>
      <div className={s.sectionHead}><div><span className={s.eyebrow}>YOUR ITINERARY</span><h3 ref={heading} tabIndex={-1}>A little closer to takeoff.</h3></div><button className={s.textButton} type="button" onClick={() => { setReview(false); setMessage(''); }}>Edit trip</button></div>
      <ol className={s.reviewLegs}>{segments.map((flight, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span><div><strong>{flight.from}</strong><ArrowRightIcon size={18} aria-label="to"/><strong>{flight.to}</strong></div><time dateTime={flight.date}>{flight.date}</time></li>)}</ol>
      <div className={s.reviewFooter}><p>{passengers} passengers · Planning draft, not a reservation</p><div className={s.reviewActions}><button className={s.secondary} type="button" onClick={copy}><CopyIcon size={18} aria-hidden="true"/>Copy</button><button className={s.secondary} type="button" onClick={save} disabled={saved}>{saved ? <CheckIcon size={18} aria-hidden="true"/> : <BookmarkSimpleIcon size={18} aria-hidden="true"/>}{saved ? 'Saved' : 'Save trip'}</button><a className={s.primary} href={`mailto:${siteConfig.email.charter}?subject=${encodeURIComponent('EXJET charter itinerary')}&body=${encodeURIComponent(tripText({ segments, passengers }))}`}>Email itinerary <EnvelopeSimpleIcon size={18} aria-hidden="true"/></a></div></div>
      <p className={s.finePrint}>Email opens a draft in your mail app for you to review and send. Prefer to search aircraft now? <Link href="/app/search/#aircraft-search">Open flight search</Link>.</p>
    </div> : <form onSubmit={submit}>
      <datalist id={`${id}-airports`}>{airports.map(airport => <option key={airport} value={airport}/>)}</datalist>
      {segments.map((flight, index) => <div className={s.flightRow} key={index}>
        {segments.length > 1 && <div className={s.flightNumber}>FLIGHT {String(index + 1).padStart(2, '0')}{type === 'multi-city' && segments.length > 1 && <button type="button" aria-label={`Remove flight ${index + 1}`} onClick={() => setSegments(current => current.filter((_, i) => i !== index))}><XIcon size={16} aria-hidden="true"/></button>}</div>}
        <div className={s.routeFields}>
          <label className={s.field}><span><AirplaneTakeoffIcon size={17} aria-hidden="true"/>From</span><input name={`from-${index}`} list={`${id}-airports`} value={flight.from} onChange={event => update(index, 'from', event.target.value)} placeholder="City or airport" aria-label={`Flight ${index + 1} departure`} maxLength={120} required readOnly={type === 'round-trip' && index === 1}/></label>
          <button className={s.swap} type="button" aria-label={`Swap flight ${index + 1} airports`} disabled={type === 'round-trip' && index === 1} onClick={() => { setSegments(current => { const next = current.map((item, i) => i === index ? { ...item, from: item.to, to: item.from } : item); if (type === 'round-trip') next[1] = { ...next[1], from: next[0].to, to: next[0].from }; return next; }); }}><ArrowsLeftRightIcon size={17} aria-hidden="true"/></button>
          <label className={s.field}><span><AirplaneLandingIcon size={17} aria-hidden="true"/>To</span><input name={`to-${index}`} list={`${id}-airports`} value={flight.to} onChange={event => update(index, 'to', event.target.value)} placeholder="City or airport" aria-label={`Flight ${index + 1} arrival`} maxLength={120} required readOnly={type === 'round-trip' && index === 1}/></label>
          <label className={`${s.field} ${s.dateField}`}><span>Departure</span><input name={`date-${index}`} type="date" min={index ? segments[index - 1].date || today : today} value={flight.date} onChange={event => update(index, 'date', event.target.value)} aria-label={`Flight ${index + 1} date`} required/></label>
        </div>
      </div>)}
      <div className={s.plannerBottom}><div className={s.passengers}><span>Passengers</span><button type="button" disabled={passengers <= 1} aria-label="Remove a passenger" onClick={() => setPassengers(n => n - 1)}><MinusIcon size={16} aria-hidden="true"/></button><input name="passengers" type="number" min={1} max={100} value={passengers} onChange={e => setPassengers(Number(e.target.value))} aria-label="Passenger count" required/><button type="button" disabled={passengers >= 100} aria-label="Add a passenger" onClick={() => setPassengers(n => n + 1)}><PlusIcon size={16} aria-hidden="true"/></button></div>{type === 'multi-city' && segments.length < 6 && <button className={s.textButton} type="button" onClick={() => setSegments(current => [...current, { from: current.at(-1)?.to || '', to: '', date: '' }])}><PlusIcon size={18} aria-hidden="true"/>Add flight</button>}<button className={s.primary} type="submit">Review itinerary <ArrowRightIcon size={18} aria-hidden="true"/></button></div>
      <p className={s.finePrint}>Plan first. Save on this browser or share your itinerary with EXJET when you’re ready.</p>
    </form>}
    {error && <p className={s.error} role="alert">{error}</p>}{message && <p className={s.feedback} role="status">{message}{saved && <> <Link href="/app/trips/">View saved trips →</Link></>}</p>}
  </section>;
}
