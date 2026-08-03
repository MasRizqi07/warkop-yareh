"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Coffee,
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
  Globe,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { SITE, NAV_LINKS } from "@/lib/constants";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0C0D0E] text-[#E9ECEF] overflow-hidden">
      {/* Brand gradient separator */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--color-primary-500)] to-transparent opacity-60" />

      {/* Noise texture */}
      <div className="absolute inset-0 bg-noise pointer-events-none" />

      {/* Footer Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT.once}
        className="relative z-10 max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 md:pb-12"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12">
          {/* Brand */}
          <motion.div variants={staggerItem} className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white leading-none">WARKOP</div>
                <div className="text-[9px] font-semibold tracking-[0.2em] text-[var(--color-primary-400)] leading-none mt-0.5">
                  YA&apos;REH
                </div>
              </div>
            </Link>
            <p className="text-sm text-[#ADB5BD] mb-6 leading-relaxed">
              Platform digital ekosistem — kopi premium, coworking space,
              community hub di Wonokromo, Surabaya.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Globe, href: SITE.social.instagram, label: "Instagram" },
                { icon: ExternalLink, href: SITE.social.youtube, label: "YouTube" },
                {
                  icon: MessageCircle,
                  href: `https://wa.me/${SITE.whatsapp}`,
                  label: "WhatsApp",
                  isWhatsApp: true,
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#868E96] hover:text-white transition-all duration-200 ${
                    (social as { isWhatsApp?: boolean }).isWhatsApp ? "animate-pulse-ring" : ""
                  }`}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={staggerItem}>
            <h4 className="text-xs font-semibold text-white mb-5 uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#ADB5BD] hover:text-[var(--color-primary-400)] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={staggerItem}>
            <h4 className="text-xs font-semibold text-white mb-5 uppercase tracking-widest">
              Services
            </h4>
            <ul className="space-y-3">
              {[
                "Online Ordering",
                "Table Reservation",
                "Coworking Space",
                "Event Space",
                "Meeting Room",
                "Catering",
              ].map((item) => (
                <li key={item}>
                  <span className="text-sm text-[#ADB5BD]">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={staggerItem}>
            <h4 className="text-xs font-semibold text-white mb-5 uppercase tracking-widest">
              Visit Us
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[var(--color-primary-400)] mt-0.5 shrink-0" />
                <span className="text-sm text-[#ADB5BD]">{SITE.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[var(--color-primary-400)] shrink-0" />
                <a
                  href={`tel:${SITE.phone}`}
                  className="text-sm text-[#ADB5BD] hover:text-white transition-colors"
                >
                  {SITE.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[var(--color-primary-400)] shrink-0" />
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-sm text-[#ADB5BD] hover:text-white transition-colors"
                >
                  {SITE.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[var(--color-primary-400)] shrink-0" />
                <div className="text-sm text-[#ADB5BD]">
                  <div>Weekday: {SITE.operatingHours.weekday}</div>
                  <div>Weekend: {SITE.operatingHours.weekend}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#868E96]">
            © {currentYear} {SITE.name}. All rights reserved.
          </p>
          <p className="text-xs text-[#868E96] flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-[var(--color-error-500)] fill-[var(--color-error-500)]" /> in Surabaya
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
