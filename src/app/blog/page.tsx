import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import blogPosts from "@/data/luminary-blog.json";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The Journal",
  description:
    "Technical insight from the engineers at Luminary Air Group — acoustic science, insulation engineering, special mission interior design, and aircraft interior practice.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "The Journal · Luminary Air Group",
    description:
      "Technical insight, straight from the engineers. Deep dives into acoustic science and aircraft interior design.",
    url: "https://luminary.aero/blog",
  },
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function BlogPage() {
  const categories = Array.from(new Set(blogPosts.map((p) => p.category)));

  return (
    <>
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mesh-hero absolute inset-0" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(181,180,0,0.07),transparent_70%)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-5 pt-28 pb-20 sm:px-8 lg:pt-40 lg:pb-28">
          {/* Eyebrow */}
          <div className="mb-10 flex justify-center">
            <span className="chapter-rule">
              <span className="text-[var(--color-gold)]">The Journal</span>
              <span className="text-white/50">
                Engineering · Acoustics · Design
              </span>
            </span>
          </div>

          {/* Headline */}
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="display-serif text-white">
              Technical insight,
              <br />
              <em className="display-serif-italic text-[var(--color-gold)]">
                straight from the engineers.
              </em>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.75] text-white/50">
              Deep dives into acoustic science, insulation engineering,
              special mission interior design, and the craft behind every
              Luminary build — written by the engineers and practitioners
              who do the work.
            </p>
          </div>

          {/* Category pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-block rounded-full border border-white/[0.12] bg-black px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── POSTS GRID ──────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/[0.07] bg-[#0d0d0d] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                I · Articles
              </span>
              <h2 className="display-serif-md mt-4 text-white">
                All{" "}
                <em className="display-serif-italic text-white/50">
                  articles.
                </em>
              </h2>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
              {blogPosts.length} articles
            </span>
          </div>

          {/* Featured post — first item gets large treatment */}
          {blogPosts.length > 0 && (
            <FeaturedPostCard post={blogPosts[0]} />
          )}

          {/* Remaining posts — 3-column grid */}
          {blogPosts.length > 1 && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogPosts.slice(1).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER CTA ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/[0.07]">
        <div className="mesh-ink absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
              II · Stay Informed
            </span>
            <h2 className="display-serif-md mt-5 text-white">
              Engineering insight,
              <br />
              <em className="display-serif-italic text-[var(--color-gold)]">
                in your inbox.
              </em>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-[15px] leading-[1.8] text-white/70">
              New articles from the Luminary engineering team — covering
              acoustic science, interior practice, and what we&rsquo;re
              learning in the field. No noise, just signal.
            </p>

            <form
              action="/api/newsletter"
              method="POST"
              className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                aria-label="Email address"
                className="w-full max-w-sm rounded-full border border-white/20 bg-black/10 px-6 py-3.5 text-[14px] text-white placeholder-white/40 outline-none focus:border-[var(--color-gold)] focus:ring-0 sm:w-auto"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-black"
              >
                Subscribe
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
              </button>
            </form>

            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

type Post = (typeof blogPosts)[number];

function FeaturedPostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-black p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_24px_50px_-20px_rgba(181,180,0,0.2)] sm:flex-row sm:items-stretch sm:gap-8 lg:p-10"
    >
      {/* Accent bar */}
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-[var(--color-gold)] opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-block rounded-full border border-[var(--color-gold)]/30 bg-[var(--color-gold-bg)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
            {post.category}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
            {formatDate(post.date)}
          </span>
        </div>

        <h2 className="mt-5 font-serif text-[clamp(1.5rem,3vw,2.25rem)] leading-tight text-white">
          {post.title}
        </h2>
        <p className="mt-4 max-w-2xl flex-1 text-[14px] leading-[1.85] text-white/50">
          {post.excerpt}
        </p>

        <div className="mt-8 flex items-center justify-between border-t border-white/[0.07] pt-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
            {post.readingTime} read
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white transition-transform group-hover:translate-x-0.5">
            Read article
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function BlogCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-black p-7 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_24px_50px_-20px_rgba(181,180,0,0.15)]"
    >
      <div className="flex items-center justify-between">
        <span className="inline-block rounded-full border border-[var(--color-gold)]/30 bg-[var(--color-gold-bg)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
          {post.category}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
          {formatDate(post.date)}
        </span>
      </div>

      <h3 className="mt-5 font-serif text-[22px] leading-tight text-white">
        {post.title}
      </h3>
      <p className="mt-3 flex-1 text-[13px] leading-[1.8] text-white/50">
        {post.excerpt}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
          {post.readingTime} read
        </span>
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-white transition-transform group-hover:translate-x-0.5">
          Read
          <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}
