"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, BookOpen, Mail } from "lucide-react";
import blogPosts from "@/data/luminary-blog.json";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type Post = (typeof blogPosts)[number];

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogPage() {
  const [email, setEmail] = useState("");

  const featured = blogPosts[0] as Post | undefined;
  const remaining = blogPosts.slice(1) as Post[];

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.06),transparent_60%)]"
          aria-hidden
        />
        <Section className="relative mx-auto max-w-7xl px-5 pt-28 pb-20 sm:px-8 lg:pt-40 lg:pb-28">
          <motion.div variants={fadeUp} className="mb-10 flex justify-center">
            <span className="chapter-rule">
              <span className="text-[var(--color-gold)]">Technical Resources</span>
              <span className="text-[#888888]">Luminary Knowledge Base</span>
            </span>
          </motion.div>

          <div className="mx-auto max-w-4xl text-center">
            <motion.h1 variants={fadeUp} className="display-serif text-[#111111]">
              Aviation Interior
              <br />
              <em className="display-serif-italic text-[var(--color-gold)]">
                Engineering Insights
              </em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.8] text-[#555555]"
            >
              Technical articles from Luminary&rsquo;s engineering and certification teams
              — acoustic science, mission interior design, and regulatory compliance.
            </motion.p>
          </div>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            {Array.from(new Set(blogPosts.map((p) => p.category))).map((cat) => (
              <span
                key={cat}
                className="inline-block rounded-full border border-[var(--color-gold)]/30 bg-[rgba(201,168,76,0.07)] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]"
              >
                {cat}
              </span>
            ))}
          </motion.div>
        </Section>
      </section>

      {/* ── FEATURED ARTICLE ── */}
      {featured && (
        <section className="relative border-t border-black/[0.06] bg-white py-16">
          <Section className="mx-auto max-w-7xl px-5 sm:px-8">
            <motion.div variants={fadeUp} className="mb-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                I · Featured Article
              </span>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link
                href={`/blog/${featured.id}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_16px_40px_-8px_rgba(201,168,76,0.10)] lg:flex-row lg:gap-10 lg:p-10"
              >
                {/* Gold left border accent */}
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-[var(--color-gold)]" />

                <div className="flex flex-1 flex-col pl-2">
                  <div className="flex items-center gap-4">
                    <span className="inline-block rounded-full border border-[var(--color-gold)]/30 bg-[rgba(201,168,76,0.07)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                      {featured.category}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">
                      <Calendar className="h-3 w-3" strokeWidth={1.5} />
                      {formatDate(featured.date)}
                    </span>
                  </div>

                  <h2 className="mt-5 font-serif text-[clamp(1.5rem,3vw,2.5rem)] leading-tight text-[#111111]">
                    {featured.title}
                  </h2>
                  <p className="mt-4 max-w-2xl flex-1 text-[14px] leading-[1.85] text-[#555555]">
                    {featured.excerpt}
                  </p>

                  <div className="mt-8 flex items-center justify-between border-t border-black/[0.06] pt-5">
                    {(featured as Post & { author?: string }).author && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">
                        {(featured as Post & { author?: string }).author}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] transition-transform group-hover:translate-x-0.5">
                      Read Article
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </Section>
        </section>
      )}

      {/* ── ARTICLE GRID ── */}
      {remaining.length > 0 && (
        <section className="relative border-t border-black/[0.06] bg-[#f8f8f6] py-16">
          <Section className="mx-auto max-w-7xl px-5 sm:px-8">
            <motion.div variants={fadeUp} className="mb-10">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                II · All Articles
              </span>
              <h2 className="display-serif-sm mt-3 text-[#111111]">
                Technical{" "}
                <em className="display-serif-italic text-[#555555]">reading.</em>
              </h2>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {remaining.map((post) => (
                <motion.div key={post.id} variants={fadeUp}>
                  <ArticleCard post={post} />
                </motion.div>
              ))}
            </div>
          </Section>
        </section>
      )}

      {/* ── NEWSLETTER ── */}
      <section className="relative overflow-hidden border-t border-black/[0.06] bg-[#f8f8f6] py-24">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.04),transparent_70%)]"
          aria-hidden
        />
        <Section className="relative mx-auto max-w-2xl px-5 text-center sm:px-8">
          <motion.div
            variants={fadeUp}
            className="mx-auto mb-4 flex justify-center"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-white">
              <BookOpen className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
            </span>
          </motion.div>
          <motion.span
            variants={fadeUp}
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]"
          >
            III · Stay Current
          </motion.span>
          <motion.h2 variants={fadeUp} className="display-serif-md mt-5 text-[#111111]">
            Stay Current on Regulatory &amp;
            <br />
            <em className="display-serif-italic text-[#555555]">Technical Updates</em>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-lg text-[15px] leading-[1.8] text-[#555555]"
          >
            Receive notifications when Luminary publishes new performance data, STC
            approvals, or technical guidance. No marketing — engineering signal only.
          </motion.p>

          <motion.form
            variants={fadeUp}
            onSubmit={(e) => e.preventDefault()}
            className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center"
          >
            <div className="relative flex-1 sm:max-w-xs">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" strokeWidth={1.5} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineering@operator.aero"
                required
                aria-label="Email address"
                className="w-full rounded-xl border border-black/[0.1] bg-white py-3 pl-10 pr-4 text-[14px] text-[#111111] placeholder:text-[#aaaaaa] focus:border-[var(--color-gold)] focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-gold)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
            >
              Subscribe
            </button>
          </motion.form>

          <motion.p
            variants={fadeUp}
            className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]"
          >
            No spam. Unsubscribe anytime.
          </motion.p>
        </Section>
      </section>
    </>
  );
}

/* ── Article Card Sub-component ── */

function ArticleCard({ post }: { post: Post }) {
  type PostWithAuthor = Post & { author?: string };
  const p = post as PostWithAuthor;
  return (
    <Link
      href={`/blog/${post.id}`}
      className="group flex h-full flex-col rounded-2xl border border-black/[0.08] bg-white p-7 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_12px_24px_-6px_rgba(201,168,76,0.10)]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-block rounded-full border border-[var(--color-gold)]/30 bg-[rgba(201,168,76,0.07)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
          {post.category}
        </span>
        <span className="flex shrink-0 items-center gap-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#888888]">
          <Calendar className="h-2.5 w-2.5" strokeWidth={1.5} />
          {formatDate(post.date)}
        </span>
      </div>

      <h3 className="mt-5 line-clamp-2 font-serif text-[20px] leading-tight text-[#111111]">
        {post.title}
      </h3>
      <p className="mt-3 line-clamp-2 flex-1 text-[13px] leading-[1.8] text-[#555555]">
        {post.excerpt}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-black/[0.06] pt-4">
        {p.author ? (
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#888888]">
            {p.author}
          </span>
        ) : (
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#888888]">
            Luminary Engineering
          </span>
        )}
        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)] transition-transform group-hover:translate-x-0.5">
          Read
          <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  );
}
