import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  trend?: { value: string; direction: 'up' | 'down'; label: string }
  icon: LucideIcon
  iconColor?: 'brand' | 'gold' | 'success' | 'warning' | 'error'
}

const iconColorMap = {
  brand:   'bg-[var(--interactive-primary)]/15 text-[var(--text-brand)]',
  gold:    'bg-[var(--accent-500)]/15 text-[var(--accent-500)]',
  success: 'bg-[var(--success-500)]/15 text-[var(--success-500)]',
  warning: 'bg-[var(--warning-500)]/15 text-[var(--warning-500)]',
  error:   'bg-[var(--error-500)]/15 text-[var(--error-500)]',
}

export function StatCard({ label, value, trend, icon: Icon, iconColor = 'brand' }: StatCardProps) {
  return (
    <div
      className="card-hover flex flex-col gap-4 p-5
                 bg-[var(--surface-secondary)] border border-[var(--border-default)]
                 rounded-xl overflow-hidden relative"
    >
      {/* Subtle mesh glow behind */}
      <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <p className="text-xs font-inter font-400 text-[var(--text-tertiary)] uppercase tracking-widest">
          {label}
        </p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconColorMap[iconColor]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="relative">
        <p className="font-plus-jakarta font-800 text-3xl text-[var(--text-primary)] leading-none tracking-tight">
          {value}
        </p>
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            {trend.direction === 'up'
              ? <TrendingUp className="w-3.5 h-3.5 text-[var(--success-500)]" />
              : <TrendingDown className="w-3.5 h-3.5 text-[var(--error-500)]" />
            }
            <span className={`text-xs font-jetbrains font-500 ${
              trend.direction === 'up' ? 'text-[var(--success-500)]' : 'text-[var(--error-500)]'
            }`}>
              {trend.value}
            </span>
            <span className="text-xs font-inter text-[var(--text-tertiary)]">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  )
}
