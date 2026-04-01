import Link from "next/link";
import { Star, Check, Shield, Clock, Users, MapPin, ArrowLeft, Plane, Award, Navigation, Gauge } from "lucide-react";
import jetsData from "@/data/jets.json";
import { JetGallery } from "@/components/jets/jet-gallery";
import { JetSpecs } from "@/components/jets/jet-specs";
import { LiveTracker } from "@/components/jets/live-tracker";
import { formatCurrency, getCategoryLabel, getCategoryColor } from "@/lib/utils";
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
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <Plane className="h-16 w-16 text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Jet Not Found</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          The aircraft you are looking for does not exist or is no longer available.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Browse All Jets
        </Link>
      </div>
    );
  }

  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="min-h-screen bg-white">
      {/* Back Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all jets
        </Link>
      </div>

      {/* Gallery with Interior/Exterior Tabs */}
      <JetGallery jet={jet} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* LEFT COLUMN */}
          <div className="lg:w-2/3">
            {/* Header */}
            <div className="border-b pb-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(jet.category)}`}>
                  {getCategoryLabel(jet.category)}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{averageRating}</span>
                  <span className="text-gray-400">({reviews.length} reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{jet.name}</h1>
              <p className="text-lg text-gray-500">{jet.manufacturer} · {jet.yearBuilt}</p>
            </div>

            {/* Key Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b pb-6 mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{jet.passengers} pax</p>
                  <p className="text-xs text-gray-500">Max capacity</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Navigation className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{jet.range} nm</p>
                  <p className="text-xs text-gray-500">Range</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Gauge className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{jet.speed} kts</p>
                  <p className="text-xs text-gray-500">Max speed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{jet.yearBuilt}</p>
                  <p className="text-xs text-gray-500">Year built</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-b pb-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this aircraft</h2>
              <p className="text-gray-600 leading-relaxed">{jet.description}</p>
            </div>

            {/* Amenities */}
            <div className="border-b pb-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {jet.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications */}
            <div className="border-b pb-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h2>
              <JetSpecs jet={jet} />
            </div>

            {/* Live Tracking */}
            <div className="border-b pb-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Aircraft Location</h2>
              <LiveTracker jet={jet} />
            </div>
          </div>

          {/* RIGHT COLUMN - Booking Card */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 rounded-2xl border border-gray-200 shadow-xl p-6">
              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(jet.hourlyRate)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">per flight hour</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6 pb-6 border-b">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(Number(averageRating))
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-900">{averageRating}</span>
                <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
              </div>

              {/* Live Status */}
              <div className="mb-6">
                <LiveTracker jet={jet} compact />
              </div>

              {/* Book Button */}
              <Link
                href={`/booking?jet=${jet.id}`}
                className="block w-full text-center py-3.5 px-6 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25"
              >
                Book This Jet
              </Link>

              <p className="text-xs text-center text-gray-400 mt-3 mb-6">
                No charge until your trip is confirmed
              </p>

              {/* Estimated Pricing */}
              <div className="border-t pt-6 space-y-3">
                <p className="text-sm font-medium text-gray-700 mb-3">Estimated trip cost</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">2hr flight</span>
                  <span className="font-medium">{formatCurrency(jet.hourlyRate * 2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">4hr flight</span>
                  <span className="font-medium">{formatCurrency(jet.hourlyRate * 4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">8hr flight</span>
                  <span className="font-medium">{formatCurrency(jet.hourlyRate * 8)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="border-t mt-6 pt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span>Verified & safety inspected</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Award className="h-4 w-4 text-emerald-500" />
                  <span>Premium concierge service</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  <span>Free cancellation up to 48h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 border-t pt-12">
          <div className="flex items-center gap-3 mb-8">
            <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
            <h2 className="text-2xl font-semibold text-gray-900">
              {averageRating} · {reviews.length} reviews
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
