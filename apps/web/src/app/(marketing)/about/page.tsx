'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users, Heart, Target, Lightbulb, Globe, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/shared/section-header';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-canvas-obsidian pb-16 font-body text-on-surface">
      {/* Noise Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid opacity-20" />

      {/* Hero with flowing Radial Background Mesh */}
      <section className="relative overflow-hidden border-b border-border-subtle bg-surface-secondary py-24">
        <div className="absolute inset-0 bg-mesh z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <Badge
              variant="gold"
              className="px-3 py-1 text-[10px] uppercase tracking-widest shadow-sm"
            >
              About Us
            </Badge>
            <h1 className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-4xl md:text-5xl lg:text-6xl">
              Membangun Masa Depan
              <br />
              <span className="bg-gradient-to-r from-primary via-cream-beige to-accent-amber bg-clip-text text-transparent">
                Warkop Ya&apos;reh
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-xs leading-relaxed text-on-surface-variant sm:text-sm md:text-base">
              WARKOP YA&apos;REH bukan sekadar tempat minum kopi. Kami adalah
              ekosistem digital yang menghubungkan ide, kreativitas, dan
              komunitas di Surabaya.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story with Cozy Workspace Seating Mockup */}
      <section className="py-16 sm:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface-card lg:aspect-square"
            >
              <Image
                alt="Warkop seating environment"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-80 transition-transform group-hover:scale-[1.02]"
                src="/images/darmo-interior.png"
                priority
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-canvas-obsidian via-canvas-obsidian/20 to-transparent p-6">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                  Cozy Environment
                </span>
                <h4 className="mt-1 font-heading text-lg font-bold text-text-primary">
                  Our Darmo Seating Area
                </h4>
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
                <Badge
                  variant="outline"
                  className="text-[10px] tracking-wider uppercase border-primary/30 text-primary"
                >
                  Our Story
                </Badge>
                <h2 className="font-heading text-3xl font-extrabold leading-tight text-text-primary">
                  Dari Warkop Kecil ke Digital Ecosystem
                </h2>
              </div>
              <div className="space-y-4 font-body text-xs leading-relaxed text-on-surface-variant md:text-sm">
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
                  Dengan misi untuk terus bertumbuh, Ya&apos;reh membangun
                  layanan yang mempertemukan pengalaman kedai dan kebutuhan
                  komunitas lokal melalui platform digital.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section using glass cards */}
      <section className="relative z-10 border-y border-border-subtle bg-surface-secondary py-20">
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
                title: 'Community First',
                description:
                  'Setiap keputusan dimulai dari pertanyaan: apakah ini memberikan nilai nyata bagi komunitas kita?',
              },
              {
                icon: <Award className="w-5 h-5" />,
                title: 'Quality Always',
                description:
                  'Dari biji kopi single origin hingga keindahan UX platform digital, kami tidak pernah kompromi soal kualitas.',
              },
              {
                icon: <Lightbulb className="w-5 h-5" />,
                title: 'Innovation Driven',
                description:
                  'Kami terus bereksplorasi — mulai dari AI Concierge hingga sistem loyalty member yang gamified.',
              },
              {
                icon: <Globe className="w-5 h-5" />,
                title: 'Local Global',
                description:
                  'Mengangkat identitas dan kehangatan lokal Indonesia dengan standardisasi teknologi global.',
              },
              {
                icon: <Target className="w-5 h-5" />,
                title: 'Impact Focused',
                description:
                  'Fokus menciptakan dampak nyata bagi kemajuan UMKM lokal, creator, serta ekosistem developer.',
              },
              {
                icon: <Users className="w-5 h-5" />,
                title: 'Inclusive Space',
                description:
                  'Semua orang dipersilakan bergabung. Developer, seniman, mahasiswa, pebisnis — semua punya tempat di sini.',
              },
            ].map((value) => (
              <motion.div
                key={value.title}
                variants={staggerItem}
                className="delight-card group rounded-2xl border border-border-subtle bg-surface-card p-6 hover:border-primary/20"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                  {value.icon}
                </div>
                <h3 className="mb-2 font-heading text-base font-bold text-text-primary transition-colors group-hover:text-primary">
                  {value.title}
                </h3>
                <p className="text-xs leading-relaxed text-on-surface-variant">
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
