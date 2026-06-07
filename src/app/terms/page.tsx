import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "EXJET Terms of Service — private jet charter, jet card, and aircraft sales.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using EXJET's platform, services, or booking any charter flight, jet card, or aircraft transaction, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.",
  },
  {
    title: "2. Charter Services",
    body: "EXJET acts as a broker between passengers and FAR Part 135 certificated air carriers. All flights are operated by independently certificated carriers holding valid ARGUS or Wyvern safety ratings. EXJET is not the direct air carrier and assumes no liability for the acts or omissions of the operating carrier.",
  },
  {
    title: "3. Jet Card Program",
    body: "EXJET Card deposits are fully refundable at any time upon written request, subject to a processing period of up to 10 business days. Funds do not expire. Management fees are calculated on the operator's disclosed wholesale cost and deducted at the time of each flight.",
  },
  {
    title: "4. Booking Confirmation",
    body: "A booking is confirmed only upon execution of a signed charter agreement delivered via DocuSign and receipt of the required deposit or flight credit deduction. Verbal agreements do not constitute a confirmed booking.",
  },
  {
    title: "5. Cancellation Policy",
    body: "Cancellations received more than 48 hours prior to scheduled departure receive a full flight credit. Cancellations within 48 hours of departure may incur a fee of up to 100% of the charter price, depending on the operator's terms. EXJET Card holders receive preferential cancellation terms.",
  },
  {
    title: "6. Passenger Conduct",
    body: "All passengers must comply with crew instructions, applicable aviation regulations, and EXJET's code of conduct. EXJET reserves the right to deny boarding or remove passengers who pose a safety risk or are in violation of these terms, without refund.",
  },
  {
    title: "7. Limitation of Liability",
    body: "EXJET's liability for any claim arising from charter services is limited to the amount paid for the specific flight in question. EXJET is not liable for delays, diversions, or cancellations caused by weather, air traffic control, mechanical issues, or acts outside its control.",
  },
  {
    title: "8. Pricing",
    body: "All prices are quoted in USD and are subject to change until a binding charter agreement is executed. Quoted rates may exclude applicable taxes, landing fees, FBO handling charges, international overfly permits, and customs fees unless explicitly stated otherwise.",
  },
  {
    title: "9. Privacy",
    body: "Your personal data is collected and processed in accordance with our Privacy Policy. By using EXJET services, you consent to the collection and use of your data as described therein.",
  },
  {
    title: "10. Governing Law",
    body: "These Terms are governed by the laws of the State of Delaware, United States. Any disputes shall be resolved by binding arbitration in Wilmington, Delaware, except where prohibited by law.",
  },
  {
    title: "11. Modifications",
    body: "EXJET reserves the right to modify these Terms at any time. Changes are effective upon posting to exjet.com. Continued use of our services constitutes acceptance of revised Terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f2f2f7] text-[#0a1628]">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
          <Link href="/" className="hover:text-[#0a1628] transition-colors">Home</Link>
          <span className="text-neutral-300">›</span>
          <span className="text-neutral-600">Terms</span>
        </nav>

        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">Legal</p>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight tracking-tight text-[#0a1628]">
            Terms of Service
          </h1>
          <p className="mt-3 text-[14px] text-neutral-500">
            Last updated: January 1, 2026 · Effective immediately upon acceptance.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="mb-3 text-[15px] font-semibold text-[#0a1628]">{s.title}</h2>
              <p className="text-[14px] leading-relaxed text-neutral-600">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 text-center">
          <p className="text-[14px] text-neutral-600">
            Questions about our terms?{" "}
            <Link href="/contact" className="font-medium text-[#0d1f3c] hover:underline">
              Contact us
            </Link>
            {" "}or review our{" "}
            <Link href="/privacy" className="font-medium text-[#0d1f3c] hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
