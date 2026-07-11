"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Coffee,
  Users,
  Heart,
  Target,
  Lightbulb,
  Globe,
  Award,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/shared/section-header";
import { STATS } from "@/lib/constants";
import { staggerContainer, staggerItem } from "@/lib/animations";

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users className="w-5 h-5 text-primary" />,
  Coffee: <Coffee className="w-5 h-5 text-primary" />,
  Calendar: <Calendar className="w-5 h-5 text-primary" />,
  Heart: <Heart className="w-5 h-5 text-primary" />,
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-background pb-16">
      {/* Noise Overlay */}
      <div className="fixed inset-0 organic-noise pointer-events-none z-0"></div>

      {/* Hero with flowing Radial Background Mesh */}
      <section className="relative py-24 overflow-hidden border-b border-white/5 bg-surface-container/10">
        <div className="absolute inset-0 bg-mesh z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <Badge variant="gold" className="uppercase tracking-widest px-3 py-1 text-[10px] shadow-sm shadow-amber-500/10">
              About Us
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--text-primary)] leading-tight tracking-tight">
              Membangun Masa Depan
              <br />
              <span className="text-gradient">Warkop Ya&apos;reh</span>
            </h1>
            <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              WARKOP YA&apos;REH bukan sekadar tempat minum kopi. Kami adalah
              ekosistem digital yang menghubungkan ide, kreativitas, dan
              komunitas di Surabaya.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Statistics Grid */}
      <section className="relative z-10 -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card p-5 rounded-2xl border border-white/5 bg-surface-container/20 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  {iconMap[stat.icon] || <Coffee className="w-5 h-5" />}
                </div>
                <span className="text-[10px] font-receipt-label text-primary font-bold uppercase tracking-wider">Metric</span>
              </div>
              <div>
                <h3 className="font-display-lg text-2xl font-extrabold text-[var(--text-primary)] leading-none mb-1">
                  {stat.value}
                </h3>
                <p className="text-[10px] font-receipt-label text-[var(--text-secondary)] uppercase tracking-tight">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Story with Cozy Workspace Seating Mockup */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-video lg:aspect-square w-full rounded-2xl overflow-hidden glass-card border border-white/5 group"
            >
              <Image
                alt="Warkop seating environment"
                fill
                sizes="(max-w-768px) 100vw, 50vw"
                className="object-cover opacity-70 group-hover:scale-102 transition-transform duration-1000"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhLJIk6lrVYtMEIRb3biYCadHukC3TaaK36VSik-cCNy7V8N1KdACPbMsr1swFmFXFwAGAgHdlD9Gcn3PCNflumIc0MDo4gHazdPgI_hP-YpUo0QesLZ993nPSHjWAFUucj0n4P_EmwydnD3gv6uT2VvcGLeKFXW3dfVMxd5lH5R5iJsIBEAHAoAiFVYH6o88MZPPPxhHRjCuzh856-CJ-Ej0UNtyDXlxPHvgYlUSWpiAqNn2bJl247f3-lLjd4IoT8PAwo_Z6gKQ"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent flex flex-col justify-end p-6">
                <span className="font-receipt-label text-[10px] text-primary uppercase font-bold tracking-widest">Cozy Environment</span>
                <h4 className="font-headline-md text-lg font-bold text-[var(--text-primary)] mt-1">Our Darmo Seating Area</h4>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Badge variant="outline" className="text-[10px] tracking-wider uppercase border-primary/30 text-primary">Our Story</Badge>
                <h2 className="text-3xl font-extrabold text-[var(--text-primary)] leading-tight">
                  Dari Warkop Kecil ke Digital Ecosystem
                </h2>
              </div>
              <div className="space-y-4 text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed font-body">
                <p>
                  Berawal dari sebuah warkop kecil di sudut Jalan Darmo,
                  Surabaya, Ya&apos;reh lahir dari mimpi sederhana: menciptakan
                  tempat di mana orang-orang bisa berkumpul, berkreasi, dan
                  bertumbuh bersama.
                </p>
                <p>
                  Hari ini, Ya&apos;reh telah berkembang menjadi lebih dari
                  sekadar kedai kopi. Kami adalah platform yang menghubungkan
                  developer, desainer, entrepreneur, mahasiswa, dan siapa pun
                  yang percaya bahwa ide-ide terbaik lahir dari percakapan yang
                  baik — dan secangkir kopi yang sempurna.
                </p>
                <p>
                  Dengan lebih dari 3,000 member komunitas aktif, 500+ event
                  yang telah terselenggara, dan misi untuk terus bertumbuh,
                  Ya&apos;reh siap menjadi pusat ekosistem digital untuk
                  komunitas lokal di Indonesia.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section using glass cards */}
      <section className="py-20 bg-surface-container-low/20 relative z-10 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Our Values"
            title="Yang Kami Perjuangkan"
            description="Prinsip-prinsip yang membentuk setiap keputusan dan langkah strategis kami."
          />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
          >
            {[
              {
                icon: <Heart className="w-5 h-5" />,
                title: "Community First",
                description:
                  "Setiap keputusan dimulai dari pertanyaan: apakah ini memberikan nilai nyata bagi komunitas kita?",
              },
              {
                icon: <Award className="w-5 h-5" />,
                title: "Quality Always",
                description:
                  "Dari biji kopi single origin hingga keindahan UX platform digital, kami tidak pernah kompromi soal kualitas.",
              },
              {
                icon: <Lightbulb className="w-5 h-5" />,
                title: "Innovation Driven",
                description:
                  "Kami terus bereksplorasi — mulai dari AI Concierge hingga sistem loyalty member yang gamified.",
              },
              {
                icon: <Globe className="w-5 h-5" />,
                title: "Local Global",
                description:
                  "Mengangkat identitas dan kehangatan lokal Indonesia dengan standardisasi teknologi global.",
              },
              {
                icon: <Target className="w-5 h-5" />,
                title: "Impact Focused",
                description:
                  "Fokus menciptakan dampak nyata bagi kemajuan UMKM lokal, creator, serta ekosistem developer.",
              },
              {
                icon: <Users className="w-5 h-5" />,
                title: "Inclusive Space",
                description:
                  "Semua orang dipersilakan bergabung. Developer, seniman, mahasiswa, pebisnis — semua punya tempat di sini.",
              },
            ].map((value) => (
              <motion.div
                key={value.title}
                variants={staggerItem}
                className="glass-card p-6 rounded-2xl border border-white/5 bg-surface-container/20 group hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 mb-4 group-hover:bg-primary group-hover:text-coffee-bean transition-all duration-300">
                  {value.icon}
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 group-hover:text-primary transition-colors">
                  {value.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
