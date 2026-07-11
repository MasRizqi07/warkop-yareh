'use client'

import React from 'react'

interface InventoryItem {
  category: string
  currentLevel: string
  unit: string
  percentage: number
  status: 'CRITICAL' | 'LOW STOCK' | 'OPTIMAL'
}

const statusConfig = {
  CRITICAL:  { color: 'text-[var(--error-500)]',   bar: 'bg-[var(--error-500)]',   ring: 'border-[var(--error-500)]/40' },
  'LOW STOCK': { color: 'text-[var(--warning-500)]', bar: 'bg-[var(--warning-500)]', ring: 'border-[var(--warning-500)]/40' },
  OPTIMAL:   { color: 'text-[var(--success-500)]', bar: 'bg-[var(--success-500)]', ring: 'border-[var(--success-500)]/40' },
}

const inventoryData: InventoryItem[] = [
  { category: 'Coffee Beans', currentLevel: '1.2',  unit: 'kg', percentage: 12, status: 'CRITICAL'  },
  { category: 'Dairy / Alt',  currentLevel: '14.0', unit: 'L',  percentage: 70, status: 'OPTIMAL'   },
  { category: 'Sweeteners',   currentLevel: '3.5',  unit: 'kg', percentage: 35, status: 'LOW STOCK' },
]

export function InventoryTable() {
  return (
    <div className="bg-[var(--surface-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-default)]">
        <div>
          <h3 className="font-plus-jakarta font-600 text-sm text-[var(--text-primary)]">
            Inventory Status
          </h3>
          <p className="text-xs font-inter text-[var(--text-tertiary)] mt-0.5">
            Real-time stock levels
          </p>
        </div>
        <button className="text-xs font-inter text-[var(--text-brand)] hover:text-[var(--interactive-primary-hover)] transition-colors">
          View All →
        </button>
      </div>

      {/* Table */}
      <div className="divide-y divide-[var(--border-default)]">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_120px_120px_100px] gap-4 px-5 py-2.5">
          {['CATEGORY', 'CURRENT LEVEL', 'STATUS', ''].map((h) => (
            <span key={h} className="text-[10px] font-inter font-400 text-[var(--text-tertiary)] uppercase tracking-widest">
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {inventoryData.map((item) => {
          const cfg = statusConfig[item.status]
          return (
            <div
              key={item.category}
              className="grid grid-cols-[1fr_120px_120px_100px] gap-4 items-center px-5 py-3.5
                         hover:bg-[var(--surface-tertiary)] transition-colors duration-150"
            >
              <span className="text-sm font-inter text-[var(--text-primary)]">{item.category}</span>

              <div>
                <span className="font-jetbrains font-500 text-sm text-[var(--text-primary)]">
                  {item.currentLevel}{item.unit}
                </span>
                <div className="mt-1.5 h-1 w-20 rounded-full bg-[var(--surface-tertiary)]">
                  <div
                    className={`h-full rounded-full ${cfg.bar} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>

              <div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] 
                                  font-jetbrains font-500 border ${cfg.color} ${cfg.ring} 
                                  bg-transparent uppercase tracking-wider`}>
                  {item.status}
                </span>
              </div>

              <button className="text-xs font-inter text-[var(--text-tertiary)] 
                                  hover:text-[var(--text-brand)] transition-colors">
                Restock →
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
