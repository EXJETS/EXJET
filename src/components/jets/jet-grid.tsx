import { Plane } from "lucide-react";
import { Jet } from "@/types";
import { JetCard } from "./jet-card";

interface JetGridProps {
  jets: Jet[];
}

export function JetGrid({ jets }: JetGridProps) {
  if (!jets || jets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Plane className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No jets found
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Try adjusting your search filters or check back later for new
          availability.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {jets.map((jet) => (
        <JetCard key={jet.id} jet={jet} />
      ))}
    </div>
  );
}
