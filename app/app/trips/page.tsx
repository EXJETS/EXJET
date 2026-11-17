import { LocalTrips } from "@/components/portal/LocalTrips";
import Link from "next/link";
import { PortalIntro, DataUnavailable } from "@/components/portal/PortalAccess";
import { PortalForm } from "@/components/portal/PortalForm";
import { portalIdentity } from "@/lib/supabase/server";
import { saveTripDraft, removeTripDraft } from "../actions";
import styles from "@/components/portal/Portal.module.css";
export const metadata = { title: "My trips" };
export default async function Trips({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const params = await searchParams;
  const view = params.view === "upcoming" || params.view === "past" ? params.view : "drafts";
  const rawPage=Number(params.page || 1); const page=Number.isSafeInteger(rawPage)&&rawPage>0&&rawPage<10000?rawPage:1;
  const identity = await portalIdentity();
  const intro=<PortalIntro title="Your journeys, together." description="Keep ideas in drafts and review confirmed itineraries once EXJET adds them to your account." />;
  if (!identity) return <><PortalIntro eyebrow="Your workspace" title="Good plans deserve a place." description="Save your next journey, keep the details together and pick up where you left off." /><LocalTrips /></>;
  const query=identity.client.from(view === "drafts" ? "portal_trip_drafts" : "portal_confirmed_trips").select("*",{count:"exact"}).eq("user_id",identity.user.id);
  const now=new Date().toISOString();
  if(view === "upcoming") query.gte("departure_at",now);
  if(view === "past") query.lt("departure_at",now);
  const { data, error, count }=await query.order(view === "drafts" ? "created_at" : "departure_at",{ascending:view === "upcoming"}).range((page-1)*25,page*25-1);
  return <>{intro}<nav className={styles.tabs} aria-label="Trip views">{[["drafts","Drafts"],["upcoming","Upcoming"],["past","Past"]].map(([value,label])=><Link key={value} href={`/app/trips/?view=${value}`} aria-current={view===value?"page":undefined}>{label}</Link>)}</nav>
    {error ? <DataUnavailable /> : <section className={styles.panel}>{data?.length ? <>{data.map(item=><article className={styles.record} key={item.id}><div><span className={styles.badge}>{view==="drafts"?"Draft · not booked":item.status}</span><h3>{item.departure} → {item.arrival}</h3><p>{view==="drafts"?item.departure_date:new Intl.DateTimeFormat("en-US",{dateStyle:"medium",timeStyle:"short",timeZone:"UTC"}).format(new Date(item.departure_at))+" UTC"}{item.passengers ? ` · ${item.passengers} passengers`:""}</p>{item.aircraft&&<p>{item.aircraft}</p>}{item.operator_name&&<p>Operator: {item.operator_name}</p>}{item.reference&&<p>Reference: {item.reference}</p>}{item.notes&&<p>{item.notes}</p>}</div>{view==="drafts"?<PortalForm action={removeTripDraft} label="Remove draft"><input type="hidden" name="id" value={item.id}/></PortalForm>:<Link href="/app/messages/" className={styles.secondary}>Contact your advisor</Link>}</article>)}<nav className={styles.tabs} aria-label="Trip pages">{page>1&&<Link href={`/app/trips/?view=${view}&page=${page-1}`}>Previous</Link>}{(count||0)>page*25&&<Link href={`/app/trips/?view=${view}&page=${page+1}`}>Next</Link>}</nav></>:<div className={styles.empty}><h2>{view==="drafts"?"Your next journey starts here.":"No trips in this view."}</h2><p>{view==="drafts"?"Save an itinerary below, then use flight search when you’re ready to request options.":"Confirmed itineraries appear after your advisor adds them to this account. Contact EXJET if you expected to see a trip."}</p></div>}</section>}
    {view==="drafts"&&<section className={styles.panel}><h2>Save a trip idea</h2><PortalForm action={saveTripDraft} label="Save draft"><div className={styles.fields}><label>Departure airport<input name="departure" placeholder="KDAL" minLength={3} maxLength={4} pattern="[A-Za-z0-9]{3,4}" required /></label><label>Arrival airport<input name="arrival" placeholder="KTEB" minLength={3} maxLength={4} pattern="[A-Za-z0-9]{3,4}" required /></label><label>Departure date<input name="departure_date" type="date" required /></label><label>Passengers<input name="passengers" type="number" min={1} max={100} defaultValue={2} required /></label></div><label>Planning notes<textarea name="notes" rows={3} maxLength={2000} placeholder="Schedule flexibility, cabin priorities and baggage." /></label><p className={styles.help}>A draft is private to your account. It does not request, reserve or confirm an aircraft. Please avoid passport, payment or medical details.</p></PortalForm></section>}
  </>;
}
