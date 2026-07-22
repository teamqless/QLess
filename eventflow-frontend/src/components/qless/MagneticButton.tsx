import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MagneticButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
  strength?: number
}

export function MagneticButton({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  className,
  strength = 0.35,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 15 })
  const sy = useSpring(y, { stiffness: 200, damping: 15 })
  const rx = useTransform(sy, [-40, 40], [8, -8])
  const ry = useTransform(sx, [-40, 40], [-8, 8])

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const mx = e.clientX - r.left - r.width / 2
    const my = e.clientY - r.top - r.height / 2
    x.set(mx * strength)
    y.set(my * strength)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  const variants = {
    primary:
      'bg-gradient-to-r from-cyan to-primary text-primary-foreground shadow-[0_0_30px_oklch(0.85_0.17_205/0.4)] hover:shadow-[0_0_50px_oklch(0.85_0.17_205/0.6)]',
    outline:
      'border border-white/15 bg-white/5 text-foreground hover:bg-white/10 shimmer-border',
    ghost: 'text-foreground/80 hover:text-foreground hover:bg-white/5',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    success: 'bg-success text-success-foreground hover:bg-success/90',
  } as const

  const sizes = {
    sm: 'h-9 px-4 text-sm rounded-lg',
    md: 'h-11 px-6 text-sm rounded-xl',
    lg: 'h-14 px-8 text-base rounded-2xl',
  } as const

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy, rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
      whileTap={{ scale: 0.96 }}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...(rest as any)}
    >
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </motion.button>
  )
}
