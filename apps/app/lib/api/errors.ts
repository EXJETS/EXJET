import type { ApiError } from "./client";

/** Friendly, specific messages for error codes the UI should explain in its own words. Falls back to the API message. */
const MESSAGES: Record<string, string> = {
  rfq_daily_cap_reached: "You have reached today's limit for requests to operators. Try again tomorrow, or contact EXJET if this is urgent.",
  ground_rfq_daily_cap_reached: "You have reached today's limit for ground transportation requests. Try again tomorrow.",
  rate_limited: "Too many attempts in a short time. Wait a minute and try again.",
  duplicate_ground_rfq: "A request for this service at this FBO and leg was already sent.",
  seat_not_available: "No seat is available on this membership. Remove an invitation or change plan first.",
  seat_limit_reached: "All seats on this membership are used or reserved by pending invitations.",
  subscription_required: "An active membership is required first.",
  kyc_required: "Complete the identity check before choosing a membership.",
  member_individual_only: "Invited members complete an individual identity check.",
  payment_host_not_approved: "The payment site in this quote is not approved for this operator. EXJET is reviewing it; you cannot pay or accept it yet.",
  airport_timezone_unknown: "We could not determine the time zone of the departure airport, so the departure time cannot be saved. Choose a different airport or contact EXJET.",
  nonexistent_local_time: "That local time does not exist on that date (a daylight saving change). Choose another time.",
  unknown_passenger: "A passenger record in this list does not belong to this trip. Reload the page and try again.",
  duplicate_passenger_id: "The same passenger appears twice in the list.",
  email_not_verified: "Verify your email address first. Check your inbox for the link.",
  invalid_token: "This link is invalid, expired or already used.",
  forbidden: "You do not have permission to do that.",
  csrf_failed: "Your session looks out of date. Reload the page and try again.",
};

export function friendlyError(e: Pick<ApiError, "code" | "message">): string {
  return MESSAGES[e.code] ?? e.message;
}
