import Link from "next/link";
import {
  Star, Check, Shield, Clock, Users, ArrowLeft, Plane, Award, Navigation, Gauge,
} from "lucide-react";
import jetsData from "@/data/jets.json";
import { JetGallery } from "@/components/jets/jet-gallery";
import { JetSpecs } from "@/components/jets/jet-specs";
import { LiveTracker } from "@/components/jets/live-tracker";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";
import type { Jet } from "@/types";

const reviews = [
  {
    id: 1, name: "Alexander M.", date: "February 2026", rating: 5, avatar: "AM",
    comment: "Absolutely impeccable experience from takeoff to landing. The cabin was pristine, the crew attentive, and the amenities exceeded every expectation.",
  },
  {
    id: 2, name: "Sophia L.", date: "January 2026", rating: 5, avatar: "SL",
    comment: "We chartered this jet for a business trip and it made all the difference. Quiet cabin, fast Wi-Fi, and the catering was restaurant quality.",
  },
  {
    id: 3, name: "James R.", date: "December 2025", rating: 4, avatar: "JR",
    comment: "Wonderful aircraft with a spacious interior. The range is perfect for transatlantic flights. Everything was smooth and professional.",
  },
  {
    id: 4, name: "Victoria K.", date: "November 2025", rating: 5, avatar: "VK",
    comment: "This was our third time booking through EXJET and they never disappoint. The jet was gorgeous, the pilots professional, and every detail was taken care of.",
  },
];

export default async function JetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jet = (jetsData as Jet[]).find((j) => j.id === id);

  if (!jet) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-white">
        <Plane className="mb-6 h-14 w-14 text-white/20" strokeWidth={1.25} />
        <h1 className="text-[28px] font-semibold tracking-tight text-white">Jet Not Found</h1>
        <p className="mt-2 max-w-md text-center text-[14px] text-white/60">
          The aircraft you are looking for does not exist or is no longer available.
        </p>
        <Link
          href="/search"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[13px] font-medium text-black transition-colors hover:bg-white/90"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Browse All Jets
        </Link>
      </div>
    );
  }

  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Back Nav */}
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to all jets
        </Link>
      </div>

      {/* Gallery */}
      <JetGallery jet={jet} />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          {/* LEFT COLUMN */}
          <div className="lg:w-2/3">
            {/* Header */}
            <div className="mb-8 border-b border-white/[0.08] pb-6">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/80">
                  {getCategoryLabel(jet.category)}
                </span>
                <div className="flex items-center gap-1.5 text-[12px] text-white/60">
                  <Star className="h-3.5 w-3.5 fill-white text-white" />
                  <span className="font-medium text-white">{averageRating}</span>
                  <span className="text-white/40">({reviews.length} reviews)</span>
                </div>
              </div>
              <h1 className="text-[32px] font-semibold tracking-tight text-white sm:text-[40px]">{jet.name}</h1>
              <p className="mt-1 text-[14px] text-white/50">{jet.manufacturer} · {jet.yearBuilt}</p>
            </div>

            {/* Key Highlights */}
            <div className="mb-8 grid grid-cols-2 gap-3 border-b border-white/[0.08] pb-8 sm:grid-cols-4">
              <Highlight icon={<Users className="h-4 w-4 text-white/70" strokeWidth={1.75} />} value={`${jet.passengers} pax`} label="Max capacity" />
              <Highlight icon={<Navigation className="h-4 w-4 text-white/70" strokeWidth={1.75} />} value={`${jet.range} nm`} label="Range" />
              <Highlight icon={<Gauge className="h-4 w-4 text-white/70" strokeWidth={1.75} />} value={`${jet.speed} kts`} label="Max speed" />
              <Highlight icon={<Clock className="h-4 w-4 text-white/70" strokeWidth={1.75} />} value={`${jet.yearBuilt}`} label="Year built" />
            </div>

            {/* Description */}
            <div className="mb-8 border-b border-white/[0.08] pb-8">
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">About this aircraft</p>
              <p className="mt-4 text-[15px] leading-relaxed text-white/70">{jet.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-8 border-b border-white/[0.08] pb-8">
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Amenities</p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {jet.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-300" strokeWidth={2.25} />
                    <span className="text-[13px] text-white/75">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications */}
            <div className="mb-8 border-b border-white/[0.08] pb-8">
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Specifications</p>
              <div className="mt-5">
                <JetSpecs jet={jet} />
              </div>
            </div>

            {/* Live Tracking */}
            <div className="mb-8 border-b border-white/[0.08] pb-8">
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Live Aircraft Location</p>
              <div className="mt-5">
                <LiveTracker jet={jet} />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Booking Card */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl">
              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-[28px] font-semibold tracking-tight text-white">
                    {formatCurrency(jet.hourlyRate)}
                  </span>
                  <span className="text-[13px] text-white/50">/ hr</span>
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/40">Per flight hour</p>
              </div>

              {/* Rating */}
              <div className="mb-5 flex items-center gap-2 border-b border-white/[0.08] pb-5">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.round(Number(averageRating))
                          ? "fill-white text-white"
                          : "text-white/20"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[12px] font-medium text-white">{averageRating}</span>
                <span className="text-[12px] text-white/40">({reviews.length} reviews)</span>
              </div>

              {/* Live Status */}
              <div className="mb-5">
                <LiveTracker jet={jet} compact />
              </div>

              {/* Book Button */}
              <Link
                href={`/booking?jet=${jet.id}`}
                className="block w-full rounded-full bg-white px-6 py-3 text-center text-[13px] font-medium text-black transition-colors hover:bg-white/90"
              >
                Book This Jet
              </Link>

              <p className="mt-3 text-center text-[11px] text-white/40">
                No charge until your trip is confirmed
              </p>

              {/* Estimated Pricing */}
              <div className="mt-6 space-y-2.5 border-t border-white/[0.08] pt-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">Estimated trip cost</p>
                <div className="flex justify-between text-[13px]">
                  <span className="text-white/60">2hr flight</span>
                  <span className="font-medium text-white">{formatCurrency(jet.hourlyRate * 2)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-white/60">4hr flight</span>
                  <span className="font-medium text-white">{formatCurrency(jet.hourlyRate * 4)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-white/60">8hr flight</span>
                  <span className="font-medium text-white">{formatCurrency(jet.hourlyRate * 8)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 space-y-2.5 border-t border-white/[0.08] pt-6">
                <div className="flex items-center gap-2 text-[12px] text-white/65">
                  <Shield className="h-3.5 w-3.5 text-emerald-300" strokeWidth={1.75} />
                  <span>Verified &amp; safety inspected</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-white/65">
                  <Award className="h-3.5 w-3.5 text-emerald-300" strokeWidth={1.75} />
                  <span>Premium concierge service</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-white/65">
                  <Clock className="h-3.5 w-3.5 text-emerald-300" strokeWidth={1.75} />
                  <span>Free cancellation up to 48h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 border-t border-white/[0.08] pt-12">
          <div className="mb-8 flex items-center gap-3">
            <Star className="h-5 w-5 fill-white text-white" />
            <h2 className="text-[24px] font-semibold tracking-tight text-white">
              {averageRating} · {reviews.length} reviews
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] text-[12px] font-semibold text-white">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">{review.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">{review.date}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < review.rating ? "fill-white text-white" : "text-white/20"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-white/70">{review.comment}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

function Highlight({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[13px] font-semibold text-white">{value}</p>
      </div>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/40">{label}</p>
    </div>
  );
}
