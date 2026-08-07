import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tentang Warkop Ya'reh & Cerita Brand",
  description:
    "Mengenal kisah di balik Warkop Ya'reh Wonokromo Surabaya. Lebih dari sekadar warkop — ruang bertumbuh bagi komunitas kreatif, pekerja lepas, dan pencinta kopi.",
  alternates: { canonical: `${SITE.url}/about` },
  openGraph: {
    title: `Tentang Kami | ${SITE.name}`,
    description:
      "Kisah di balik Warkop Ya'reh — ruang bertumbuh komunitas kreatif Surabaya.",
    url: `${SITE.url}/about`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
