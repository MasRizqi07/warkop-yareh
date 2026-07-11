"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Coffee,
  Calendar,
  Star,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  analyticsOverview,
  revenueChart,
  orderChart,
  topProducts,
} from "@/data/mock";


function KPICard({
  title,
  value,
  growth,
  icon,
  index,
}: {
  title: string;
  value: string;
  growth: number;
  icon: React.ReactNode;
  index: number;
}) {
  const isPositive = growth > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-500">
          {icon}
        </div>
        <div
          className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${
            isPositive
              ? "bg-success-50 text-success-600 dark:bg-success-500/10"
              : "bg-error-50 text-error-600 dark:bg-error-500/10"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {Math.abs(growth)}%
        </div>
      </div>
      <div
        className="text-2xl font-bold text-[var(--text-primary)] mb-1 font-mono"
      >
        {value}
      </div>
      <div className="text-xs text-[var(--text-tertiary)]">{title}</div>
    </motion.div>
  );
}

function MiniChart({
  data,
  color,
}: {
  data: { date: string; value: number }[];
  color: string;
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d, i) => (
        <motion.div
          key={d.date}
          initial={{ height: 0 }}
          animate={{ height: `${(d.value / max) * 100}%` }}
          transition={{ delay: 0.5 + i * 0.05, duration: 0.4, ease: "easeOut" }}
          className="flex-1 rounded-t-md relative group cursor-pointer"
          style={{ backgroundColor: color }}
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--surface-elevated)] border border-[var(--border-default)] px-2 py-1 rounded-lg text-[10px] font-mono text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-10">
            {typeof d.value === "number" && d.value > 100000
              ? formatCurrency(d.value)
              : d.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const data = analyticsOverview;

  return (
    <div className="min-h-screen bg-[var(--surface-secondary)]">
      {/* Admin Header */}
      <header className="bg-[var(--surface-primary)] border-b border-[var(--border-default)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-[var(--text-primary)]">
                WARKOP YA&apos;REH
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)]">
                Admin Dashboard
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="success" size="sm">
              <span className="w-1.5 h-1.5 rounded-full bg-success-500 mr-1" />
              All Systems Operational
            </Badge>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
              AD
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            Welcome back! Here&apos;s what&apos;s happening with your business
            today.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Total Revenue"
            value={formatCurrency(data.totalRevenue)}
            growth={data.revenueGrowth}
            icon={<DollarSign className="w-5 h-5" />}
            index={0}
          />
          <KPICard
            title="Total Orders"
            value={data.totalOrders.toLocaleString("id-ID")}
            growth={data.orderGrowth}
            icon={<ShoppingCart className="w-5 h-5" />}
            index={1}
          />
          <KPICard
            title="Total Customers"
            value={data.totalCustomers.toLocaleString("id-ID")}
            growth={data.customerGrowth}
            icon={<Users className="w-5 h-5" />}
            index={2}
          />
          <KPICard
            title="Avg Order Value"
            value={formatCurrency(data.averageOrderValue)}
            growth={data.aovGrowth}
            icon={<TrendingUp className="w-5 h-5" />}
            index={3}
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Revenue Overview
                </h3>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Last 6 months
                </p>
              </div>
              <Badge variant="success" size="sm">
                +12.5%
              </Badge>
            </div>
            <MiniChart data={revenueChart} color="var(--color-primary-500)" />
            <div className="flex justify-between mt-2">
              {revenueChart.map((d) => (
                <span
                  key={d.date}
                  className="text-[10px] text-[var(--text-tertiary)] flex-1 text-center"
                >
                  {d.date}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Orders Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Weekly Orders
                </h3>
                <p className="text-xs text-[var(--text-tertiary)]">This week</p>
              </div>
              <Badge variant="success" size="sm">
                +8.3%
              </Badge>
            </div>
            <MiniChart data={orderChart} color="var(--color-accent-500)" />
            <div className="flex justify-between mt-2">
              {orderChart.map((d) => (
                <span
                  key={d.date}
                  className="text-[10px] text-[var(--text-tertiary)] flex-1 text-center"
                >
                  {d.date}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-3 p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]"
          >
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">
              Top Products
            </h3>
            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 pb-2 border-b border-[var(--border-subtle)] text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                <span>Product</span>
                <span className="text-right w-16">Orders</span>
                <span className="text-right w-28">Revenue</span>
              </div>
              {topProducts.map((product, i) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="grid grid-cols-[1fr_auto_auto] gap-4 py-3 items-center hover:bg-[var(--surface-tertiary)] rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {product.name}
                    </span>
                  </div>
                  <span className="text-sm font-mono text-[var(--text-secondary)] text-right w-16">
                    {product.orders.toLocaleString("id-ID")}
                  </span>
                  <span className="text-sm font-mono font-semibold text-[var(--text-primary)] text-right w-28">
                    {formatCurrency(product.revenue)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Active Members */}
            <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Active Today
                </div>
              </div>
              <div
                className="text-3xl font-bold text-[var(--text-primary)] mb-1 font-mono"
              >
                247
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">
                members online now
              </p>
            </div>

            {/* Upcoming Events */}
            <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Upcoming Events
                </div>
              </div>
              <div
                className="text-3xl font-bold text-[var(--text-primary)] mb-1 font-mono"
              >
                6
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">
                events this month
              </p>
            </div>

            {/* Avg Rating */}
            <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center text-accent-500">
                  <Star className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Avg Rating
                </div>
              </div>
              <div
                className="text-3xl font-bold text-[var(--text-primary)] mb-1 font-mono"
              >
                4.8
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">
                from 1,247 reviews
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
