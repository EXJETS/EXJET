"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Info, Loader2, Lock } from "lucide-react";
import type { ReactNode } from "react";
import { ApiError } from "@/lib/api";
import type { Query } from "@/hooks/use-api";
import { STATUS_LABEL, statusTone, type Tone } from "@/lib/rules";

export function Chip({ tone = "neutral", children, plain }: { tone?: Tone; children: ReactNode; plain?: boolean }) {
  return <span className={`chip ${tone === "neutral" ? "" : tone} ${plain ? "plain" : ""}`}>{children}</span>;
}

export function StatusChip({ status, label }: { status: string; label?: string }) {
  const text = label ?? STATUS_LABEL[status] ?? status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  return <Chip tone={statusTone(status)}>{text}</Chip>;
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span role="status" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      <Loader2 size={16} className="spin" aria-hidden />
      {label ? <span>{label}</span> : <span className="sr-only">Loading</span>}
    </span>
  );
}

export function Skeleton({ h = 16, w = "100%" }: { h?: number; w?: number | string }) {
  return <div className="skeleton" style={{ height: h, width: w }} aria-hidden />;
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="card-b" role="status" aria-label="Loading" style={{ display: "grid", gap: 12 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} h={20} w={`${92 - (i % 3) * 8}%`} />
      ))}
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="state">
      <strong>{title}</strong>
      {children ? <span style={{ maxWidth: "52ch" }}>{children}</span> : null}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  return (
    <div className="state" role="alert">
      <strong>Could not load this data</strong>
      <span>{error.message}</span>
      {onRetry ? (
        <button className="btn btn-sm" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function Banner({ tone = "neutral", children, actions, live }: { tone?: "neutral" | "ok" | "wait" | "problem"; children: ReactNode; actions?: ReactNode; live?: boolean }) {
  const Icon = tone === "problem" ? AlertTriangle : tone === "ok" ? CheckCircle2 : Info;
  return (
    <div className={`banner ${tone === "neutral" ? "" : tone}`} role={live ? (tone === "problem" ? "alert" : "status") : undefined}>
      <Icon size={16} aria-hidden />
      <div>
        <div>{children}</div>
        {actions ? <div className="actions">{actions}</div> : null}
      </div>
    </div>
  );
}

export function ActionError({ error }: { error?: ApiError }) {
  // always rendered so the live region exists before the message
  return (
    <div aria-live="polite" role="status">
      {error ? (error.isNotEntitled ? <EntitlementGate compact /> : <Banner tone="problem">{error.message}</Banner>) : null}
    </div>
  );
}

/** Explains why operator, tail and RFQ are locked. Shown for visitors, non-entitled members, and on 403 not_entitled. */
export function EntitlementGate({ compact, signedIn = true }: { compact?: boolean; signedIn?: boolean }) {
  return (
    <div className="gate" role="region" aria-label="Membership required">
      <div>
        <h3 style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Lock size={14} aria-hidden /> Operator, tail number and RFQ are for verified members
        </h3>
        {!compact ? (
          <p>
            Sending a request for quote and seeing the operator, tail number and operator contacts require approved identity verification (KYC) and an active membership.
            Browsing aircraft stays open to everyone.
          </p>
        ) : null}
      </div>
      <Link className="btn btn-primary" href={signedIn ? "/onboarding" : "/signup"}>
        {signedIn ? "Complete verification and membership" : "Create an account"}
      </Link>
    </div>
  );
}

/** Renders loading, error (incl. 403 not_entitled gate) and data states for a Query. */
export function Async<T>({ q, children, skeleton, empty }: { q: Query<T>; children: (d: T) => ReactNode; skeleton?: ReactNode; empty?: (d: T) => boolean | ReactNode }) {
  if (q.error) {
    if (q.error.isNotEntitled) return <div className="card-b"><EntitlementGate /></div>;
    return <ErrorState error={q.error} onRetry={q.reload} />;
  }
  if (q.loading || q.data === undefined) return <>{skeleton ?? <TableSkeleton />}</>;
  return <>{children(q.data)}</>;
}

export function PageHeader({ title, children, actions }: { title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="page-h">
      <div>
        <h1>{title}</h1>
        {children ? <p>{children}</p> : null}
      </div>
      {actions ? <div className="actions">{actions}</div> : null}
    </div>
  );
}

export function Card({ title, actions, children, id, flush, footer, num }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; id?: string; flush?: boolean; footer?: ReactNode; num?: string }) {
  return (
    <section className="card sec" id={id} aria-labelledby={id ? `${id}-h` : undefined}>
      {title ? (
        <div className="card-h">
          <h2 id={id ? `${id}-h` : undefined}>
            {num ? <span className="sec-num">{num}</span> : null}
            {title}
          </h2>
          {actions ? <div className="actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className={flush ? "card-b tight" : "card-b"}>{children}</div>
      {footer ? <div className="card-f">{footer}</div> : null}
    </section>
  );
}

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  num?: boolean;
  hideLabel?: boolean;
}

/** Dense table; below 720px each row becomes a stacked card with column labels. */
export function DataTable<T>({
  columns, rows, rowKey, caption, selectable, selected, onToggle, selectLabel,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (r: T) => string;
  caption: string;
  selectable?: boolean;
  selected?: Set<string>;
  onToggle?: (id: string) => void;
  selectLabel?: (r: T) => string;
}) {
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {selectable ? <th className="chk" scope="col"><span className="sr-only">Select</span></th> : null}
            {columns.map((c) => (
              <th key={c.key} scope="col" className={c.num ? "num" : ""}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const id = rowKey(r);
            const sel = selected?.has(id);
            return (
              <tr key={id} className={sel ? "sel" : ""}>
                {selectable ? (
                  <td className="chk" data-label="Select">
                    <input type="checkbox" checked={!!sel} onChange={() => onToggle?.(id)} aria-label={selectLabel ? selectLabel(r) : "Select row"} />
                  </td>
                ) : null}
                {columns.map((c) => (
                  <td key={c.key} data-label={c.label} className={`${c.num ? "num" : ""} ${c.hideLabel ? "nolabel" : ""}`}>
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Field({ label, id, help, error, flag, children, className }: { label: string; id: string; help?: string; error?: string; flag?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={`field ${flag ? "flag" : ""} ${className ?? ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {flag ? <span className="flag-note">Needs your input</span> : null}
      {help && !error ? <span className="help" id={`${id}-help`}>{help}</span> : null}
      {error ? <span className="field-err" id={`${id}-err`}>{error}</span> : null}
    </div>
  );
}

export function Rating({ value }: { value: string | null }) {
  return <span className="tag">{value ?? "Not rated"}</span>;
}

export function Money({ cents, currency }: { cents: number | null; currency: string }) {
  if (cents === null) return <span className="muted">Needs review</span>;
  return <span className="num">{new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100)}</span>;
}
