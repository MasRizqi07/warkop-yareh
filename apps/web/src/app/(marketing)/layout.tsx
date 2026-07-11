"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

import {
  IconHome,
  IconCoffee,
  IconSeat,
  IconGroups,
  IconProfile,
} from "@/lib/icons";

const BOTTOM_NAV_ITEMS = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/menu", label: "Order", icon: IconCoffee },
  { href: "/booking", label: "Book", icon: IconSeat },
  { href: "/community", label: "Hub", icon: IconGroups },
  { href: "/loyalty", label: "Profile", icon: IconProfile },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <ScrollProgress />
      <Header />
      <main id="main-content" role="main" className="pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
      <ScrollToTop />

      {/* Bottom Mobile Navigation */}
      <nav
        className="fixed bottom-0 left-0 w-full z-50 md:hidden"
        aria-label="Mobile navigation"
      >
        <div
          className="bg-[var(--surface-nav)] backdrop-blur-xl border-t border-[var(--surface-border)] rounded-t-2xl"
          style={{ boxShadow: "0 -10px 40px rgba(0,0,0,0.15)" }}
        >
          <div className="flex justify-around items-center px-4 pb-[env(safe-area-inset-bottom,8px)] pt-2">
            {BOTTOM_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? "text-[var(--text-brand)]"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  <item.icon
                    size={22}
                    className={isActive ? "text-[var(--text-brand)]" : ""}
                  />
                  <span className={`text-[10px] mt-0.5 font-medium ${isActive ? "font-semibold" : ""}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="w-1 h-1 rounded-full bg-[var(--text-brand)] mt-0.5" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
