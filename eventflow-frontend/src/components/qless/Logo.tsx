import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  showWordmark?: boolean
  className?: string
  wordmarkClassName?: string
}

export function QLessLogo({ size = 36, showWordmark = true, className, wordmarkClassName }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-[0_0_12px_oklch(0.85_0.17_205/0.6)]"
      >
        <circle
          cx="16"
          cy="16"
          r="12"
          style={{ stroke: 'var(--color-primary)' }}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="60 16"
        />
        <path
          d="M22 22L30 30"
          style={{ stroke: 'var(--color-primary)' }}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M14 16L18 20L26 12"
          style={{ stroke: 'var(--color-primary)' }}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
      </svg>
      {showWordmark && (
        <span className={cn('text-2xl font-bold tracking-tight', wordmarkClassName)}>
          <span className="text-foreground">Q</span>
          <span className="text-gradient-cyan">Less</span>
        </span>
      )}
    </div>
  )
}
