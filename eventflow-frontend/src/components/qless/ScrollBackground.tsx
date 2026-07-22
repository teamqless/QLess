import { motion, useScroll, useTransform } from 'framer-motion'

/**
 * Morphs a full-screen gradient mesh through five color profiles as the
 * landing page scrolls: Midnight → Indigo/Violet → Charcoal/Crimson →
 * Emerald/Cyan → Aurora.
 */
export function ScrollBackground() {
  const { scrollYProgress } = useScroll()
  const bg = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [
      'radial-gradient(ellipse at 50% 0%, oklch(0.3 0.15 210 / 0.5), transparent 60%), radial-gradient(ellipse at 20% 80%, oklch(0.22 0.12 260 / 0.4), transparent 60%)',
      'radial-gradient(ellipse at 30% 30%, oklch(0.32 0.2 285 / 0.55), transparent 60%), radial-gradient(ellipse at 70% 70%, oklch(0.25 0.2 265 / 0.4), transparent 60%)',
      'radial-gradient(ellipse at 60% 40%, oklch(0.35 0.22 25 / 0.4), transparent 60%), radial-gradient(ellipse at 20% 90%, oklch(0.2 0.1 20 / 0.4), transparent 60%)',
      'radial-gradient(ellipse at 40% 50%, oklch(0.35 0.2 165 / 0.45), transparent 60%), radial-gradient(ellipse at 80% 20%, oklch(0.3 0.18 200 / 0.4), transparent 60%)',
      'radial-gradient(ellipse at 50% 50%, oklch(0.4 0.24 200 / 0.5), transparent 55%), radial-gradient(ellipse at 20% 20%, oklch(0.4 0.24 295 / 0.4), transparent 60%), radial-gradient(ellipse at 80% 80%, oklch(0.4 0.22 155 / 0.35), transparent 60%)',
      'radial-gradient(ellipse at 50% 50%, oklch(0.4 0.24 200 / 0.5), transparent 55%), radial-gradient(ellipse at 20% 20%, oklch(0.4 0.24 295 / 0.4), transparent 60%), radial-gradient(ellipse at 80% 80%, oklch(0.4 0.22 155 / 0.35), transparent 60%)',
    ],
  )

  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none transition-colors"
      style={{ backgroundImage: bg }}
    />
  )
}
