import Link from "next/link";
import { ArrowRight, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { Container, LinkButton } from "@/components/ui";
import { AIRCRAFT_TYPES, CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/data/aircraft";
import { money } from "@/lib/format";
import { HomeSearch } from "./home-search";
import { FeaturedLegs } from "./featured-legs";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-14 pt-[calc(env(safe-area-inset-top)+6rem)] text-white sm:pb-20 sm:pt-36">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 80% 0%, rgba(168,137,92,0.45), transparent 70%), radial-gradient(50% 60% at 0% 100%, rgba(255,255,255,0.08), transparent 70%)",
          }}
        />
        <Container className="relative">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold-soft">Private aviation, on demand</p>
          <h1 className="mt-4 max-w-3xl text-[44px] font-semibold leading-[0.98] tracking-[-0.04em] sm:text-[72px]">
            Your jet. Your schedule.
          </h1>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/70 sm:text-[18px]">
            Instant quotes on every class of aircraft, and empty legs at up to 75% off — booked in a few taps.
          </p>
          <div className="mt-10 rounded-3xl bg-surface p-4 text-ink shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] sm:p-6">
            <HomeSearch />
          </div>
        </Container>
      </section>

      <Container className="py-14 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Empty legs</p>
            <h2 className="mt-2 text-[28px] font-semibold tracking-tight sm:text-[36px]">Departing soon</h2>
          </div>
          <Link href="/empty-legs/" className="inline-flex items-center gap-1 text-[14px] font-medium">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <FeaturedLegs />
      </Container>

      <section className="border-y border-line bg-surface">
        <Container className="grid gap-8 py-14 sm:grid-cols-3 sm:py-16">
          {[
            { icon: Sparkles, title: "Priced in seconds", body: "Transparent, all-in quotes for every aircraft that can fly your trip — no waiting on a broker." },
            { icon: ShieldCheck, title: "Vetted operators", body: "Every flight is operated by a certificated carrier with audited ARGUS, Wyvern or IS-BAO safety ratings." },
            { icon: Clock, title: "Wheels up in hours", body: "Book as little as four hours out. Your concierge handles catering, cars and every detail." },
          ].map((f) => (
            <div key={f.title}>
              <f.icon className="h-6 w-6 text-gold" strokeWidth={1.6} />
              <h3 className="mt-4 text-[18px] font-semibold">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </Container>
      </section>

      <Container className="py-14 sm:py-20">
        <p className="eyebrow">The fleet</p>
        <h2 className="mt-2 text-[28px] font-semibold tracking-tight sm:text-[36px]">From quick hops to non-stop intercontinental</h2>
        <div className="no-scrollbar -mx-4 mt-8 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:px-0">
          {CATEGORY_ORDER.map((c) => {
            const types = AIRCRAFT_TYPES.filter((t) => t.category === c);
            const seats = Math.max(...types.map((t) => t.seats));
            const range = Math.max(...types.map((t) => t.rangeNm));
            const rate = Math.min(...types.map((t) => t.hourlyRate));
            return (
              <div key={c} className="w-[70%] shrink-0 snap-start rounded-2xl border border-line bg-surface p-5 sm:w-auto">
                <p className="text-[16px] font-semibold">{CATEGORY_LABELS[c]}</p>
                <p className="mt-1 text-[13px] text-muted">{types.map((t) => t.name).join(", ")}</p>
                <dl className="mt-4 space-y-1 text-[13px]">
                  <div className="flex justify-between"><dt className="text-muted">Seats</dt><dd>up to {seats}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Range</dt><dd>{range.toLocaleString()} nm</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">From</dt><dd>{money(rate)}/hr</dd></div>
                </dl>
              </div>
            );
          })}
        </div>
      </Container>

      <Container className="pb-16">
        <div className="flex flex-col items-start gap-5 rounded-3xl bg-ink p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold-soft">For operators</p>
            <p className="mt-2 text-[24px] font-semibold tracking-tight">Fill your repositioning flights.</p>
            <p className="mt-1 max-w-lg text-[15px] text-white/60">
              Post empty legs and accept charter requests that match your fleet, all from one console.
            </p>
          </div>
          <LinkButton href="/operator/" variant="secondary">Open operator console</LinkButton>
        </div>
      </Container>
    </>
  );
}
