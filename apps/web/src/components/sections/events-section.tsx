"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, ArrowRight, Clock, Coffee } from "lucide-react";
import { events } from "@/data/mock";
import { fadeInUp, staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

function EventImage({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <>
      {status === "loading" && (
        <div className="absolute inset-0 skeleton" aria-hidden="true" />
      )}
      {status === "error" && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-surface-raised)] border border-[var(--border-default)]"
          aria-label={`Image unavailable for ${alt}`}
        >
          <Coffee size={28} className="text-[var(--accent-fill)] mb-1" />
          <span className="text-[10px] text-[var(--accent-fill)] font-medium">
            Event
          </span>
        </div>
      )}
      {status !== "error" && (
        <Image
          alt={alt}
          src={src}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
    </>
  );
}

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, mins: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
      };
    };

    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-1.5 shrink-0">
      {[
        { val: timeLeft.days, label: "D" },
        { val: timeLeft.hours, label: "H" },
        { val: timeLeft.mins, label: "M" },
      ].map((unit) => (
        <div
          key={unit.label}
          className="flex flex-col items-center px-2 py-1 rounded-lg bg-[var(--interactive-secondary)]"
        >
          <span className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{unit.val}</span>
          <span className="text-[9px] text-[var(--text-tertiary)] uppercase">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

export function EventsSection() {
  const upcomingEvents = events.filter((e) => e.status === "upcoming").slice(0, 3);

  return (
    <section className="py-[var(--section-md)] relative overflow-hidden" id="events">
      {/* Theme-aware background */}
      <div className="absolute inset-0 gradient-section-events" aria-hidden="true" />
      <div className="absolute inset-0 bg-noise pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT.once}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <span className="label-caps text-[var(--text-brand)] mb-2 block">
              Upcoming Events
            </span>
            <h2 className="text-[var(--text-h2)] font-[var(--weight-bold)] tracking-[var(--tracking-heading)] text-[var(--text-primary)]">
              Event & Komunitas
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md">
              Developer meetups, acoustic nights, workshops, dan lebih banyak lagi.
            </p>
          </div>
          <Link
            href="/events"
            className="text-sm font-medium text-[var(--text-brand)] flex items-center gap-1 group shrink-0"
          >
            Semua Event
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </motion.div>

        {/* Events Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT.once}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {upcomingEvents.map((event) => {
            const seatsLeft = event.capacity - event.registered;
            const isFilling = seatsLeft <= 10;

            return (
              <motion.div
                key={event.id}
                variants={staggerItem}
                className="group relative rounded-[var(--radius-2xl)] overflow-hidden gradient-border card-hover"
              >
                <div className="relative bg-[var(--surface-overlay)] rounded-[var(--radius-2xl)] h-full flex flex-col overflow-hidden">
                  {/* Event Image */}
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
                    <EventImage src={event.image} alt={event.title} />
                    {/* Category badge overlaid on image */}
                    <div className="absolute top-3 left-3 z-[2]">
                      <span className="shrink-0 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[var(--accent-fill)] text-[var(--text-on-brand)] shadow-sm">
                        {event.category}
                      </span>
                    </div>
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-[1]" />
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Countdown */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h3 className="text-lg font-bold text-[var(--text-primary)] leading-snug">
                        {event.title}
                      </h3>
                      <Countdown targetDate={event.date} />
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 flex-1">
                      {event.description}
                    </p>

                    {/* Meta */}
                    <div className="space-y-2 mb-5">
                      <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                        <Calendar size={14} />
                        <span>
                          {new Date(event.date).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                        <Clock size={14} />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                        <MapPin size={14} />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    {/* Bottom: Capacity + CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-[var(--text-tertiary)]" />
                        <span className={`text-xs font-medium ${isFilling ? "text-[var(--color-error-500)]" : "text-[var(--text-secondary)]"}`}>
                          {isFilling && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-error-500)] mr-1 animate-pulse" />}
                          {seatsLeft} seats left
                        </span>
                      </div>
                      <Link href={`/events`}>
                        <button className="px-4 py-2 rounded-full bg-[var(--color-primary-500)] text-white text-xs font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          {event.isFree ? "Daftar Gratis" : `Rp ${(event.price / 1000).toFixed(0)}k`}
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
