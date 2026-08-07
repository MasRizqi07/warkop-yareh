import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Event & Workshop Surabaya",
  description:
    "Temukan jadwal workshop, talkshow, live music, dan event seru mendatang di Warkop Ya'reh Surabaya. Daftar dan reservasi tiket online.",
  alternates: { canonical: `${SITE.url}/events` },
  openGraph: {
    title: `Event & Workshop | ${SITE.name}`,
    description:
      "Jadwal event, workshop, dan live session di Warkop Ya'reh Surabaya.",
    url: `${SITE.url}/events`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
