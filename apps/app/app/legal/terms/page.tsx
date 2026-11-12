import Link from "next/link";
import { AuthFrame } from "@/components/AuthFrame";

export const metadata = { title: "Terms of Use" };

export default function Terms() {
  return (
    <AuthFrame title="Terms of Use">
      <div style={{ display: "grid", gap: 16 }}>
        <div className="banner wait" role="note">
          <div>Legal text pending counsel review. This page is a placeholder and is not the final agreement.</div>
        </div>
        <p>
          EXJET arranges charter requests between members and licensed third-party air carriers. Flights are operated by the carrier named in each contract.
        </p>
        <p>
          EXJET is not liable for AOG or anything that happens to the aircraft.
        </p>
        <p>
          EXJET does not process flight payments. Payment for a flight is made directly to the operator through the operator&apos;s own payment link.
        </p>
        <p><Link href="/signup">Back to sign up</Link></p>
      </div>
    </AuthFrame>
  );
}
