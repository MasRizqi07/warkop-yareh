import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Kontak, Lokasi Cabang & Jam Buka",
  description:
    "Hubungi Warkop Ya'reh Surabaya, dapatkan informasi lokasi cabang, jam operasional, customer care, serta petunjuk arah ke lokasi kami.",
  alternates: { canonical: `${SITE.url}/contact` },
  openGraph: {
    title: `Kontak & Lokasi | ${SITE.name}`,
    description:
      "Informasi lokasi cabang, jam operasional, dan kontak Warkop Ya'reh.",
    url: `${SITE.url}/contact`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
