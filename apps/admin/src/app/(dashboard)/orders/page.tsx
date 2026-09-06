"use client";

import React, { useState, useEffect } from "react";
import { Search, Eye } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { apiFetch } from "@/lib/api";

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

interface ApiOrder {
  id: string;
  orderNumber: string;
  customerName?: string;
  user?: { name?: string };
  items?: unknown[];
  total?: number;
  status?: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  type?: string;
}

export default function OrdersPage() {
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const json = await apiFetch<{ data: ApiOrder[] }>("/orders");
      const list: ApiOrder[] = json.data || [];

      if (Array.isArray(list) && list.length > 0) {
        const mapped: Order[] = list.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName || o.user?.name || "Customer",
          itemsCount: o.items?.length || 0,
          total: `Rp ${(o.total || 0).toLocaleString("id-ID")}`,
          status: o.status || "PENDING",
          time: new Date(o.createdAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: o.type === "DINE_IN" ? "DINE-IN" : "TAKEAWAY",
        }));
        setOrders(mapped);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load admin orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialRequest = setTimeout(fetchOrders, 0);
    const interval = setInterval(fetchOrders, 10000);
    return () => {
      clearTimeout(initialRequest);
      clearInterval(interval);
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

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
              aria-label="Search orders or customers"
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
                    {isLoading ? "Loading orders from server..." : "No orders found matching the filter criteria."}
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
                            onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                            className="bg-[var(--accent-fill)] text-[var(--text-on-brand)] hover:brightness-110 px-2.5 py-1 text-xs rounded-lg transition-colors font-medium cursor-pointer"
                          >
                            Accept & Prepare
                          </button>
                        )}
                        {order.status === "PREPARING" && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, "READY")}
                            className="bg-[var(--success-600)] text-white hover:bg-[var(--success-500)] px-2.5 py-1 text-xs rounded-lg transition-colors"
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.status === "READY" && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                            className="bg-blue-600 text-white hover:bg-blue-500 px-2.5 py-1 text-xs rounded-lg transition-colors"
                          >
                            Complete
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
