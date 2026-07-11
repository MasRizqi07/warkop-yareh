"use client";

import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { StatsSection } from "@/components/sections/stats-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { EventsSection } from "@/components/sections/events-section";
import { MembershipCard } from "@/components/sections/membership-card";
import { CTASection } from "@/components/sections/cta-section";

export default function HomePage() {
  return (
    <>
      {/* 1. Hero — Full viewport, dark, aurora background */}
      <HeroSection />

      {/* 2. Featured Products — Category tabs, product cards */}
      <FeaturedProducts />

      {/* 3. Stats — Animated counters, bento grid */}
      <StatsSection />

      {/* 4. Testimonials — Two-row infinite marquee */}
      <TestimonialsSection />

      {/* 5. Events — Dark section, glass cards, countdowns */}
      <EventsSection />

      {/* 6. Loyalty / Membership — 3D card + tier progression */}
      <MembershipCard />

      {/* 7. CTA — Join community */}
      <CTASection />
    </>
  );
}
