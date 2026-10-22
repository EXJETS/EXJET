"use client";
import { useActionState } from "react";
import type { ActionState } from "@/app/app/actions";
import styles from "./Portal.module.css";
export function PortalForm({ action, children, label, pendingLabel = "Saving…", className = "" }: { action: (state: ActionState, form: FormData) => Promise<ActionState>; children?: React.ReactNode; label: string; pendingLabel?: string; className?: string }) {
  const [state, formAction, pending] = useActionState(action, {});
  return <form className={`${styles.form} ${className}`} action={formAction} aria-busy={pending}>
    <fieldset disabled={pending}>{children}<button className={styles.primary} type="submit">{pending ? pendingLabel : label}</button></fieldset>
    {state.error && <p className={styles.error} role="alert">{state.error}</p>}
    {state.success && <p className={styles.success} role="status">{state.success}</p>}
  </form>;
}
