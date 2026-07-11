import React from 'react'
import { AdminSidebar } from '@/components/admin/sidebar/AdminSidebar'
import { AdminTopbar } from '@/components/admin/topbar/AdminTopbar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: '260px 1fr' }}>
      <AdminSidebar />
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <AdminTopbar />
        <main className="flex-1 p-6 bg-[var(--surface-primary)]">
          {children}
        </main>
      </div>
    </div>
  )
}
