import React from 'react'
import { CalendarDays, BookOpen, Banknote, Users } from 'lucide-react'
import { StatCard } from '@/components/admin/dashboard/StatCard'
import { InventoryTable } from '@/components/admin/dashboard/InventoryTable'
import { CommunityEventsWidget } from '@/components/admin/dashboard/CommunityEventsWidget'
import { LoyaltyTierWidget } from '@/components/admin/dashboard/LoyaltyTierWidget'

export default function DashboardPage() {
  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="font-plus-jakarta font-800 text-2xl text-[var(--text-primary)]">
          Dashboard
        </h1>
        <p className="text-sm font-inter text-[var(--text-tertiary)] mt-1">
          Warkop Ya&apos;reh — Branch Overview · Surabaya Flagship
        </p>
      </div>

      {/* Stat Cards — 4-column grid */}
      {/* CRITICAL: Do NOT use divide-x. Each card is a standalone bordered element */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Upcoming Events"
          value="02"
          icon={CalendarDays}
          iconColor="brand"
          trend={{ value: '+1', direction: 'up', label: 'this week' }}
        />
        <StatCard
          label="Active Reservations"
          value="05"
          icon={BookOpen}
          iconColor="gold"
          trend={{ value: '↑ 3', direction: 'up', label: 'from yesterday' }}
        />
        <StatCard
          label="Monthly Revenue"
          value="Rp 42.8M"
          icon={Banknote}
          iconColor="success"
          trend={{ value: '+12%', direction: 'up', label: 'vs last month' }}
        />
        <StatCard
          label="Active Members"
          value="1,091"
          icon={Users}
          iconColor="warning"
          trend={{ value: '+47', direction: 'up', label: 'this week' }}
        />
      </div>

      {/* Main content grid — inventory wide, right column narrow */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <InventoryTable />

        {/* Right column: stacked widgets */}
        <div className="space-y-4">
          <CommunityEventsWidget />
          <LoyaltyTierWidget />
        </div>
      </div>

    </div>
  )
}
