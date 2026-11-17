import { notFound } from "next/navigation";
import { portalIdentity } from "@/lib/supabase/server";
import { PortalIntro, DataUnavailable } from "@/components/portal/PortalAccess";
import { PortalForm } from "@/components/portal/PortalForm";
import { replyToMessage } from "../actions";
import styles from "@/components/portal/Portal.module.css";
export const metadata={title:"Team inbox"};
export default async function Team(){
 const identity=await portalIdentity();if(!identity)notFound();
 const {data:staff}=await identity.client.from("portal_staff").select("user_id").eq("user_id",identity.user.id).maybeSingle();if(!staff)notFound();
 const {data,error}=await identity.client.from("portal_messages").select("id,user_id,body,direction,created_at").eq("direction","customer").order("created_at",{ascending:false}).limit(100);
 return <><PortalIntro title="Client conversations." description="Latest 100 client messages. Replies are delivered inside the client workspace."/>{error?<DataUnavailable/>:data?.map(item=><section key={item.id} className={styles.panel}><p className={styles.help}>Client {item.user_id} · {item.created_at}</p><p>{item.body}</p><PortalForm action={replyToMessage} label="Reply in workspace"><input type="hidden" name="id" value={item.id}/><label>Reply<textarea name="message" minLength={2} maxLength={4000} rows={3} required/></label></PortalForm></section>)}</>;
}
