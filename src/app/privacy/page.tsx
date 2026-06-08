import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "EXJET Privacy Policy — how we collect, use, and protect your personal data.",
};

const sections = [
  {
    title: "1. Information We Collect",
    body: "We collect information you provide directly, including name, email, phone number, passport details, date of birth, and payment information when you register, book a flight, or apply for an EXJET Card. We also collect usage data, device information, and location data when you use our platform.",
  },
  {
    title: "2. How We Use Your Information",
    body: "Your information is used to process bookings, communicate about your flights, verify your identity, prevent fraud, improve our services, and comply with legal obligations including aviation security regulations. We do not sell your personal data to third parties.",
  },
  {
    title: "3. Data Sharing",
    body: "We share your personal data with the operating air carriers for your booked flights (required by aviation regulations), FBO operators, customs and immigration authorities as required by law, and payment processors. All third parties are contractually bound to protect your data.",
  },
  {
    title: "4. Passport & Travel Document Data",
    body: "Passport and travel document information is required by international aviation regulations and may be shared with government authorities, customs agencies, and the operating carrier. This data is encrypted at rest and transmitted only over secure channels.",
  },
  {
    title: "5. Payment Security",
    body: "Payment card information is processed by PCI-DSS compliant payment processors. EXJET does not store raw card numbers. Jet Card deposit funds are held in a dedicated client trust account separate from EXJET's operating funds.",
  },
  {
    title: "6. Data Retention",
    body: "We retain your personal data for as long as your account is active and for seven years after account closure to comply with financial and aviation recordkeeping requirements. You may request deletion of marketing preferences at any time.",
  },
  {
    title: "7. Your Rights",
    body: "Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data. You may opt out of marketing communications at any time. California residents have additional rights under the CCPA. EU residents have rights under GDPR.",
  },
  {
    title: "8. Cookies",
    body: "Our platform uses cookies and similar technologies to maintain sessions, remember preferences, and analyze usage. You may control cookie settings in your browser. Some cookies are necessary for the platform to function correctly.",
  },
  {
    title: "9. Children's Privacy",
    body: "EXJET's services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from minors. Minors may travel as passengers only when accompanied by a responsible adult who holds the booking.",
  },
  {
    title: "10. Contact & Complaints",
    body: "For privacy-related requests or complaints, contact our Data Protection Officer at privacy@exjet.com. EU residents may also lodge a complaint with their local supervisory authority.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f5f0eb] text-[#0a1628]">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
          <Link href="/" className="hover:text-[#0a1628] transition-colors">Home</Link>
          <span className="text-neutral-300">›</span>
          <span className="text-neutral-600">Privacy</span>
        </nav>

        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">Legal</p>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight tracking-tight text-[#0a1628]">
            Privacy Policy
          </h1>
          <p className="mt-3 text-[14px] text-neutral-500">
            Last updated: January 1, 2026 · Applies to all EXJET services.
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
            Privacy questions?{" "}
            <Link href="/contact" className="font-medium text-[#0d1f3c] hover:underline">
              Contact our team
            </Link>
            {" "}or review our{" "}
            <Link href="/terms" className="font-medium text-[#0d1f3c] hover:underline">
              Terms of Service
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
