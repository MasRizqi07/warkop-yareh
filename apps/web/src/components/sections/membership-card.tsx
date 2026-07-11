"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Crown, Coffee, Star, Zap } from "lucide-react";
import { fadeInUp, VIEWPORT } from "@/lib/animations";

export function MembershipCard() {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), {
    stiffness: 150,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <section className="py-[var(--section-md)] relative" id="membership">
      <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT.once}
          >
            <span className="label-caps text-[var(--text-brand)] mb-3 block">
              Loyalty Program
            </span>
            <h2 className="text-[var(--text-h2)] font-[var(--weight-bold)] tracking-[var(--tracking-heading)] text-[var(--text-primary)] mb-4">
              Kumpulkan Points,
              <br />
              <span className="text-gradient">Unlock Rewards</span>
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-md">
              Setiap pembelian menghasilkan points. Naik tier dari Bronze ke Platinum
              dan nikmati benefit eksklusif yang makin premium.
            </p>

            {/* Tier Progression */}
            <div className="space-y-3">
              {[
                { name: "Bronze", icon: Coffee, color: "#CD7F32", points: "0+" },
                { name: "Silver", icon: Star, color: "#C0C0C0", points: "500+" },
                { name: "Gold", icon: Crown, color: "#FFD700", points: "2,000+" },
                { name: "Platinum", icon: Zap, color: "#E5E4E2", points: "5,000+" },
              ].map((tier, i) => (
                <div
                  key={tier.name}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-default)]"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${tier.color}20` }}
                  >
                    <tier.icon size={16} style={{ color: tier.color }} />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {tier.name}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)]">{tier.points} pts</span>
                  {/* Progress dot */}
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: i <= 2 ? tier.color : "var(--border-default)",
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* 3D Membership Card */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT.once}
            className="flex justify-center"
          >
            <motion.div
              ref={ref}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                rotateX,
                rotateY,
                transformPerspective: 1000,
              }}
              className="relative w-full max-w-[400px] aspect-[16/10] cursor-pointer"
            >
              {/* Card */}
              <div
                className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #1C0A02 0%, #3D1A08 40%, #6B2E14 70%, #4A1F0A 100%)",
                }}
              >
                {/* Holographic shimmer */}
                <div
                  className="absolute inset-0 shimmer opacity-30"
                  style={{
                    background: "linear-gradient(105deg, transparent 30%, rgba(255,186,0,0.15) 45%, rgba(255,255,255,0.1) 50%, rgba(255,186,0,0.15) 55%, transparent 70%)",
                    backgroundSize: "300% 100%",
                  }}
                />

                {/* Noise */}
                <div className="absolute inset-0 bg-noise" />

                {/* Content */}
                <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-[#EAAE88] font-semibold tracking-widest uppercase mb-1">
                        Warkop Ya&apos;reh
                      </div>
                      <div className="text-lg font-bold text-white">Gold Member</div>
                    </div>
                    <Crown size={28} className="text-[var(--color-accent-500)]" />
                  </div>

                  <div>
                    <div className="text-xs text-[#868E96] mb-1">Member Since 2024</div>
                    <div className="text-2xl font-bold text-white tracking-wider">
                      •••• •••• •••• 4829
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-[#868E96] uppercase tracking-wider">
                        Points Balance
                      </div>
                      <div className="text-xl font-bold text-[var(--color-accent-500)]">
                        2,450
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#868E96] uppercase tracking-wider">
                        Next Tier
                      </div>
                      <div className="text-sm font-semibold text-white">Platinum</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
