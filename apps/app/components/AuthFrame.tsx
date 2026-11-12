import Image from "next/image";
import Link from "next/link";
import { isMock } from "@/lib/api";

export function AuthFrame({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="auth">
      <main className="auth-box" id="main">
        <Link className="logo" href="/" aria-label="EXJET">
          <Image src="/brand/exjet-wordmark.svg" alt="EXJET" width={120} height={32} priority unoptimized />
        </Link>
        {isMock() ? <p style={{ marginBottom: 12 }}><span className="mock-badge" role="status">MOCK DATA</span></p> : null}
        <div className="card">
          <div className="card-b">
            <h1>{title}</h1>
            {sub ? <p className="muted" style={{ marginTop: 4 }}>{sub}</p> : null}
            <div style={{ marginTop: 20 }}>{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
