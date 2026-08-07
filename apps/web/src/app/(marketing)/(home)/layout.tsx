import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE.name} — ${SITE.tagline}`,
  },
  description:
    "Platform digital ekosistem Warkop Ya'reh Wonokromo — kopi specialty premium, coworking space, community hub, loyalty rewards, dan event platform di Surabaya.",
  alternates: { canonical: SITE.url },
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description:
      "Kopi specialty premium, coworking space, dan tempat nongkrong komunitas di Wonokromo Surabaya.",
    url: SITE.url,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
