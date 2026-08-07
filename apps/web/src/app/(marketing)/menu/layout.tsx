import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Menu Kopi & Makanan Premium",
  description:
    "Jelajahi menu kopi specialty, makanan, dan pastry premium Warkop Ya'reh Wonokromo Surabaya. Order online, pilih cabang, nikmati kualitas terbaik.",
  alternates: { canonical: `${SITE.url}/menu` },
  openGraph: {
    title: `Menu | ${SITE.name}`,
    description: "Kopi specialty, makanan, dan pastry premium — order online.",
    url: `${SITE.url}/menu`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
