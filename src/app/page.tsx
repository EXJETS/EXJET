import Link from "next/link";
import {
  Search,
  Plane,
  CheckCircle,
  Star,
  Users,
  Clock,
  Globe,
  Headphones,
  ArrowRight,
  ChevronRight,
  Shield,
  Award,
  Zap,
  MapPin,
  Navigation,
  Gauge,
} from "lucide-react";
import SearchBar from "@/components/search/search-bar";
import { JetGrid } from "@/components/jets/jet-grid";
import jets from "@/data/jets.json";

const stats = [
  { value: "500+", label: "Flights Completed" },
  { value: "20+", label: "Premium Aircraft" },
  { value: "50+", label: "Destinations" },
  { value: "99.8%", label: "On-Time Rate" },
];

const steps = [
  {
    number: "01",
    title: "Search & Compare",
    description:
      "Enter your route, dates, and passengers. Instantly see available jets with transparent pricing.",
    icon: Search,
  },
  {
    number: "02",
    title: "Select Your Jet",
    description:
      "Browse detailed specs, photos, and reviews. Choose the aircraft that perfectly fits your needs.",
    icon: Plane,
  },
  {
    number: "03",
    title: "Confirm & Fly",
    description:
      "Book in seconds. Arrive 15 minutes before departure and step aboard your private flight.",
    icon: CheckCircle,
  },
];

const categories = [
  {
    name: "Light Jets",
    slug: "light",
    passengers: "4-6",
    range: "2,000 nm",
    priceFrom: "$3,000/hr",
    description: "Regional trips with speed and efficiency.",
  },
  {
    name: "Midsize Jets",
    slug: "midsize",
    passengers: "6-8",
    range: "3,500 nm",
    priceFrom: "$5,000/hr",
    description: "The perfect balance of comfort and range.",
  },
  {
    name: "Super Midsize",
    slug: "super-midsize",
    passengers: "8-10",
    range: "4,500 nm",
    priceFrom: "$6,500/hr",
    description: "Stand-up cabins. Coast-to-coast capability.",
  },
  {
    name: "Heavy Jets",
    slug: "heavy",
    passengers: "10-14",
    range: "6,500 nm",
    priceFrom: "$8,000/hr",
    description: "Full luxury. Intercontinental reach.",
  },
  {
    name: "Ultra Long Range",
    slug: "ultra-long-range",
    passengers: "12-19",
    range: "7,500+ nm",
    priceFrom: "$12,000/hr",
    description: "Nonstop to anywhere on earth.",
  },
];

const destinations = [
  { city: "New York", code: "TEB", country: "United States", tag: "Business Hub" },
  { city: "London", code: "LTN", country: "United Kingdom", tag: "Transatlantic" },
  { city: "Dubai", code: "DWC", country: "UAE", tag: "Luxury" },
  { city: "Aspen", code: "ASE", country: "United States", tag: "Leisure" },
  { city: "Miami", code: "OPF", country: "United States", tag: "Popular" },
  { city: "Paris", code: "LBG", country: "France", tag: "Culture" },
];

const trustBadges = [
  {
    icon: Shield,
    title: "Safety First",
    description: "Every aircraft is vetted with ARGUS & Wyvern safety audits. Zero compromises.",
  },
  {
    icon: Award,
    title: "Certified Operators",
    description: "We partner exclusively with FAA Part 135 certified operators.",
  },
  {
    icon: Headphones,
    title: "24/7 Concierge",
    description: "Dedicated flight advisors available around the clock. One call is all it takes.",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Real-time availability and instant confirmation. No waiting for callbacks.",
  },
];

const testimonials = [
  {
    name: "Alexandra Chen",
    role: "CEO, Vantage Capital",
    rating: 5,
    text: "EXJET transformed the way our executive team travels. Booking is effortless, the aircraft are immaculate, and their concierge service is second to none.",
    avatar: "AC",
  },
  {
    name: "Marcus Whitfield",
    role: "Professional Athlete",
    rating: 5,
    text: "Between games and training camps, I need reliability and discretion. EXJET delivers every single time. The app makes last-minute bookings a breeze.",
    avatar: "MW",
  },
  {
    name: "Isabella Moreau",
    role: "Creative Director, Lumière Studios",
    rating: 5,
    text: "We chartered a heavy jet for our team retreat to Aspen and it was flawless. From the champagne on boarding to the seamless ground transport — perfect.",
    avatar: "IM",
  },
];

export default function HomePage() {
  const featuredJets = (jets as any[]).filter((jet: any) => jet.featured);

  return (
    <main className="min-h-screen bg-white">
      {/* =========================================== */}
      {/* HERO — Full-screen, Tesla/Apple inspired    */}
      {/* =========================================== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy-950">
        {/* Background layers */}
        <div className="absolute inset-0">
          {/* Gradient base */}
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-grid-pattern" />
          {/* Radial glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[900px] h-[900px] bg-navy-700/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.03] rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center w-full">
          {/* Status badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-navy-200 mb-10 backdrop-blur-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Available now — 50+ destinations worldwide
          </div>

          {/* Headline — Large, bold, Apple-style */}
          <h1 className="animate-fade-in-up text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 leading-[0.95]">
            Private Aviation.
            <br />
            <span className="text-gradient-navy">Redefined.</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-in-up animate-delay-100 mx-auto max-w-2xl text-lg sm:text-xl text-navy-300 mb-14 leading-relaxed">
            Book your private jet in minutes. Access premium aircraft,
            transparent pricing, and a world-class flight experience —
            all at your fingertips.
          </p>

          {/* Search Bar */}
          <div className="animate-fade-in-up animate-delay-200 mx-auto max-w-4xl mb-20">
            <SearchBar variant="hero" />
          </div>

          {/* Stats bar */}
          <div className="animate-fade-in-up animate-delay-300 grid grid-cols-2 md:grid-cols-4 gap-8 mx-auto max-w-3xl">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="text-navy-400 text-sm mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in animate-delay-500">
          <span className="text-navy-500 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-navy-500 to-transparent" />
        </div>
      </section>

      {/* =========================================== */}
      {/* FEATURED FLEET — Apple product showcase     */}
      {/* =========================================== */}
      <section className="py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-navy-500 mb-3">
                Our Fleet
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-navy-900 tracking-tight">
                Popular Aircraft
              </h2>
              <p className="mt-4 text-navy-500 max-w-xl text-lg">
                Hand-picked jets trusted by executives, celebrities, and
                discerning travelers worldwide.
              </p>
            </div>
            <Link
              href="/search"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-navy-700 transition-colors group"
            >
              View All Aircraft
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <JetGrid jets={featuredJets} />

          <div className="mt-12 text-center sm:hidden">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-navy-800 transition-colors"
            >
              View All Aircraft
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* HOW IT WORKS — Clean, minimal steps         */}
      {/* =========================================== */}
      <section className="py-28 bg-navy-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-navy-500 mb-3">
              How It Works
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-navy-900 tracking-tight">
              Three steps to takeoff.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center group">
                {/* Connector line */}
                {parseInt(step.number) < 3 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-navy-200" />
                )}

                {/* Icon container */}
                <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-lg shadow-navy-900/5 border border-navy-100 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-white text-xs font-bold shadow-md">
                    {step.number}
                  </div>
                  <step.icon className="h-10 w-10 text-navy-700" />
                </div>

                <h3 className="text-xl font-bold text-navy-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-navy-500 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* AIRCRAFT CATEGORIES — Card grid             */}
      {/* =========================================== */}
      <section className="py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-navy-500 mb-3">
              Aircraft Classes
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-navy-900 tracking-tight">
              Find your perfect jet.
            </h2>
            <p className="mt-4 text-navy-500 max-w-xl mx-auto text-lg">
              From quick regional hops to transcontinental voyages.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/search?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-navy-950 p-7 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-navy-950/20"
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-navy-900 to-navy-950 opacity-100" />
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
                  <p className="text-sm text-white/60 mb-5">{cat.description}</p>

                  <div className="flex items-center gap-4 text-sm text-white/50 mb-5">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {cat.passengers}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5" />
                      {cat.range}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-sm font-semibold text-white/80">
                      From {cat.priceFrom}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all">
                      Explore <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* TRUST & SAFETY — Apple-style feature grid   */}
      {/* =========================================== */}
      <section className="py-28 bg-navy-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-navy-400 mb-3">
              Why EXJET
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Trust at every altitude.
            </h2>
            <p className="mt-4 text-navy-400 max-w-xl mx-auto text-lg">
              Safety, reliability, and service excellence are not features — they&apos;re our foundation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge) => (
              <div
                key={badge.title}
                className="group rounded-2xl bg-white/[0.04] border border-white/[0.06] p-7 hover:bg-white/[0.07] transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.08] mb-5 group-hover:bg-white/[0.12] transition-colors">
                  <badge.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{badge.title}</h3>
                <p className="text-sm text-navy-400 leading-relaxed">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* POPULAR DESTINATIONS — Turo/Airbnb style    */}
      {/* =========================================== */}
      <section className="py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-navy-500 mb-3">
              Popular Routes
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-navy-900 tracking-tight">
              Where will you fly?
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinations.map((dest) => (
              <Link
                key={dest.code}
                href={`/search?to=${dest.code}`}
                className="group flex flex-col items-center rounded-2xl bg-navy-50/80 p-6 text-center hover:bg-navy-100/80 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-white mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-navy-900 text-base">{dest.city}</h3>
                <p className="text-xs text-navy-500 mt-0.5">{dest.country}</p>
                <span className="mt-3 inline-flex px-2.5 py-1 rounded-full bg-navy-200/50 text-[10px] font-semibold uppercase tracking-wider text-navy-600">
                  {dest.tag}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* TESTIMONIALS — Clean cards                  */}
      {/* =========================================== */}
      <section className="py-28 bg-navy-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-navy-500 mb-3">
              Testimonials
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-navy-900 tracking-tight">
              Trusted by industry leaders.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl bg-white p-8 shadow-sm border border-navy-100 hover:shadow-lg hover:shadow-navy-900/5 transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-navy-900 text-navy-900"
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-navy-700 leading-relaxed mb-6 text-[15px]">
                  &ldquo;{testimonial.text}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3 pt-5 border-t border-navy-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-white font-bold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900 text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-navy-500 text-xs">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================== */}
      {/* CTA — Tesla-style full-screen               */}
      {/* =========================================== */}
      <section className="relative py-32 bg-navy-950 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900 to-navy-950" />
          <div className="absolute inset-0 bg-grid-pattern" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-navy-700/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Your next flight
            <br />
            <span className="text-gradient-navy">starts here.</span>
          </h2>
          <p className="text-lg text-navy-400 mb-12 max-w-xl mx-auto leading-relaxed">
            Join thousands of travelers who have elevated their journey.
            Search available aircraft and book in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 text-base font-semibold text-navy-900 hover:bg-white/90 transition-all shadow-lg shadow-white/10 active:scale-[0.97]"
            >
              <Search className="w-5 h-5" />
              Search Flights
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-10 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Browse Aircraft
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <p className="mt-10 text-sm text-navy-500">
            No commitment required. Free quotes in under 60 seconds.
          </p>
        </div>
      </section>
    </main>
  );
}
