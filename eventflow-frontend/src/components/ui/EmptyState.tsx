import React from 'react'

export interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="border-2 border-dashed border-line rounded-2xl py-16 px-6 text-center animate-fade-in">
      <div className="w-12 h-12 rounded-2xl bg-paper-dim flex items-center justify-center mx-auto mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-ink-faint">
          <path d="M9 12h6M9 16h4M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8L14 3z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="font-display font-semibold text-ink mb-1.5">{title}</p>
      {description && <p className="text-sm text-ink-faint mb-5 max-w-xs mx-auto leading-relaxed">{description}</p>}
      {action}
    </div>
  )
}
