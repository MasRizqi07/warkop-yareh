"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Star, Users, Coffee } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { heroStagger, wordReveal, fadeInUp, heroCTA } from "@/lib/animations";

function AnimatedHeadline({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <motion.h1
      className="text-[var(--text-display-xl)] leading-[var(--leading-display)] tracking-[var(--tracking-display)] text-white"
      style={{ fontWeight: 800, fontFamily: "var(--font-heading)" }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            variants={wordReveal}
            className="inline-block"
          >
            {word}
          </motion.span>
          {i < words.length - 1 && <span className="inline-block w-[0.3em]" />}
        </span>
      ))}
    </motion.h1>
  );
}

export function HeroSection() {
  return (
    <section
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
      id="hero"
    >
      <AuroraBackground />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Column */}
          <motion.div
            variants={heroStagger}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-[var(--color-primary-300)] backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-[var(--color-java-green)] animate-pulse" />
                ☕ Wonokromo, Surabaya
              </span>
            </motion.div>

            {/* Headline */}
            <AnimatedHeadline text="Lebih dari Sekadar Warkop" />

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg md:text-xl text-[var(--color-neutral-500)] max-w-xl leading-relaxed"
            >
              Kopi premium, coworking space, community hub, dan event platform
              — semua dalam satu ekosistem digital untuk komunitas kreatif Surabaya.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={heroCTA} className="mt-10 flex flex-wrap gap-4">
              <Link href="/menu">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(196, 98, 45, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  className="min-h-[48px] min-w-[160px] px-8 py-4 rounded-full text-[var(--text-on-brand)] bg-[var(--accent-fill)] font-semibold text-sm transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-fill)] shadow-lg cursor-pointer"
                >
                  Pesan Sekarang
                </motion.button>
              </Link>
              <Link href="/menu">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  className="min-h-[48px] min-w-[160px] px-8 py-4 rounded-full text-[var(--text-primary)] font-semibold text-sm transition-all duration-200 border border-[var(--border-default)] bg-[var(--bg-surface-raised)] hover:bg-[var(--bg-surface-overlay)] cursor-pointer"
                >
                  Jelajahi Menu
                </motion.button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              variants={fadeInUp}
              className="mt-12 flex flex-wrap items-center gap-6 md:gap-8"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-[var(--color-accent-500)] fill-[var(--color-accent-500)]"
                    />
                  ))}
                </div>
                <span className="text-sm text-[var(--color-neutral-500)] font-medium">4.9 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[var(--color-primary-400)]" />
                <span className="text-sm text-[var(--color-neutral-500)] font-medium">3,000+ Member</span>
              </div>
              <div className="flex items-center gap-2">
                <Coffee size={16} className="text-[var(--color-primary-400)]" />
                <span className="text-sm text-[var(--color-neutral-500)] font-medium">15+ Komunitas</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/hero/hero-coffee.png"
                alt="Suasana Warkop Ya'reh — kopi premium dan coworking space di Surabaya"
                fill
                sizes="(max-width: 1024px) 0vw, 50vw"
                className="object-cover"
                priority
              />
              {/* Warm overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
            {/* Floating accent decoration — glow blobs */}
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, 3, -2, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 w-24 h-24 rounded-2xl border border-white/10"
              style={{
                background: "linear-gradient(135deg, rgba(196,98,45,0.30), rgba(255,186,0,0.20))",
                filter: "blur(60px)",
                opacity: 0.7,
              }}
              aria-hidden="true"
            />
            <motion.div
              animate={{ y: [0, 8, 0], rotate: [0, -2, 3, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-4 w-20 h-20 rounded-2xl border border-white/10"
              style={{
                background: "linear-gradient(135deg, rgba(255,186,0,0.25), rgba(196,98,45,0.15))",
                filter: "blur(50px)",
                opacity: 0.6,
              }}
              aria-hidden="true"
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-[var(--color-neutral-600)] tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={20} className="text-[var(--color-neutral-600)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
