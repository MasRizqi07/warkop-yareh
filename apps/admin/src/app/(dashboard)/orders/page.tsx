"use client";

import React, { useState } from "react";
import { Search, Eye } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  itemsCount: number;
  total: string;
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
  time: string;
  type: "DINE-IN" | "TAKEAWAY";
}

export default function OrdersPage() {
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const orders: Order[] = [
    { id: "1", orderNumber: "WY-20260611-1002", customerName: "Andi Wijaya", itemsCount: 3, total: "Rp 128,000", status: "PENDING", time: "2 mins ago", type: "DINE-IN" },
    { id: "2", orderNumber: "WY-20260611-1001", customerName: "Siti Rahma", itemsCount: 1, total: "Rp 35,000", status: "PREPARING", time: "10 mins ago", type: "TAKEAWAY" },
    { id: "3", orderNumber: "WY-20260611-0998", customerName: "Budi Santoso", itemsCount: 2, total: "Rp 75,000", status: "READY", time: "15 mins ago", type: "DINE-IN" },
    { id: "4", orderNumber: "WY-20260611-0995", customerName: "Dewi Lestari", itemsCount: 4, total: "Rp 195,000", status: "COMPLETED", time: "1 hour ago", type: "DINE-IN" },
    { id: "5", orderNumber: "WY-20260611-0990", customerName: "Eko Prasetyo", itemsCount: 2, total: "Rp 64,000", status: "CANCELLED", time: "2 hours ago", type: "TAKEAWAY" },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === "ALL" || order.status === filter;
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">Orders Management</h1>
          <p className="font-sans text-xs text-[var(--text-secondary)] mt-0.5">Track, update, and manage orders across branches</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search order or customer..."
              className="bg-[var(--surface-tertiary)] border border-[var(--border-default)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] w-64 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Orders Filter Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-default)] overflow-x-auto pb-px">
        {["ALL", "PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 shrink-0 ${
              filter === status
                ? "border-[var(--color-primary)] text-[var(--text-brand)] font-bold"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-tertiary)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--surface-secondary)]/50">
                <th className="p-4 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Order ID</th>
                <th className="p-4 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Customer</th>
                <th className="p-4 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold text-center">Type</th>
                <th className="p-4 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold text-center">Items</th>
                <th className="p-4 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Total</th>
                <th className="p-4 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Status</th>
                <th className="p-4 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Time</th>
                <th className="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]/50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-[var(--text-tertiary)] font-sans">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--surface-secondary)]/50 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-[var(--text-primary)]">{order.orderNumber}</td>
                    <td className="p-4 font-sans text-xs font-semibold text-[var(--text-primary)]">{order.customerName}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                        order.type === "DINE-IN" ? "bg-purple-500/10 text-purple-400" : "bg-teal-500/10 text-teal-400"
                      }`}>
                        {order.type}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono text-xs text-[var(--text-secondary)]">{order.itemsCount}</td>
                    <td className="p-4 font-mono text-xs font-bold text-[var(--text-primary)]">{order.total}</td>
                    <td className="p-4"><StatusBadge status={order.status} /></td>
                    <td className="p-4 font-sans text-xs text-[var(--text-secondary)]">{order.time}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button title={`View order ${order.orderNumber}`} aria-label={`View order ${order.orderNumber}`} className="p-1.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {order.status === "PENDING" && (
                          <button 
                            onClick={() => alert(`Order ${order.orderNumber} accepted`)}
                            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] p-1.5 rounded-lg transition-colors"
                          >
                            Accept
                          </button>
                        )}
                        {order.status === "PREPARING" && (
                          <button 
                            onClick={() => alert(`Order ${order.orderNumber} ready for pick up`)}
                            className="bg-[var(--success-600)] text-white hover:bg-[var(--success-500)] p-1.5 rounded-lg transition-colors"
                          >
                            Mark Ready
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
