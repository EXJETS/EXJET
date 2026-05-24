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
              ? "flex h-16 w-16 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 mb-4"
              : "flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 mb-4"
          }
        >
          <Plane
            className={dark ? "h-7 w-7 text-neutral-500" : "h-7 w-7 text-neutral-400"}
            strokeWidth={1.5}
          />
        </div>
        <h3
          className={
            dark
              ? "text-[16px] font-semibold text-neutral-950 mb-1"
              : "text-[16px] font-semibold text-neutral-900 mb-1"
          }
        >
          No jets found
        </h3>
        <p
          className={
            dark
              ? "text-[13px] text-neutral-500 max-w-sm"
              : "text-[13px] text-neutral-500 max-w-sm"
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
        <JetCard key={jet.id} jet={jet} />
      ))}
    </div>
  );
}
