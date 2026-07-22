import { Link, useLocation } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { QLessLogo } from './Logo'
import { MagneticButton } from './MagneticButton'

export function PublicHeader() {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 80], [0, 1])
  const blur = useTransform(scrollY, [0, 80], [0, 20])
  const bg = useTransform(opacity, (o) => `oklch(0.14 0.02 250 / ${o * 0.7})`)

  return (
    <motion.header
      style={{
        backgroundColor: bg,
        backdropFilter: useTransform(blur, (b) => `blur(${b}px) saturate(140%)`),
      }}
      className="fixed top-0 inset-x-0 z-40 border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
        <Link to="/">
          <QLessLogo />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground ml-6">
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how" className="hover:text-foreground transition-colors">
            How it Works
          </a>
          <a href="#compare" className="hover:text-foreground transition-colors">
            Comparison
          </a>
          <a href="#stats" className="hover:text-foreground transition-colors">
            Live Stats
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/login">
            <MagneticButton variant="outline" size="sm">
              Sign In
            </MagneticButton>
          </Link>
          <Link to="/login">
            <MagneticButton size="sm">Get Started</MagneticButton>
          </Link>
        </div>
      </div>
    </motion.header>
  )
}
