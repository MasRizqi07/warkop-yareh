'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/shared/section-header';
import { SITE, BRANCH_LOCATIONS } from '@/lib/constants';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="relative min-h-screen bg-canvas-obsidian pb-16 font-body text-on-surface">
      {/* Noise Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid opacity-20" />

      {/* Hero Header with Background Mesh */}
      <section className="relative overflow-hidden border-b border-border-subtle bg-surface-secondary pb-12 pt-24">
        <div className="absolute inset-0 bg-mesh z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Contact Us"
            title="Hubungi Kami"
            description="Punya pertanyaan, feedback, atau ide kerja sama menarik? Kami sangat senang mendengar cerita dari kamu."
          />
        </div>
      </section>

      {/* Form and info sections */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Form card wrapper */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            <div className="rounded-3xl border border-border-subtle bg-surface-card p-6 sm:p-8 space-y-6">
              <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-text-primary">
                <Sparkles className="w-5 h-5 text-primary" />
                Send a Message
              </h3>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12 space-y-4"
                  >
                    <CheckCircle className="w-16 h-16 text-success-500 mx-auto animate-bounce" />
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-text-primary">
                        Pesan Terkirim!
                      </h4>
                      <p className="mx-auto max-w-xs text-xs leading-relaxed text-on-surface-variant">
                        Terima kasih atas pesan kamu! Team Warkop Ya&apos;reh
                        akan merespons dalam waktu 1x24 jam.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="contact-name"
                          className="px-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant"
                        >
                          Name
                        </label>
                        <Input
                          id="contact-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nama lengkap kamu"
                          required
                          className="rounded-xl border border-border-subtle bg-surface-container-high/40 px-4 py-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="contact-email"
                          className="px-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant"
                        >
                          Email
                        </label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@example.com"
                          required
                          className="rounded-xl border border-border-subtle bg-surface-container-high/40 px-4 py-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-subject"
                        className="px-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant"
                      >
                        Subject
                      </label>
                      <Input
                        id="contact-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Apa yang bisa kami bantu?"
                        required
                        className="rounded-xl border border-border-subtle bg-surface-container-high/40 px-4 py-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-message"
                        className="px-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant"
                      >
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tulis detail pesan kamu di sini..."
                        required
                        className="flex w-full resize-none rounded-xl border border-border-subtle bg-surface-container-high/40 px-4 py-3 text-xs text-text-primary transition-colors [transition-duration:var(--duration-fast)] placeholder:text-text-muted hover:border-outline-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto font-bold uppercase tracking-wider text-xs shadow-md"
                    >
                      <Send className="w-4 h-4 mr-1.5" />
                      Kirim Pesan
                    </Button>
                  </form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Contact Info and locations column */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Quick Contact info */}
            <div className="rounded-3xl border border-border-subtle bg-surface-card p-6 space-y-5">
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                Quick Contact
              </h4>
              {[
                {
                  icon: <Phone className="w-4 h-4" />,
                  label: 'Phone',
                  value: SITE.phone,
                  href: `tel:${SITE.phone}`,
                },
                {
                  icon: <Mail className="w-4 h-4" />,
                  label: 'Email',
                  value: SITE.email,
                  href: `mailto:${SITE.email}`,
                },
                {
                  icon: <MapPin className="w-4 h-4" />,
                  label: 'Address',
                  value: SITE.address,
                },
                {
                  icon: <Clock className="w-4 h-4" />,
                  label: 'Hours',
                  value: `${SITE.operatingHours.weekday} (Weekday)`,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-mono text-[9px] font-semibold uppercase tracking-tight text-text-muted">
                      {item.label}
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-xs font-semibold leading-relaxed text-text-primary transition-colors hover:text-primary"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <div className="text-xs leading-relaxed text-text-primary">
                        {item.value}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA Link */}
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=Halo%20Warkop%20Ya'reh!`}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-cta-motion flex items-center gap-4 rounded-3xl bg-primary-container p-5 text-on-primary-container shadow-lg"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-on-primary-container/15">
                <MessageCircle className="h-6 w-6 text-on-primary-container" />
              </div>
              <div>
                <div className="font-bold text-xs uppercase tracking-wider">
                  Chat via WhatsApp
                </div>
                <div className="mt-0.5 text-[10px] text-on-primary-container/80">
                  Respon instan dari team barista kami
                </div>
              </div>
            </a>

            {/* Branch Locations list */}
            <div className="rounded-3xl border border-border-subtle bg-surface-card p-6 space-y-4">
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                Our Branches
              </h4>
              <div className="space-y-4">
                {BRANCH_LOCATIONS.map((branch) => (
                  <div
                    key={branch.id}
                    className="space-y-1.5 rounded-2xl border border-border-subtle bg-surface-container-high/20 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">
                        {branch.name}
                      </span>
                      {branch.isMainBranch && (
                        <Badge
                          variant="gold"
                          className="text-[8px] uppercase px-2 py-0.5"
                        >
                          Main
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] leading-relaxed text-text-muted">
                      {branch.address}, {branch.city}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
