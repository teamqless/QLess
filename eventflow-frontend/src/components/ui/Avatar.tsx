import React from 'react'

export interface AvatarProps {
  url?: string | null
  name?: string
  size?: number
}

export function Avatar({ url, name, size = 40 }: AvatarProps) {
  const initial = (name || '?').trim().charAt(0).toUpperCase()
  const fontSize = size < 28 ? 10 : size < 40 ? 13 : size < 60 ? 16 : 22
  const ringStyle = { width: size, height: size, boxShadow: '0 0 0 2px rgba(224,221,213,0.8)' }

  return url ? (
    <img src={url} alt={name || 'avatar'} style={ringStyle} className="rounded-full object-cover shrink-0" />
  ) : (
    <div
      style={{ ...ringStyle, fontSize }}
      className="rounded-full bg-gradient-to-br from-violet/20 to-amber/20 border border-line flex items-center justify-center font-display font-semibold text-ink-soft shrink-0"
    >
      {initial}
    </div>
  )
}
