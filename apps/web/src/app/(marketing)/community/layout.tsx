import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Community Hub & Event Komunitas",
  description:
    "Gabung dengan jaringan kreatif, kreator, dan profesional muda di Warkop Ya'reh Surabaya. Diskusi, event networking, dan kolaborasi.",
  alternates: { canonical: `${SITE.url}/community` },
  openGraph: {
    title: `Community Hub | ${SITE.name}`,
    description:
      "Wadah kolaborasi & jaringan komunitas kreatif Surabaya.",
    url: `${SITE.url}/community`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
