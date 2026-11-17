"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

export function TrackInquiry({ event }: { event: "quote_request" | "contact_request" }) {
  useEffect(() => {
    track(event);
  }, [event]);
  return null;
}
