import Link from "next/link";
import { Search, Plane, CheckCircle, Star, Users, Clock, Globe, Headphones, ArrowRight, ChevronRight } from "lucide-react";
import SearchBar from "@/components/search/search-bar";
import { JetGrid } from "@/components/jets/jet-grid";
import jets from "@/data/jets.json";

const trustIndicators = [
  { icon: Plane, label: "500+ Flights", description: "Completed safely" },
  { icon: Globe, label: "20+ Aircraft", description: "Premium fleet" },
  { icon: Clock, label: "50+ Destinations", description: "Worldwide" },
  { icon: Headphones, label: "24/7 Support", description: "Always available" },
];

const steps = [
  {
    number: 1,
    title: "Search",
    description: "Enter your route, dates, and passenger count to find available aircraft.",
    icon: Search,
  },
  {
    number: 2,
    title: "Choose",
    description: "Browse and compare jets by price, range, and amenities to find your perfect match.",
    icon: Plane,
  },
  {
    number: 3,
    title: "Fly",
    description: "Confirm your booking, sit back, and enjoy a seamless private flight experience.",
    icon: CheckCircle,
  },
];

const categories = [
  {
    name: "Light",
    slug: "light",
    passengers: "4-6",
    priceRange: "$3,000 - $6,000/hr",
    description: "Perfect for short trips with small groups. Efficient and cost-effective.",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    name: "Midsize",
    slug: "midsize",
    passengers: "6-8",
    priceRange: "$5,000 - $8,000/hr",
    description: "The ideal balance of comfort, range, and value for medium-distance travel.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    name: "Super Midsize",
    slug: "super-midsize",
    passengers: "8-10",
    priceRange: "$6,500 - $10,000/hr",
    description: "Stand-up cabins with coast-to-coast range and spacious interiors.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    name: "Heavy",
    slug: "heavy",
    passengers: "10-14",
    priceRange: "$8,000 - $14,000/hr",
    description: "Maximum luxury with full galley, bedroom suites, and intercontinental range.",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    name: "Ultra Long Range",
    slug: "ultra-long-range",
    passengers: "12-19",
    priceRange: "$12,000 - $20,000/hr",
    description: "The pinnacle of private aviation. Fly nonstop to any destination on earth.",
    gradient: "from-rose-500 to-red-600",
  },
];

const testimonials = [
  {
    name: "Alexandra Chen",
    role: "CEO, Vantage Capital",
    rating: 5,
    text: "EXJET transformed the way our executive team travels. Booking is effortless, the aircraft are immaculate, and their concierge service is second to none. We've never looked back.",
  },
  {
    name: "Marcus Whitfield",
    role: "Professional Athlete",
    rating: 5,
    text: "Between games and training camps, I need reliability and discretion. EXJET delivers every single time. The app makes last-minute bookings a breeze, even at 2 AM.",
  },
  {
    name: "Isabella Moreau",
    role: "Creative Director, Lumière Studios",
    rating: 5,
    text: "We chartered a heavy jet for our team retreat to Aspen and it was flawless. From the champagne on boarding to the seamless ground transport, every detail was perfect.",
  },
];

export default function HomePage() {
  const featuredJets = (jets as any[]).filter((jet: any) => jet.featured);

  return (
    <main className="min-h-screen">
      {/* =============================== */}
      {/* HERO SECTION                     */}
      {/* =============================== */}
      <section className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-black overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-gray-300 mb-8 backdrop-blur-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Now serving 50+ destinations worldwide
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
            Fly Private.{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Fly Your Way.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-in-up mx-auto max-w-2xl text-lg sm:text-xl text-gray-400 mb-12 leading-relaxed">
            Book your private jet in minutes. Access 20+ premium aircraft for any destination worldwide.
          </p>

          {/* Search Bar */}
          <div className="animate-fade-in-up mx-auto max-w-4xl mb-16">
            <SearchBar variant="hero" />
          </div>

          {/* Trust Indicators */}
          <div className="animate-fade-in-up grid grid-cols-2 md:grid-cols-4 gap-6 mx-auto max-w-3xl">
            {trustIndicators.map((indicator) => (
              <div key={indicator.label} className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10">
                  <indicator.icon className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-white font-semibold text-lg">{indicator.label}</span>
                <span className="text-gray-500 text-sm">{indicator.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-gray-950" />
      </section>

      {/* =============================== */}
      {/* FEATURED JETS SECTION            */}
      {/* =============================== */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                Our Fleet
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Popular Aircraft
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-xl">
                Hand-picked jets trusted by executives, celebrities, and discerning travelers around the globe.
              </p>
            </div>
            <Link
              href="/jets"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
            >
              View All Aircraft
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <JetGrid jets={featuredJets} />

          <div className="mt-10 text-center sm:hidden">
            <Link
              href="/jets"
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              View All Aircraft
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =============================== */}
      {/* HOW IT WORKS SECTION             */}
      {/* =============================== */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
              Simple Process
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              From search to takeoff in three simple steps. Private jet travel has never been this easy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center group">
                {/* Connector line (between cards) */}
                {step.number < 3 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-gray-300 dark:border-gray-700" />
                )}

                {/* Number circle */}
                <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white text-sm font-bold shadow-md">
                    {step.number}
                  </div>
                  <step.icon className="h-10 w-10 text-gray-700 dark:text-gray-300" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================== */}
      {/* CATEGORIES SECTION               */}
      {/* =============================== */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
              Aircraft Classes
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Browse by Category
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              From quick regional hops to transcontinental voyages, find the perfect class for your journey.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/search?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
                <div className="absolute inset-0 bg-black/10" />

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-white/80 mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {category.passengers} passengers
                    </span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white/90">
                      {category.priceRange}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-white group-hover:translate-x-1 transition-transform">
                      Explore <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =============================== */}
      {/* TESTIMONIALS SECTION             */}
      {/* =============================== */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
              Testimonials
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Trusted by Industry Leaders
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  &ldquo;{testimonial.text}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold text-sm">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================== */}
      {/* CTA SECTION                      */}
      {/* =============================== */}
      <section className="relative py-24 bg-gradient-to-b from-gray-900 via-gray-800 to-black overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Ready to{" "}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Fly?
            </span>
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Your next private jet experience is just a few clicks away. Search available aircraft and book your flight today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-4 text-base font-semibold text-gray-900 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Search className="w-5 h-5" />
              Search Flights
            </Link>
            <Link
              href="/jets"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Browse Aircraft
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            No commitment required. Free quotes in under 60 seconds.
          </p>
        </div>
      </section>
    </main>
  );
}
