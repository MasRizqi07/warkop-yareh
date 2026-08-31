"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { fadeInUp, VIEWPORT } from "@/lib/animations";
import { SITE } from "@/lib/constants";

export function CTASection() {
  return (
    <section className="py-[var(--section-md)] relative overflow-hidden" id="cta">
      <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT.once}
          className="relative rounded-[var(--radius-3xl)] p-10 md:p-16 overflow-hidden text-center bg-[var(--bg-surface-raised)] border border-[var(--border-default)]"
        >
          {/* Decorative */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-accent-500)] rounded-full -translate-y-1/2 translate-x-1/3 blur-[180px] opacity-15" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[var(--color-primary-400)] rounded-full translate-y-1/2 -translate-x-1/4 blur-[140px] opacity-20" />
            <div className="absolute inset-0 bg-noise" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="label-caps text-[var(--accent-fill)] mb-4 block">
              Join Our Community
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-[var(--weight-extrabold)] text-[var(--text-primary)] tracking-tight leading-tight mb-4">
              Siap Bergabung dengan
              <br />
              <span className="text-gradient">3,000+ Member</span>?
            </h2>
            <p className="text-[var(--text-secondary)] text-base md:text-lg mb-8 leading-relaxed">
              Dapatkan akses eksklusif ke event, promo spesial, loyalty rewards, dan komunitas kreatif terbesar di Surabaya.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/community">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(255, 255, 255, 0.15)" }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-full bg-[var(--accent-fill)] text-[var(--text-on-brand)] font-semibold text-sm shadow-xl flex items-center gap-2 group cursor-pointer"
                >
                  Gabung Sekarang
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <a
                href={`https://wa.me/${SITE.whatsapp}?text=Halo%20Warkop%20Ya'reh!`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm backdrop-blur-sm flex items-center gap-2 hover:bg-white/15 transition-colors"
                >
                  <MessageCircle size={16} />
                  Chat WhatsApp
                </motion.button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
