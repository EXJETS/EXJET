import Link from "next/link";
import { Logo } from "@/components/shell/logo";

export function Footer() {
  return (
    <footer className="hidden border-t border-line md:block">
      <div className="mx-auto flex max-w-6xl items-start justify-between gap-8 px-6 py-12 text-[13px] text-muted">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 leading-relaxed">
            On-demand private jet charter and empty legs, flown by vetted operators.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-16 gap-y-2">
          <Link href="/charter/" className="hover:text-ink">Charter a jet</Link>
          <Link href="/trips/" className="hover:text-ink">My trips</Link>
          <Link href="/empty-legs/" className="hover:text-ink">Empty legs</Link>
          <Link href="/account/" className="hover:text-ink">Account</Link>
          <Link href="/alerts/" className="hover:text-ink">Route alerts</Link>
          <Link href="/operator/" className="hover:text-ink">For operators</Link>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-6 pb-10 text-[12px] text-subtle">
        © {new Date().getFullYear()} EXJET. EXJET arranges flights as agent for the guest; all flights are operated by
        FAA Part 135 or equivalent certificated air carriers.
      </p>
    </footer>
  );
}
