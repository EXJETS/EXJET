"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPortalClient, portalIdentity } from "@/lib/supabase/server";
import { portalOrigin, safeReturnPath } from "@/lib/portal/config";
import { airportField, dateField, passengerField, textField, uuidField } from "@/lib/portal/validation";

export type ActionState = { error?: string; success?: string };
async function identity() {
  const value = await portalIdentity();
  if (!value) throw new Error("Sign in to continue.");
  return value;
}
function failure(error: unknown): ActionState {
  return { error: error instanceof Error ? error.message : "The request could not be completed. Try again." };
}
export async function requestSignIn(_state: ActionState, form: FormData): Promise<ActionState> {
  try {
    const client = await createPortalClient();
    if (!client) return { error: "Client sign-in is not available yet. Please contact EXJET." };
    const email = textField(form, "email", 254, 5).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
    const next = safeReturnPath(form.get("next"));
    const callback = new URL("/app/auth/callback/", portalOrigin());
    callback.searchParams.set("next", next);
    const { error } = await client.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: callback.toString() } });
    if (error) return { error: "We could not send a sign-in link. Please wait a minute and try again, or contact EXJET." };
    return { success: "Check your email for a secure sign-in link. Open it in this browser to continue." };
  } catch { return { error: "Sign-in is temporarily unavailable. Please try again." }; }
}
export async function signOut() {
  const client = await createPortalClient();
  if (client) {
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) throw new Error("Could not sign out. Please try again.");
  }
  redirect("/app/login/");
}
export async function saveProfile(_state: ActionState, form: FormData): Promise<ActionState> {
  try {
    const { client, user } = await identity();
    const full_name = textField(form, "full_name", 100, 2);
    const company = textField(form, "company", 120);
    const travel_role = textField(form, "travel_role", 30);
    if (!["traveler","executive_assistant","family_office","corporate_team"].includes(travel_role)) throw new Error("Choose a travel role.");
    const { error } = await client.from("portal_profiles").upsert({ user_id: user.id, full_name, company, travel_role }, { onConflict: "user_id" });
    if (error) return { error: "Your profile could not be saved. Please try again." };
    revalidatePath("/app", "layout");
    return { success: "Profile saved." };
  } catch (error) { return failure(error); }
}
export async function saveLocation(_state: ActionState, form: FormData): Promise<ActionState> {
  try {
    const { client, user } = await identity();
    const code = airportField(form, "airport");
    const label = textField(form, "label", 100, 2);
    const { error } = await client.from("portal_locations").upsert({ user_id: user.id, airport_code: code, label }, { onConflict: "user_id,airport_code" });
    if (error) return { error: "The location could not be saved. Please try again." };
    revalidatePath("/app/locations");
    return { success: "Location saved to your account." };
  } catch (error) { return failure(error); }
}
export async function removeLocation(_state: ActionState, form: FormData): Promise<ActionState> {
  try {
    const { client, user } = await identity();
    const { error } = await client.from("portal_locations").delete().eq("id", uuidField(form)).eq("user_id", user.id);
    if (error) return { error: "The location could not be removed." };
    revalidatePath("/app/locations"); return { success: "Location removed." };
  } catch (error) { return failure(error); }
}
export async function saveTripDraft(_state: ActionState, form: FormData): Promise<ActionState> {
  try {
    const { client, user } = await identity();
    const departure = airportField(form, "departure");
    const arrival = airportField(form, "arrival");
    if (departure === arrival) throw new Error("Choose different departure and arrival airports.");
    const departure_date = dateField(form, "departure_date");
    if (departure_date < new Date(Date.now() - 86400000).toISOString().slice(0,10)) throw new Error("Choose an upcoming departure date.");
    const { error } = await client.from("portal_trip_drafts").insert({ user_id: user.id, departure, arrival, departure_date, passengers: passengerField(form), notes: textField(form, "notes", 2000) });
    if (error) return { error: "The trip draft could not be saved." };
    revalidatePath("/app/trips"); revalidatePath("/app");
    return { success: "Trip draft saved. This does not request or confirm a flight." };
  } catch (error) { return failure(error); }
}
export async function removeTripDraft(_state: ActionState, form: FormData): Promise<ActionState> {
  try {
    const { client, user } = await identity();
    const { error } = await client.from("portal_trip_drafts").delete().eq("id", uuidField(form)).eq("user_id", user.id);
    if (error) return { error: "The draft could not be removed." };
    revalidatePath("/app/trips"); revalidatePath("/app"); return { success: "Draft removed." };
  } catch (error) { return failure(error); }
}
export async function sendPortalMessage(_state: ActionState, form: FormData): Promise<ActionState> {
  try {
    const { client, user } = await identity();
    const body = textField(form, "message", 4000, 2);
    const { error } = await client.from("portal_messages").insert({ user_id: user.id, direction: "customer", body });
    if (error) return { error: "Your message could not be saved. Please call EXJET for urgent assistance." };
    revalidatePath("/app/messages");
    return { success: "Message saved in your conversation. Call EXJET for time-sensitive travel changes." };
  } catch (error) { return failure(error); }
}
export async function replyToMessage(_state: ActionState, form: FormData): Promise<ActionState> {
  try {
    const { client, user } = await identity();
    const { data: staff } = await client.from("portal_staff").select("user_id").eq("user_id", user.id).maybeSingle();
    if (!staff) throw new Error("Staff access is required.");
    const { data: message, error: readError } = await client.from("portal_messages").select("user_id").eq("id", uuidField(form)).single();
    if (readError || !message) throw new Error("Conversation unavailable.");
    const { error } = await client.from("portal_messages").insert({ user_id: message.user_id, direction: "advisor", body: textField(form, "message", 4000, 2) });
    if (error) return { error: "Reply could not be saved." };
    revalidatePath("/app/team"); return { success: "Reply saved to the client conversation." };
  } catch (error) { return failure(error); }
}
