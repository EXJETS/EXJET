import type { ReactNode } from "react";

const KIND_HELP: Record<string, string> = {
  payment_host: "An operator quote links to a payment site that is not on the operator's approved list. Approve only if the host belongs to the operator.",
  inbound_review: "An inbound email was held: the sender, authentication or attachments did not pass automatic checks. Approving releases it for processing.",
  seat_overage: "The paid plan no longer covers every member. Extra members are suspended until this is resolved.",
  legal_notice: "A sender used legal or complaint wording. Review the message and decide how to respond; the sender is suppressed from outreach.",
  kyc_final: "Final identity decision. Vendor results inform it; only this decision approves the person.",
  operator_go_live: "Approving makes the operator sellable and lets RFQs be sent to its contacts.",
};

const label = (k: string) => k.replace(/_/g, " ");

function show(v: unknown): ReactNode {
  if (v === null || v === undefined || v === "") return <span className="muted">—</span>;
  if (typeof v === "boolean") return v ? "yes" : "no";
  if (typeof v === "object") return <code className="mono small" style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(v)}</code>;
  return String(v);
}

/** Readable key/value rendering of an approval payload, with a one-line explanation of what the decision means. */
export function PayloadView({ kind, payload }: { kind: string; payload: Record<string, unknown> | null }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {KIND_HELP[kind] ? <p className="muted small">{KIND_HELP[kind]}</p> : null}
      {payload && Object.keys(payload).length ? (
        <dl className="kv">
          {Object.entries(payload).map(([k, v]) => (
            <span key={k} style={{ display: "contents" }}><dt>{label(k)}</dt><dd>{show(v)}</dd></span>
          ))}
        </dl>
      ) : <p className="muted small">No additional detail on this approval.</p>}
    </div>
  );
}
