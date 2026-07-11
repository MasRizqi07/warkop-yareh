import React from "react";
import Link from "next/link";
import { Plus, CalendarPlus, ListOrdered, Download } from "lucide-react";

export function QuickActions() {
  const actions = [
    { label: "Add Product",       icon: Plus,          href: "/products/new",    accent: false },
    { label: "New Reservation",   icon: CalendarPlus,  href: "/reservations/new", accent: false },
    { label: "Manage Orders",     icon: ListOrdered,   href: "/orders",           accent: true  },
    { label: "Export Report",     icon: Download,      href: "/analytics",        accent: false },
  ];

  return (
    <div className="rounded-xl bg-[var(--surface-tertiary)] dark:bg-[var(--surface-tertiary)] border border-[var(--border-default)] p-6 h-full flex flex-col">
      <h3 className="font-heading text-base font-semibold text-[var(--text-primary)] mb-6">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 gap-3 flex-grow content-start">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link
              key={i}
              href={action.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-normal active:scale-95 border ${
                action.accent
                  ? "bg-[var(--interactive-primary)] text-white hover:bg-[var(--interactive-primary-hover)] border-transparent pulse-glow"
                  : "bg-[var(--surface-primary)] dark:bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:bg-[var(--border-default)] border-[var(--border-default)]"
              }`}
            >
              <Icon className="w-5 h-5" />
              {action.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
