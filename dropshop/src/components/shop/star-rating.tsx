import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  reviewCount,
  size = "sm",
  showCount = true,
  className,
}: StarRatingProps) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : size === "md" ? "h-4 w-4" : "h-5 w-5";
  const textSize = size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSize,
              star <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            )}
            strokeWidth={0}
          />
        ))}
      </div>
      {showCount && (
        <span className={cn("text-gray-500", textSize)}>
          {rating.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="text-gray-400"> ({reviewCount.toLocaleString()})</span>
          )}
        </span>
      )}
    </div>
  );
}
