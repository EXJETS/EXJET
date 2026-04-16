import { Users, Gauge, Navigation, Ruler, Maximize, Briefcase, Calendar, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Jet } from "@/types";

interface SpecItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined | null;
}

function SpecItem({ icon, label, value }: SpecItemProps) {
  if (value == null) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 hover:bg-neutral-100">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800">
        {icon}
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">{label}</p>
        <p className="mt-0.5 text-[13px] font-semibold text-neutral-950">{value}</p>
      </div>
    </div>
  );
}

interface JetSpecsProps {
  jet: Jet;
}

export function JetSpecs({ jet }: JetSpecsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <SpecItem
        icon={<Users className="h-5 w-5" strokeWidth={1.75} />}
        label="Passengers"
        value={`${jet.passengers} seats`}
      />
      <SpecItem
        icon={<Gauge className="h-5 w-5" strokeWidth={1.75} />}
        label="Max Speed"
        value={`${jet.speed} knots`}
      />
      <SpecItem
        icon={<Navigation className="h-5 w-5" strokeWidth={1.75} />}
        label="Range"
        value={`${jet.range} nm`}
      />
      <SpecItem
        icon={<Ruler className="h-5 w-5" strokeWidth={1.75} />}
        label="Cabin Length"
        value={`${jet.cabinLength} ft`}
      />
      <SpecItem
        icon={<Maximize className="h-5 w-5" strokeWidth={1.75} />}
        label="Cabin Height"
        value={`${jet.cabinHeight} ft`}
      />
      <SpecItem
        icon={<Briefcase className="h-5 w-5" strokeWidth={1.75} />}
        label="Baggage Volume"
        value={`${jet.baggageVolume} cu ft`}
      />
      <SpecItem
        icon={<Calendar className="h-5 w-5" strokeWidth={1.75} />}
        label="Year Built"
        value={jet.yearBuilt}
      />
      <SpecItem
        icon={<DollarSign className="h-5 w-5" strokeWidth={1.75} />}
        label="Price Per Hour"
        value={jet.hourlyRate ? formatCurrency(jet.hourlyRate) : undefined}
      />
    </div>
  );
}
