import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Artikel & Insight Komunitas Kreatif Surabaya",
  description:
    "Kumpulan artikel, cerita kopi, tren kreatif, dan insight gaya hidup komunitas Surabaya dari Warkop Ya'reh.",
  alternates: { canonical: `${SITE.url}/blog` },
  openGraph: {
    title: `Blog & Insight | ${SITE.name}`,
    description: "Artikel, cerita kopi, dan insight komunitas kreatif Surabaya.",
    url: `${SITE.url}/blog`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
