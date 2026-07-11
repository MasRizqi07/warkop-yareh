"use client";

import { motion } from "framer-motion";
import { Star, BadgeCheck } from "lucide-react";
import { reviews } from "@/data/mock";
import { fadeInUp, VIEWPORT } from "@/lib/animations";

function TestimonialCard({
  name,
  rating,
  comment,
}: {
  name: string;
  rating: number;
  comment: string;
}) {
  return (
    <div className="w-[340px] md:w-[380px] shrink-0 p-6 rounded-[var(--radius-2xl)] bg-[var(--surface-raised)] border border-[var(--border-default)] mx-3">
      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={
              i < rating
                ? "text-[var(--color-accent-500)] fill-[var(--color-accent-500)]"
                : "text-[var(--border-default)]"
            }
          />
        ))}
      </div>

      {/* Quote */}
      <p
        className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-4"
        style={{ fontFamily: "var(--font-accent)", fontStyle: "italic" }}
      >
        &ldquo;{comment}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] flex items-center justify-center text-white text-xs font-bold">
          {name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {name}
            </span>
            <BadgeCheck size={14} className="text-[var(--color-info-500)] shrink-0" />
          </div>
          <span className="text-xs text-[var(--text-tertiary)]">Verified Member</span>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  // Double the items for infinite scroll
  const row1Items = [...reviews, ...reviews];
  const row2Items = [...reviews.slice().reverse(), ...reviews.slice().reverse()];

  return (
    <section className="py-[var(--section-md)] overflow-hidden relative" id="testimonials">
      <div className="gradient-section-warm absolute inset-0 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10">
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT.once}
          className="text-center mb-12 px-4"
        >
          <span
            className="text-5xl text-gradient-gold inline-block mb-2"
            style={{ fontFamily: "var(--font-accent)" }}
            aria-hidden="true"
          >
            &ldquo; &rdquo;
          </span>
          <h2 className="text-[var(--text-h2)] font-[var(--weight-bold)] tracking-[var(--tracking-heading)] text-[var(--text-primary)]">
            Kata Mereka
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md mx-auto">
            Apa yang komunitas katakan tentang pengalaman mereka di Warkop Ya&apos;reh.
          </p>
        </motion.div>

        {/* Marquee Row 1 — scrolls left */}
        <div className="marquee-container relative mb-4">
          {/* Edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-[var(--surface-base)] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-[var(--surface-base)] to-transparent pointer-events-none" />

          <div className="flex animate-marquee">
            {row1Items.map((review, i) => (
              <TestimonialCard
                key={`r1-${i}`}
                name={review.userName}
                rating={review.rating}
                comment={review.comment}
              />
            ))}
          </div>
        </div>

        {/* Marquee Row 2 — scrolls right */}
        <div className="marquee-container relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-[var(--surface-base)] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-[var(--surface-base)] to-transparent pointer-events-none" />

          <div className="flex animate-marquee-reverse">
            {row2Items.map((review, i) => (
              <TestimonialCard
                key={`r2-${i}`}
                name={review.userName}
                rating={review.rating}
                comment={review.comment}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
