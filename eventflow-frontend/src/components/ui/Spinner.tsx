import React from 'react'

export interface SpinnerProps {
  size?: number
  color?: string
}

export function Spinner({ size = 20, color = 'text-ink-faint' }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${color}`}
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
    </svg>
  )
}
