"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import blogPosts from "@/data/luminary-blog.json";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type Post = (typeof blogPosts)[number];

export default function BlogPage() {
  const categories = Array.from(new Set(blogPosts.map((p) => p.category)));

  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  const featuredRef = useRef(null);
  const featuredInView = useInView(featuredRef, { once: true, margin: "-80px" });

  const gridRef = useRef(null);
  const gridInView = useInView(gridRef, { once: true, margin: "-80px" });

  const newsletterRef = useRef(null);
  const newsletterInView = useInView(newsletterRef, { once: true, margin: "-80px" });

  return (
    <>
      {/* ── HEADER ── */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.06),transparent_60%)]" aria-hidden />
        <motion.div
          ref={headerRef}
          variants={stagger}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          className="relative mx-auto max-w-7xl px-5 pt-28 pb-20 sm:px-8 lg:pt-40 lg:pb-28"
        >
          <motion.div variants={fadeUp} className="mb-10 flex justify-center">
            <span className="chapter-rule">
              <span className="text-[#c9a84c]">The Journal</span>
              <span className="text-[#888888]">Engineering · Acoustics · Design</span>
            </span>
          </motion.div>

          <div className="mx-auto max-w-4xl text-center">
            <motion.h1 variants={fadeUp} className="display-serif text-[#111111]">
              Technical insight,
              <br />
              <em className="display-serif-italic text-[#c9a84c]">
                straight from the engineers.
              </em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.75] text-[#555555]"
            >
              Deep dives into acoustic science, insulation engineering, special mission
              interior design, and the craft behind every Luminary build — written by the
              engineers and practitioners who do the work.
            </motion.p>
          </div>

          {/* Category pills */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-block rounded-full border border-[#c9a84c]/30 bg-[rgba(201,168,76,0.07)] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#c9a84c]"
              >
                {cat}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURED FIRST POST ── */}
      <section className="relative bg-[#f8f8f6] py-16 border-t border-black/[0.06]">
        <motion.div
          ref={featuredRef}
          variants={stagger}
          initial="hidden"
          animate={featuredInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <motion.div variants={fadeUp} className="mb-8 flex items-end justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
                I · Featured
              </span>
              <h2 className="display-serif-sm mt-3 text-[#111111]">
                Latest{" "}
                <em className="display-serif-italic text-[#555555]">article.</em>
              </h2>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#888888]">
              {blogPosts.length} articles
            </span>
          </motion.div>

          {blogPosts.length > 0 && (
            <motion.div variants={fadeUp}>
              <FeaturedPostCard post={blogPosts[0]} />
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ── 3-COLUMN GRID ── */}
      {blogPosts.length > 1 && (
        <section className="relative bg-white py-16 border-t border-black/[0.06]">
          <motion.div
            ref={gridRef}
            variants={stagger}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            className="mx-auto max-w-7xl px-5 sm:px-8"
          >
            <motion.div variants={fadeUp} className="mb-10">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
                II · All Articles
              </span>
              <h2 className="display-serif-sm mt-3 text-[#111111]">
                More{" "}
                <em className="display-serif-italic text-[#555555]">reading.</em>
              </h2>
            </motion.div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogPosts.slice(1).map((post) => (
                <motion.div key={post.id} variants={fadeUp}>
                  <BlogCard post={post} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ── NEWSLETTER ── */}
      <section className="relative bg-[#f8f8f6] py-24 border-t border-black/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.04),transparent_70%)]" aria-hidden />
        <motion.div
          ref={newsletterRef}
          variants={stagger}
          initial="hidden"
          animate={newsletterInView ? "visible" : "hidden"}
          className="relative mx-auto max-w-2xl px-5 sm:px-8 text-center"
        >
          <motion.span
            variants={fadeUp}
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]"
          >
            III · Stay Informed
          </motion.span>
          <motion.h2 variants={fadeUp} className="display-serif-md mt-5 text-[#111111]">
            Stay current with aircraft
            <br />
            <em className="display-serif-italic text-[#555555]">interior engineering.</em>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-lg text-[15px] leading-[1.8] text-[#555555]"
          >
            New articles from the Luminary engineering team — covering acoustic science,
            interior practice, and what we&rsquo;re learning in the field. No noise, just signal.
          </motion.p>

          <motion.form
            variants={fadeUp}
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
              className="w-full max-w-sm rounded-full border border-black/[0.12] bg-white px-6 py-3.5 text-[14px] text-[#111111] outline-none transition-all focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/10 placeholder:text-[#aaaaaa] sm:w-auto"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[#b8963e]"
            >
              Subscribe
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          </motion.form>

          <motion.p
            variants={fadeUp}
            className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]"
          >
            No spam. Unsubscribe anytime.
          </motion.p>
        </motion.div>
      </section>
    </>
  );
}

/* ── Sub-components ── */

function FeaturedPostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[#c9a84c] hover:shadow-[0_16px_40px_-8px_rgba(201,168,76,0.10)] sm:flex-row sm:items-stretch sm:gap-8 lg:p-10"
    >
      {/* Accent bar */}
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-[#c9a84c] opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-block rounded-full border border-[#c9a84c]/30 bg-[rgba(201,168,76,0.07)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#c9a84c]">
            {post.category}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">
            {formatDate(post.date)}
          </span>
        </div>

        <h2 className="mt-5 font-serif text-[clamp(1.5rem,3vw,2.25rem)] leading-tight text-[#111111]">
          {post.title}
        </h2>
        <p className="mt-4 max-w-2xl flex-1 text-[14px] leading-[1.85] text-[#555555]">
          {post.excerpt}
        </p>

        <div className="mt-8 flex items-center justify-between border-t border-black/[0.06] pt-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#888888]">
            {post.readingTime} read
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#c9a84c] transition-transform group-hover:translate-x-0.5">
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
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-7 transition-all hover:border-[#c9a84c] hover:shadow-[0_12px_24px_-6px_rgba(201,168,76,0.10)]"
    >
      <div className="flex items-center justify-between">
        <span className="inline-block rounded-full border border-[#c9a84c]/30 bg-[rgba(201,168,76,0.07)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#c9a84c]">
          {post.category}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">
          {formatDate(post.date)}
        </span>
      </div>

      <h3 className="mt-5 font-serif text-[22px] leading-tight text-[#111111]">
        {post.title}
      </h3>
      <p className="mt-3 flex-1 text-[13px] leading-[1.8] text-[#555555]">
        {post.excerpt}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-black/[0.06] pt-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#888888]">
          {post.readingTime} read
        </span>
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#c9a84c] transition-transform group-hover:translate-x-0.5">
          Read
          <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}
