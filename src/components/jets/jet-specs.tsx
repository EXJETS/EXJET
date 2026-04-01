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
    <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-sm text-gray-600">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

interface JetSpecsProps {
  jet: Jet;
}

export function JetSpecs({ jet }: JetSpecsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <SpecItem
        icon={<Users className="w-5 h-5" />}
        label="Passengers"
        value={`${jet.passengers} seats`}
      />
      <SpecItem
        icon={<Gauge className="w-5 h-5" />}
        label="Max Speed"
        value={`${jet.speed} knots`}
      />
      <SpecItem
        icon={<Navigation className="w-5 h-5" />}
        label="Range"
        value={`${jet.range} nm`}
      />
      <SpecItem
        icon={<Ruler className="w-5 h-5" />}
        label="Cabin Length"
        value={`${jet.cabinLength} ft`}
      />
      <SpecItem
        icon={<Maximize className="w-5 h-5" />}
        label="Cabin Height"
        value={`${jet.cabinHeight} ft`}
      />
      <SpecItem
        icon={<Briefcase className="w-5 h-5" />}
        label="Baggage Volume"
        value={`${jet.baggageVolume} cu ft`}
      />
      <SpecItem
        icon={<Calendar className="w-5 h-5" />}
        label="Year Built"
        value={jet.yearBuilt}
      />
      <SpecItem
        icon={<DollarSign className="w-5 h-5" />}
        label="Price Per Hour"
        value={jet.hourlyRate ? formatCurrency(jet.hourlyRate) : undefined}
      />
    </div>
  );
}
