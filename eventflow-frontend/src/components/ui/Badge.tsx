import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  color?: 'default' | 'teal' | 'amber' | 'rust' | 'violet'
}

export function Badge({ children, color = 'default' }: BadgeProps) {
  const colors = {
    default: 'bg-paper-dim text-ink-soft border-line',
    teal:    'bg-teal-soft text-teal border-teal/20',
    amber:   'bg-amber-soft text-amber-deep border-amber/20',
    rust:    'bg-rust-soft text-rust border-rust/20',
    violet:  'bg-violet-soft text-violet border-violet/20',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono border ${colors[color]}`}>
      {children}
    </span>
  )
}
