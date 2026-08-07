import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Reservasi Coworking Space & Meja",
  description:
    "Booking meja kerja, private room, atau tempat meeting di Warkop Ya'reh Surabaya. Fasilitas WiFi kencang, stopkontak, dan suasana kondusif.",
  alternates: { canonical: `${SITE.url}/booking` },
  openGraph: {
    title: `Reservasi Coworking & Meja | ${SITE.name}`,
    description:
      "Booking meja kerja & tempat meeting di Warkop Ya'reh Surabaya.",
    url: `${SITE.url}/booking`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
