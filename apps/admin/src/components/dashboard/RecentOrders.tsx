import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function RecentOrders() {
  const recentOrders = [
    { id: "ORD-1042", customer: "Budi S.", items: 2, total: "Rp 78.000", status: "READY",     time: "2m ago" },
    { id: "ORD-1041", customer: "Siti R.", items: 3, total: "Rp 115.000", status: "PREPARING", time: "8m ago" },
    { id: "ORD-1040", customer: "Andi P.", items: 1, total: "Rp 35.000", status: "COMPLETED", time: "15m ago" },
    { id: "ORD-1039", customer: "Dewi M.", items: 4, total: "Rp 162.000", status: "CONFIRMED", time: "22m ago" },
    { id: "ORD-1038", customer: "Reza F.", items: 2, total: "Rp 70.000", status: "COMPLETED", time: "31m ago" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
      case "PREPARING":
        return "bg-[var(--warning-500)]/10 text-[var(--warning-600)] border-[var(--warning-500)]/20";
      case "CONFIRMED":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "READY":
        return "bg-[var(--success-500)]/20 text-[var(--success-600)] border-[var(--success-500)]/30 font-bold";
      case "COMPLETED":
        return "bg-[var(--success-500)]/5 text-[var(--success-600)] border-[var(--success-500)]/10 opacity-70";
      case "CANCELLED":
        return "bg-[var(--error-500)]/10 text-[var(--error-600)] border-[var(--error-500)]/20 opacity-70";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <div className="rounded-xl bg-[var(--surface-tertiary)] dark:bg-[var(--surface-tertiary)] border border-[var(--border-default)] p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)]">Recent Orders</h3>
          <p className="font-sans text-xs text-[var(--text-secondary)] mt-0.5">Latest queue updates</p>
        </div>
        <Link href="/orders" className="text-[var(--text-brand)] hover:underline font-mono text-xs font-semibold flex items-center gap-1 group">
          VIEW ALL <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-[var(--border-default)]">
              <th className="py-3 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Order ID</th>
              <th className="py-3 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Customer</th>
              <th className="py-3 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Items</th>
              <th className="py-3 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Total</th>
              <th className="py-3 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Status</th>
              <th className="py-3 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]/50">
            {recentOrders.map((order, i) => (
              <tr key={order.id} className={`group hover:bg-[var(--surface-secondary)]/50 transition-colors motion-safe:card-hover`}>
                <td className="py-4 font-mono text-xs font-semibold text-[var(--text-primary)]">{order.id}</td>
                <td className="py-4 font-sans text-sm font-medium text-[var(--text-primary)]">{order.customer}</td>
                <td className="py-4 font-sans text-sm text-[var(--text-secondary)]">{order.items} items</td>
                <td className="py-4 font-mono text-sm font-medium text-[var(--text-primary)]">{order.total}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4 text-right font-sans text-xs text-[var(--text-tertiary)]">{order.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
