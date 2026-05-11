import { Star, Shield, Globe, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Chauffeur } from "@/types";

interface ChauffeurCardProps {
  chauffeur: Chauffeur;
  className?: string;
}

export function ChauffeurCard({ chauffeur, className }: ChauffeurCardProps) {
  const initials = chauffeur.name.split(" ").map((n) => n[0]).join("");

  return (
    <div
      className={cn(
        "group flex flex-col rounded-2xl border border-[var(--color-hairline)] bg-white p-6 transition-all hover:border-champagne hover:shadow-[0_16px_40px_-16px_rgba(184,155,110,0.25)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-ivory-deep)] font-serif text-[20px] text-[var(--color-ink)]">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-[18px] leading-tight text-[var(--color-ink)]">
                {chauffeur.name}
              </h3>
              {chauffeur.verified && (
                <Shield className="h-3.5 w-3.5 text-champagne" strokeWidth={1.75} />
              )}
            </div>
            <p className="font-mono text-[11px] text-[var(--color-muted)]">{chauffeur.city}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-champagne/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-champagne">
          {chauffeur.badge}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-[var(--color-hairline)] pt-4">
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-champagne text-champagne" />
          <span className="font-mono text-[13px] text-[var(--color-ink)]">{chauffeur.rating}</span>
        </div>
        <span className="h-3 w-px bg-[var(--color-hairline-strong)]" />
        <span className="text-[12px] text-[var(--color-muted)]">
          {chauffeur.trips.toLocaleString()} trips
        </span>
        <span className="h-3 w-px bg-[var(--color-hairline-strong)]" />
        <span className="text-[12px] text-[var(--color-muted)]">
          {chauffeur.yearsExperience} yrs
        </span>
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-[var(--color-muted)]">{chauffeur.bio}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {chauffeur.specialties.map((s) => (
          <span
            key={s}
            className="rounded-full border border-[var(--color-hairline)] px-2.5 py-0.5 text-[11px] text-[var(--color-muted)]"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-hairline)] pt-4">
        <Globe className="h-3.5 w-3.5 shrink-0 text-champagne" strokeWidth={1.75} />
        <span className="text-[12px] text-[var(--color-muted)]">
          {chauffeur.languages.join(" · ")}
        </span>
      </div>
    </div>
  );
}
