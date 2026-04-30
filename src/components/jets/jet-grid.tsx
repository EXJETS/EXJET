import { Plane } from "lucide-react";
import { Jet } from "@/types";
import { JetCard } from "./jet-card";

interface JetGridProps {
  jets: Jet[];
  dark?: boolean;
}

export function JetGrid({ jets, dark = false }: JetGridProps) {
  if (!jets || jets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          className={
            dark
              ? "flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-hairline)] bg-[var(--color-ivory-deep)] mb-4"
              : "flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-ivory-deep)] mb-4"
          }
        >
          <Plane
            className={dark ? "h-7 w-7 text-[var(--color-muted)]" : "h-7 w-7 text-[var(--color-subtle)]"}
            strokeWidth={1.5}
          />
        </div>
        <h3
          className={
            dark
              ? "text-[16px] font-semibold text-[var(--color-ink)] mb-1"
              : "text-[16px] font-semibold text-[var(--color-ink)] mb-1"
          }
        >
          No jets found
        </h3>
        <p
          className={
            dark
              ? "text-[13px] text-[var(--color-muted)] max-w-sm"
              : "text-[13px] text-[var(--color-muted)] max-w-sm"
          }
        >
          Try adjusting your search filters or check back later for new
          availability.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {jets.map((jet) => (
        <JetCard key={jet.id} jet={jet} dark={dark} />
      ))}
    </div>
  );
}
