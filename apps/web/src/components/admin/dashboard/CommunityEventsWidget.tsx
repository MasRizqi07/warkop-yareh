'use client'

import React from 'react'

const events = [
  {
    id: 1,
    title: 'Surabaya Dev Meetup',
    location: 'Co-working Space A',
    date: { day: '24', month: 'OCT' },
    attendees: 42,
  },
  {
    id: 2,
    title: 'Latte Art Workshop',
    location: 'Brewing Station',
    date: { day: '28', month: 'OCT' },
    attendees: 12,
  },
]

export function CommunityEventsWidget() {
  return (
    <div className="bg-[var(--surface-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-default)]">
        <div>
          <h3 className="font-plus-jakarta font-600 text-sm text-[var(--text-primary)]">Community</h3>
          <p className="text-xs font-inter text-[var(--text-tertiary)] mt-0.5">Active meetups & workshops</p>
        </div>
      </div>

      <div className="divide-y divide-[var(--border-default)]">
        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-4 px-5 py-4 
                                          hover:bg-[var(--surface-tertiary)] transition-colors duration-150">
            {/* Date badge */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--surface-tertiary)]
                            border border-[var(--border-default)] flex flex-col items-center justify-center">
              <span className="font-jetbrains font-500 text-[10px] text-[var(--text-tertiary)] uppercase leading-none">
                {event.date.month}
              </span>
              <span className="font-plus-jakarta font-700 text-lg text-[var(--text-primary)] leading-tight">
                {event.date.day}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-plus-jakarta font-600 text-[var(--text-primary)] truncate">
                {event.title}
              </p>
              <p className="text-xs font-inter text-[var(--text-tertiary)] mt-0.5 flex items-center gap-1">
                <span>📍</span> {event.location}
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                {[...Array(Math.min(3, Math.floor(event.attendees / 10)))].map((_, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full bg-[var(--surface-tertiary)] border border-[var(--border-default)]
                                           ring-1 ring-[var(--surface-secondary)] ${i > 0 ? '-ml-1.5' : ''}`} />
                ))}
                <span className="text-[11px] font-jetbrains text-[var(--text-tertiary)] ml-1">
                  +{event.attendees}
                </span>
              </div>
            </div>

            <button className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-inter font-500
                                bg-[var(--surface-tertiary)] border border-[var(--border-default)]
                                text-[var(--text-secondary)] hover:border-[var(--border-hover)]
                                hover:text-[var(--text-primary)] transition-all duration-200">
              Manage
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
