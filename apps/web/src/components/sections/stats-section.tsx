"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Coffee, Users, Star, MapPin } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

const STATS_DATA = [
  { label: "Cups Served", value: 3000, suffix: "+", icon: Coffee, color: "var(--color-primary-400)" },
  { label: "Komunitas Aktif", value: 15, suffix: "+", icon: Users, color: "var(--color-accent-500)" },
  { label: "Rating", value: 4.9, suffix: "★", icon: Star, color: "var(--color-accent-400)", isDecimal: true },
  { label: "Cabang", value: 3, suffix: " lokasi", icon: MapPin, color: "var(--color-java-green)" },
];

function AnimatedCounter({
  value,
  suffix,
  isDecimal,
}: {
  value: number;
  suffix: string;
  isDecimal?: boolean;
}) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;

    const controls = animate(0, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.2,
      onUpdate: (latest) => {
        if (isDecimal) {
          setDisplay(latest.toFixed(1));
        } else {
          setDisplay(Math.round(latest).toLocaleString("en-US"));
        }
      },
    });

    return () => controls.stop();
  }, [inView, value, isDecimal]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="py-[var(--section-md)] relative overflow-hidden" id="stats">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-mesh pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT.once}
          className="text-center mb-12"
        >
          <span className="label-caps text-[var(--text-brand)] mb-2 block">
            Our Impact
          </span>
          <h2 className="text-[var(--text-h2)] font-[var(--weight-bold)] tracking-[var(--tracking-heading)] text-[var(--text-primary)]">
            Dipercaya Komunitas Surabaya
          </h2>
        </motion.div>

        {/* Stats Grid — Bento Style */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT.once}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {STATS_DATA.map((stat) => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              className="relative group p-6 md:p-8 rounded-[var(--radius-2xl)] bg-[var(--surface-raised)] border border-[var(--border-default)] hover:border-[var(--color-primary-500)]/20 transition-all duration-300 overflow-hidden"
            >
              {/* Glow effect on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${stat.color}10, transparent 70%)`,
                }}
              />

              <div className="relative z-10">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)`,
                  }}
                >
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>

                <div className="text-3xl md:text-4xl font-[var(--weight-extrabold)] text-[var(--text-primary)] tracking-tight leading-none mb-2">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    isDecimal={(stat as { isDecimal?: boolean }).isDecimal}
                  />
                </div>

                <p className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
