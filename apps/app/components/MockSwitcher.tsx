"use client";

import { useState, useSyncExternalStore } from "react";
import { mockAdvanceFlight, mockPersona, mockReset, mockSetPersona, mockSimulateReplies, type Persona } from "@/lib/api/mock";
import { isMock } from "@/lib/api";

const PERSONAS: { id: Persona; label: string }[] = [
  { id: "visitor", label: "Visitor" },
  { id: "member", label: "Member, not entitled" },
  { id: "entitled", label: "Entitled member" },
  { id: "admin", label: "Admin" },
];

/** Rendered only when NEXT_PUBLIC_API_MOCK=1 (the import of ./mock is already gated by isMock at the call sites). */
export function MockSwitcher() {
  const [open, setOpen] = useState(false);
  const persona = useSyncExternalStore(() => () => {}, mockPersona, () => "visitor" as Persona);
  if (!isMock()) return null;
  const apply = (fn: () => void) => {
    fn();
    window.location.reload();
  };
  return (
    <div className="dev-switch">
      {open ? (
        <div className="panel" role="dialog" aria-label="Mock controls">
          <div className="eyebrow">Mock user</div>
          <div className="persona">
            {PERSONAS.map((p) => (
              <button key={p.id} className="btn btn-sm" aria-pressed={persona === p.id} style={persona === p.id ? { borderColor: "var(--ink)", boxShadow: "inset 0 0 0 1px var(--ink)" } : undefined} onClick={() => apply(() => mockSetPersona(p.id))}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="eyebrow">Simulate</div>
          <button className="btn btn-sm" onClick={() => apply(mockSimulateReplies)}>Operators reply to open RFQs</button>
          <button className="btn btn-sm" onClick={() => apply(() => void mockAdvanceFlight())}>Advance flight status</button>
          <button className="btn btn-sm btn-danger" onClick={() => apply(mockReset)}>Reset mock data</button>
          <p className="help">Synthetic data only. Active only because NEXT_PUBLIC_API_MOCK=1.</p>
        </div>
      ) : null}
      <button className="toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        MOCK · {persona}
      </button>
    </div>
  );
}
