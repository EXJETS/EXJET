import { PortalAccess, PortalIntro, DataUnavailable } from "@/components/portal/PortalAccess";
import { PortalForm } from "@/components/portal/PortalForm";
import { portalIdentity } from "@/lib/supabase/server";
import { saveProfile, signOut } from "../actions";
import styles from "@/components/portal/Portal.module.css";
export const metadata={title:"Account settings"};
export default async function Settings(){
 const identity=await portalIdentity();const intro=<PortalIntro title="Your account." description="Manage how you plan and stay connected with EXJET."/>;
 if(!identity)return <>{intro}<PortalAccess next="/app/settings/"/></>;
 const {data,error}=await identity.client.from("portal_profiles").select("full_name,company,travel_role").eq("user_id",identity.user.id).maybeSingle();
 return <>{intro}{error?<DataUnavailable/>:<section className={styles.panel}><h2>Profile</h2><PortalForm action={saveProfile} label="Save profile"><div className={styles.fields}><label>Full name<input name="full_name" autoComplete="name" defaultValue={data?.full_name||""} minLength={2} maxLength={100} required/></label><label>Company or family office<input name="company" autoComplete="organization" defaultValue={data?.company||""} maxLength={120}/></label></div><label>I arrange travel as<select name="travel_role" defaultValue={data?.travel_role||"traveler"}><option value="traveler">A traveler</option><option value="executive_assistant">An executive assistant</option><option value="family_office">A family office</option><option value="corporate_team">A corporate travel team</option></select></label><p className={styles.help}>This preference helps personalize planning. It does not grant access to another person’s trips or account.</p></PortalForm></section>}<section className={styles.panel}><h2>Sign-in and security</h2><p>Verified email: {identity.user.email}</p><p>Sign-in uses a one-time email link. Your email account controls access to this workspace.</p><form action={signOut}><button type="submit" className={styles.secondary}>Sign out of this browser</button></form></section></>;
}
