import { LocalAirports } from "@/components/portal/LocalAirports";
import { PortalIntro, DataUnavailable } from "@/components/portal/PortalAccess";
import { PortalForm } from "@/components/portal/PortalForm";
import { portalIdentity } from "@/lib/supabase/server";
import { saveLocation, removeLocation } from "../actions";
import styles from "@/components/portal/Portal.module.css";
export const metadata={title:"Saved locations"};
export default async function Locations(){
 const identity=await portalIdentity();
 const intro=<PortalIntro title="The places you return to." description="Keep your preferred airport codes together for your next planning conversation."/>;
 if(!identity)return <>{intro}<LocalAirports/></>;
 const {data,error}=await identity.client.from("portal_locations").select("id,airport_code,label").eq("user_id",identity.user.id).order("label");
 return <>{intro}{error?<DataUnavailable/>:<section className={styles.panel}><h2>Preferred airports</h2>{data?.length?data.map(item=><article className={styles.record} key={item.id}><div><h3>{item.label}</h3><p>{item.airport_code}</p></div><PortalForm action={removeLocation} label="Remove"><input type="hidden" name="id" value={item.id}/></PortalForm></article>):<p>No saved locations yet. Add an airport below.</p>}</section>}<section className={styles.panel}><h2>Add an airport</h2><PortalForm action={saveLocation} label="Save location"><div className={styles.fields}><label>Location name<input name="label" minLength={2} maxLength={100} placeholder="Dallas Love Field" required/></label><label>IATA or ICAO code<input name="airport" minLength={3} maxLength={4} pattern="[A-Za-z0-9]{3,4}" placeholder="KDAL" required/></label></div><p className={styles.help}>Saved codes are planning preferences. Airport suitability is verified for each flight.</p></PortalForm></section></>;
}
