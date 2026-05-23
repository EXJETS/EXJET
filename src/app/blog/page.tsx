"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
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
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={stagger}
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
  const sortedPosts = [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const featured = sortedPosts[0] as Post | undefined;
  const remaining = sortedPosts.slice(1) as Post[];

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "52vh" }}>
        <img
          src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1800&q=85&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
        <div className="relative mx-auto max-w-7xl px-5 pt-40 pb-20 sm:px-8 lg:pt-52 lg:pb-28">
          <Section>
            <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                Technical Resources · Luminary Knowledge Base
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif text-white">
              Aviation Interior
              <br />
              <em className="display-serif-italic text-white/60">Engineering Insights</em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-[15px] leading-[1.8] text-white/70"
            >
              Technical articles from Luminary&rsquo;s engineering and certification teams
              — acoustic science, mission interior design, and regulatory compliance.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center gap-2"
            >
              {Array.from(new Set(blogPosts.map((p) => p.category))).map((cat) => (
                <span
                  key={cat}
                  className="inline-block border border-white/20 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/70"
                >
                  {cat}
                </span>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── FEATURED ARTICLE ── */}
      <section className="bg-white border-t border-black/[0.06]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <Section>
            <motion.div variants={fadeUp} className="mb-10">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">Featured Article</span>
            </motion.div>
            {featured && (
              <Link href={`/blog/${featured.id}`} className="group block border-t border-black/[0.07] py-10">
                <div className="flex items-start justify-between gap-8">
                  <div className="flex-1">
                    <div className="mb-4 flex items-center gap-6">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">{featured.category}</span>
                      <span className="font-mono text-[10px] text-[#aaaaaa]">{formatDate(featured.date)}</span>
                    </div>
                    <h2 className="font-serif leading-tight text-[#111111]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>{featured.title}</h2>
                    <p className="mt-4 max-w-2xl text-[14px] leading-[1.85] text-[#555555]">{featured.excerpt}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] group-hover:underline hidden sm:block">Read →</span>
                </div>
              </Link>
            )}
            <div className="border-t border-black/[0.07]" />
          </Section>
        </div>
      </section>

      {/* ── ALL ARTICLES ── */}
      {remaining.length > 0 && (
        <section className="bg-[#f4f3f0]">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
            <Section>
              <motion.div variants={fadeUp} className="mb-10">
                <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">All Articles</span>
                <h2 className="display-serif-md mt-3 text-[#111111]">Technical reading.</h2>
              </motion.div>
              <motion.div variants={stagger} className="divide-y divide-black/[0.07]">
                {remaining.map((post) => (
                  <motion.div key={post.id} variants={fadeUp}>
                    <Link href={`/blog/${post.id}`} className="group block py-8">
                      <div className="grid gap-4 sm:grid-cols-[140px_1fr] sm:gap-10">
                        <span className="font-mono text-[10px] text-[#aaaaaa]">{formatDate(post.date)}</span>
                        <div>
                          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">{post.category}</span>
                          <h3 className="font-serif leading-tight text-[#111111]" style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.4rem)" }}>{post.title}</h3>
                          <p className="mt-2 text-[13px] leading-[1.8] text-[#555555]">{post.excerpt}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                <div className="border-b border-black/[0.07]" />
              </motion.div>
            </Section>
          </div>
        </section>
      )}

      {/* ── DARK CTA ── */}
      <section className="relative overflow-hidden bg-[#0f0f0f] py-24">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.05),transparent_70%)]"
          aria-hidden
        />
        <Section className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]"
          >
            <span className="h-px w-8 bg-[var(--color-gold)]/50" />
            Luminary Air Group
            <span className="h-px w-8 bg-[var(--color-gold)]/50" />
          </motion.span>

          <motion.h2 variants={fadeUp} className="display-serif-md mt-8 text-white">
            Want to discuss a
            <br />
            <em className="display-serif-italic text-[var(--color-gold)]">technical requirement?</em>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.85] text-white/70"
          >
            Our engineering team is available to discuss your programme requirements,
            acoustic testing needs, or certification questions.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
            >
              Contact Engineering
            </Link>
            <Link
              href="/cabin-comfort-systems"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:border-white/50"
            >
              Cabin Comfort Systems
            </Link>
          </motion.div>
        </Section>
      </section>

    </>
  );
}
