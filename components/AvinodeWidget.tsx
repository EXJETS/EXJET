"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AvinodeWidget.module.css";

type WidgetStatus = "loading" | "loaded" | "slow" | "error";
const widgetPath = "/api/avinode/widget/";

export function AvinodeWidget({ compact = false }: { compact?: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<WidgetStatus>("loading");
  const [height, setHeight] = useState(460);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStatus((current) => current === "loading" ? "slow" : current);
    }, 22000);
    return () => window.clearTimeout(timer);
  }, [attempt]);

  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || event.data?.type !== "exjet-avinode-widget") return;
      if (typeof event.data.height === "number" && Number.isFinite(event.data.height)) {
        setHeight(Math.max(260, Math.min(4000, event.data.height)));
      }
      if (["loaded", "slow", "error"].includes(event.data.status)) {
        setStatus(event.data.status);
      }
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  function retry() {
    setStatus("loading");
    setHeight(460);
    setAttempt((current) => current + 1);
  }

  return (
    <section className={`${styles.widget}${compact ? ` ${styles.compact}` : ""}`} aria-label="EXJET aircraft search">
      {status === "loading" && <p className={styles.status} role="status">Loading aircraft search…</p>}
      {(status === "slow" || status === "error") && (
        <div className={styles.status} role="status">
          <p>{status === "error" ? "Aircraft search couldn’t load." : "Aircraft search is taking longer to load."}</p>
          <div className={styles.actions}>
            <button type="button" onClick={retry}>Reload search</button>
          </div>
        </div>
      )}
      <iframe
        key={attempt}
        ref={frame}
        src={widgetPath}
        title="EXJET aircraft search and quote requests"
        className={styles.frame}
        style={{ height }}
        onError={() => setStatus("error")}
      />
      <noscript><p className={styles.status}>Enable JavaScript to search aircraft, or contact EXJET to plan your flight.</p></noscript>
    </section>
  );
}
