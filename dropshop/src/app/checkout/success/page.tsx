import { Suspense } from "react";
import { SuccessContent } from "./success-content";
export const metadata = { title: "Order Confirmed" };
export default function SuccessPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><SuccessContent /></Suspense>;
}
