"use client";

import { LegCard } from "@/components/leg-card";
import { SkeletonList } from "@/components/ui";
import { filterLegs } from "@/lib/legs";
import { useHydrated, useLiveLegs } from "@/store/app-store";

export function FeaturedLegs() {
  const ready = useHydrated();
  const legs = filterLegs(useLiveLegs(), { sort: "soonest" }).slice(0, 6);
  if (!ready) return <SkeletonList count={3} className="mt-6 sm:grid-cols-2 lg:grid-cols-3" />;
  return (
    <div className="no-scrollbar -mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
      {legs.map((v) => (
        <div key={v.leg.id} className="w-[85%] shrink-0 snap-start sm:w-auto">
          <LegCard view={v} />
        </div>
      ))}
    </div>
  );
}
