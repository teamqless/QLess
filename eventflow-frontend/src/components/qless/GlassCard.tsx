import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'> {
  tilt?: boolean
  glow?: boolean
  children: ReactNode
}

export function GlassCard({ tilt = false, glow = false, className, children, ...rest }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 150, damping: 20 })
  const sy = useSpring(y, { stiffness: 150, damping: 20 })
  const rx = useTransform(sy, [-0.5, 0.5], [8, -8])
  const ry = useTransform(sx, [-0.5, 0.5], [-8, 8])

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={tilt ? { rotateX: rx, rotateY: ry, transformPerspective: 1000 } : undefined}
      className={cn(
        'glass rounded-2xl p-6 relative overflow-hidden shimmer-border',
        glow && 'glow-cyan',
        className,
      )}
      {...(rest as any)}
    >
      {children}
    </motion.div>
  )
}
