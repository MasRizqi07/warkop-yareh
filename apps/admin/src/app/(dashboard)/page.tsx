import React from "react";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { StatsRow } from "../../components/dashboard/StatsRow";
import { RevenueChart } from "../../components/dashboard/RevenueChart";
import { QuickActions } from "../../components/dashboard/QuickActions";
import { RecentOrders } from "../../components/dashboard/RecentOrders";
import { InventoryAlert } from "../../components/dashboard/InventoryAlert";
import { UpcomingEvents } from "../../components/dashboard/UpcomingEvents";
import { LoyaltyTierStats } from "../../components/dashboard/LoyaltyTierStats";

export default function AdminDashboard() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header row */}
      <DashboardHeader />

      {/* 2. Stats row — 4 cards */}
      <StatsRow />

      {/* 3. Main content grid — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Revenue chart (lg:col-span-2) */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* RIGHT: Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* 4. Second row — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        <InventoryAlert />
      </div>

      {/* 5. Third row — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingEvents />
        <LoyaltyTierStats />
      </div>
    </div>
  );
}

