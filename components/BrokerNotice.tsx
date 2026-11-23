import Link from "next/link";

export function BrokerNotice({ className = "", prominent = false }: { className?: string; prominent?: boolean }) {
  const copy = "EXJET LLC is an air charter broker. EXJET is not a direct air carrier or direct foreign air carrier and has no operational control of aircraft. Properly licensed direct air carriers or direct foreign air carriers operate the advertised flights.";
  if (!prominent) return <p className={`broker-notice ${className}`}>{copy}</p>;
  return (
    <div className="ex-broker-disclosure">
      <p>{copy} <Link href="/charter-terms/">Charter disclosures</Link></p>
    </div>
  );
}
