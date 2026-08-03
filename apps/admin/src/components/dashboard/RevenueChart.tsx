"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Sen", revenue: 3200000 },
  { day: "Sel", revenue: 4100000 },
  { day: "Rab", revenue: 3800000 },
  { day: "Kam", revenue: 5200000 },
  { day: "Jum", revenue: 6800000 },
  { day: "Sab", revenue: 7400000 },
  { day: "Min", revenue: 5900000 },
];

export function RevenueChart() {
  return (
    <div className="rounded-xl bg-[var(--surface-tertiary)] dark:bg-[var(--surface-tertiary)] border border-[var(--border-default)] p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
            Revenue Trend
          </h3>
          <p className="font-sans text-xs text-[var(--text-secondary)] mt-0.5">
            7 days · Semua branch
          </p>
        </div>
        <span className="font-mono text-xs bg-[var(--color-primary)]/10 text-[var(--text-brand)] px-3 py-1 rounded-full">
          +8.3% vs last week
        </span>
      </div>
      
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12, fill: "var(--text-tertiary)" }} 
              axisLine={false} 
              tickLine={false} 
              dy={10}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} 
              tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} 
              axisLine={false} 
              tickLine={false}
            />
            <Tooltip 
              formatter={(value) => [`Rp ${(Number(value || 0)/1000000).toFixed(2)}M`, "Revenue"]} 
              contentStyle={{ 
                backgroundColor: "var(--surface-elevated)", 
                borderColor: "var(--border-default)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "var(--text-primary)"
              }}
              itemStyle={{ color: "var(--text-primary)" }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="var(--color-primary)" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2, fill: "var(--surface-primary)" }} 
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
