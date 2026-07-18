# VCollab Design System — Complete Reference
> Copy-paste this into any new project (EventFlow, etc.) to replicate the exact look and feel.

---

## 1. Dependencies to install

```bash
npm install @fontsource/space-grotesk @fontsource/inter @fontsource/jetbrains-mono
npm install -D tailwindcss @tailwindcss/vite
```

---

## 2. `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

---

## 3. Complete `index.css`

Drop this file as-is into `src/index.css`.

```css
@import "tailwindcss";

@import "@fontsource/space-grotesk/500.css";
@import "@fontsource/space-grotesk/600.css";
@import "@fontsource/space-grotesk/700.css";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";
@import "@fontsource/jetbrains-mono/400.css";
@import "@fontsource/jetbrains-mono/500.css";

/* ─── Design tokens ─────────────────────────────────────────────────────────── */

@theme {
  /* Colors */
  --color-paper:       #F7F4EF;   /* page background — warm off-white        */
  --color-paper-dim:   #EEE9E0;   /* subtle fill, hover bg                   */
  --color-paper-card:  #FDFBF8;   /* card surface — near white               */
  --color-ink:         #1A1A1E;   /* primary text / dark button              */
  --color-ink-soft:    #3D3D45;   /* secondary text                          */
  --color-ink-faint:   #8A8A94;   /* placeholder / muted text                */
  --color-line:        #E0DDD5;   /* border — medium                         */
  --color-line-soft:   #EAE6DD;   /* border — subtle dividers                */

  /* Accent colors */
  --color-amber:       #E8A33D;   /* primary accent — warm gold              */
  --color-amber-deep:  #C97F1F;   /* amber hover / dark variant              */
  --color-amber-soft:  #FDF4E4;   /* amber tinted bg                         */
  --color-teal:        #2B7A70;   /* success / secondary accent              */
  --color-teal-soft:   #E0F0EE;   /* teal tinted bg                          */
  --color-rust:        #C0432C;   /* danger / destructive                    */
  --color-rust-soft:   #FBEAE6;   /* rust tinted bg                          */
  --color-violet:      #6B52D0;   /* focus ring / interactive highlight      */
  --color-violet-soft: #EEE9FC;   /* violet tinted bg                        */

  /* Typography */
  --font-display: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-body:    "Inter",         ui-sans-serif, system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;

  /* Shadows */
  --shadow-card:       0 1px 3px rgba(26,26,30,0.06), 0 4px 12px rgba(26,26,30,0.04);
  --shadow-card-hover: 0 4px 16px rgba(26,26,30,0.10), 0 1px 4px rgba(26,26,30,0.06);
  --shadow-modal:      0 8px 40px rgba(26,26,30,0.18);
  --shadow-nav:        0 1px 0 rgba(26,26,30,0.06);
}

/* ─── Base styles ────────────────────────────────────────────────────────────── */

html {
  background-color: var(--color-paper);
  color: var(--color-ink);
  overflow-y: scroll;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:focus-visible {
  outline: 2px solid var(--color-violet);
  outline-offset: 2px;
}

::selection {
  background-color: var(--color-amber-soft);
  color: var(--color-ink);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ─── Keyframes ──────────────────────────────────────────────────────────────── */

@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes heartPop {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.45); }
  60%  { transform: scale(0.88); }
  100% { transform: scale(1); }
}

@keyframes pageEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Animation utility classes ──────────────────────────────────────────────── */

.animate-fade-slide-up { animation: fadeSlideUp 0.28s cubic-bezier(0.22, 1, 0.36, 1) both; }
.animate-fade-in       { animation: fadeIn      0.2s  ease-out                           both; }
.animate-page-enter    { animation: pageEnter   0.3s  cubic-bezier(0.22, 1, 0.36, 1) both; }
.animate-heart-pop     { animation: heartPop    0.38s cubic-bezier(0.22, 1, 0.36, 1) both; }

/* ─── Skeleton loader ────────────────────────────────────────────────────────── */

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-paper-dim)  25%,
    var(--color-line-soft)  50%,
    var(--color-paper-dim)  75%
  );
  background-size: 600px 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  border-radius: 8px;
}

/* ─── Component layer ────────────────────────────────────────────────────────── */

@layer components {
  /* Text input / textarea */
  .input {
    @apply w-full px-3.5 py-2.5 rounded-xl border border-line bg-paper-card text-sm font-body text-ink;
    @apply placeholder:text-ink-faint;
    @apply focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet/50;
    @apply transition-all duration-200;
  }

  /* Card surface */
  .vc-card {
    background:    var(--color-paper-card);
    border:        1px solid var(--color-line-soft);
    border-radius: 16px;
    box-shadow:    var(--shadow-card);
    transition:    box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                   transform  0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .vc-card:hover { box-shadow: var(--shadow-card-hover); }

  /* Tab buttons */
  .tab-btn          { @apply px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all duration-200; }
  .tab-btn-active   { @apply border-ink text-ink; }
  .tab-btn-inactive { @apply border-transparent text-ink-faint hover:text-ink-soft hover:border-line; }

  /* Section label (ALL CAPS micro-label) */
  .section-label { @apply text-[10px] font-mono text-ink-faint tracking-widest uppercase; }
}

/* ─── Glassmorphism nav / header ─────────────────────────────────────────────── */

.glass {
  background:              rgba(253, 251, 248, 0.85);
  backdrop-filter:         blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom:           1px solid rgba(224, 221, 213, 0.7);
}

/* ─── Scrollbar ──────────────────────────────────────────────────────────────── */

* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-line) transparent;
}
::-webkit-scrollbar       { width: 5px; }
::-webkit-scrollbar-thumb { background: var(--color-line); border-radius: 4px; }
```

---

## 4. Color Palette — Quick Reference

| Token | Hex | Use case |
|---|---|---|
| `paper` | `#F7F4EF` | Page background |
| `paper-dim` | `#EEE9E0` | Subtle fills, hover states |
| `paper-card` | `#FDFBF8` | Card / modal surface |
| `ink` | `#1A1A1E` | Primary text, dark buttons |
| `ink-soft` | `#3D3D45` | Secondary text |
| `ink-faint` | `#8A8A94` | Placeholders, muted labels |
| `line` | `#E0DDD5` | Borders (medium) |
| `line-soft` | `#EAE6DD` | Borders (subtle / dividers) |
| `amber` | `#E8A33D` | Primary accent / CTA |
| `amber-deep` | `#C97F1F` | Amber hover / dark |
| `amber-soft` | `#FDF4E4` | Amber tinted backgrounds |
| `teal` | `#2B7A70` | Success / secondary accent |
| `teal-soft` | `#E0F0EE` | Teal tinted backgrounds |
| `rust` | `#C0432C` | Danger / destructive |
| `rust-soft` | `#FBEAE6` | Rust tinted backgrounds |
| `violet` | `#6B52D0` | Focus rings / interactive |
| `violet-soft` | `#EEE9FC` | Violet tinted backgrounds |

---

## 5. Typography

| Role | Font | Tailwind class |
|---|---|---|
| Headings / UI labels | Space Grotesk | `font-display` |
| Body / paragraphs | Inter | `font-body` |
| Code / tags / badges | JetBrains Mono | `font-mono` |

**Common text combinations:**
```
font-display font-bold text-ink          → main headings
font-display font-semibold text-ink      → card titles, buttons
font-body text-sm text-ink-soft          → body copy, descriptions
font-mono text-xs text-ink-faint         → tags, badges, labels
text-[10px] font-mono tracking-widest uppercase text-ink-faint  → section labels
```

---

## 6. Button Component

```jsx
// src/components/ui/Button.jsx
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out disabled:opacity-40 disabled:cursor-not-allowed active:scale-95'

  const sizes = {
    xs: 'text-xs px-2.5 py-1',
    sm: 'text-sm px-3.5 py-1.5',
    md: 'text-sm px-4.5 py-2.5',
    lg: 'text-base px-6 py-3',
  }

  const variants = {
    primary:   'bg-ink text-paper hover:bg-ink-soft shadow-sm',
    accent:    'bg-amber text-ink hover:bg-amber-deep shadow-sm',
    secondary: 'bg-paper-dim text-ink-soft border border-line hover:bg-paper-card hover:text-ink hover:border-ink/20',
    ghost:     'bg-transparent text-ink-soft hover:text-ink hover:bg-paper-dim',
    danger:    'bg-rust text-paper hover:opacity-90 shadow-sm',
    violet:    'bg-violet text-white hover:opacity-90 shadow-sm',
    teal:      'bg-teal text-white hover:opacity-90 shadow-sm',
  }

  return (
    <button
      disabled={disabled}
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

**Usage:**
```jsx
<Button variant="primary">Save</Button>
<Button variant="accent" size="lg">Join Event</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost">Skip</Button>
<Button variant="violet">RSVP</Button>
<Button variant="teal">Confirm</Button>
```

---

## 7. Badge / Pill Component

```jsx
// src/components/ui/Badge.jsx
export function Badge({ children, color = 'default' }) {
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
```

**Usage:**
```jsx
<Badge color="teal">Live</Badge>
<Badge color="amber">Upcoming</Badge>
<Badge color="rust">Cancelled</Badge>
<Badge color="violet">Featured</Badge>
<Badge>Default</Badge>
```

---

## 8. Card

```jsx
// Use the .vc-card CSS class directly, or wrap it:
export function Card({ children, className = '' }) {
  return <div className={`vc-card ${className}`}>{children}</div>
}
```

**Typical card layout:**
```jsx
<div className="vc-card p-4 sm:p-5">
  <h2 className="font-display font-semibold text-ink">Title</h2>
  <p className="text-sm text-ink-soft mt-1">Description text here.</p>
</div>
```

---

## 9. Input / Form fields

```jsx
// Just use the .input CSS class — it's defined in index.css
<input className="input" placeholder="Search events…" />
<textarea className="input resize-none" rows={3} placeholder="Write a description…" />
```

**Select dropdown:**
```jsx
<select className="input">
  <option>Option A</option>
  <option>Option B</option>
</select>
```

---

## 10. Modal overlay pattern

```jsx
<div
  className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
  onClick={(e) => e.target === e.currentTarget && onClose()}
>
  <div className="bg-paper-card rounded-2xl shadow-modal w-full max-w-md overflow-hidden animate-fade-slide-up">
    {/* Header */}
    <div className="px-5 py-4 border-b border-line flex items-center justify-between">
      <h2 className="font-display font-bold text-base text-ink">Modal Title</h2>
      <button
        onClick={onClose}
        className="w-7 h-7 rounded-lg bg-paper-dim hover:bg-line flex items-center justify-center transition-colors active:scale-95"
      >
        <span className="text-ink-soft text-sm">✕</span>
      </button>
    </div>

    {/* Body */}
    <div className="px-5 py-4 space-y-4">
      {/* content */}
    </div>

    {/* Footer */}
    <div className="px-5 pb-5 flex gap-2">
      <button className="flex-1 py-2.5 rounded-xl border border-line text-sm font-medium text-ink hover:bg-paper-dim transition-all duration-150 active:scale-95">
        Cancel
      </button>
      <button className="flex-1 py-2.5 rounded-xl bg-ink text-paper text-sm font-semibold hover:bg-ink-soft transition-all duration-150 active:scale-95">
        Confirm
      </button>
    </div>
  </div>
</div>
```

---

## 11. Glassmorphism Navbar

```jsx
<nav className="glass sticky top-0 z-40 h-14 px-4 flex items-center justify-between">
  <span className="font-display font-bold text-ink">EventFlow</span>
  {/* nav links */}
</nav>
```

---

## 12. Skeleton loader

```jsx
// Use the .skeleton CSS class:
<div className="skeleton rounded-lg" style={{ height: 14, width: 120 }} />
<div className="skeleton rounded-full" style={{ width: 40, height: 40 }} />
<div className="skeleton rounded-xl" style={{ height: 32, width: '100%' }} />
```

---

## 13. Spinner

```jsx
export function Spinner({ size = 20, color = 'text-ink-faint' }) {
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
```

---

## 14. Avatar (with fallback initial)

```jsx
export function Avatar({ url, name, size = 40 }) {
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
```

---

## 15. Empty State

```jsx
export function EmptyState({ title, description, action }) {
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
```

---

## 16. Tab bar pattern

```jsx
<div className="flex border-b border-line-soft">
  {['All', 'Upcoming', 'Past'].map((tab) => (
    <button
      key={tab}
      onClick={() => setActive(tab)}
      className={`tab-btn ${active === tab ? 'tab-btn-active' : 'tab-btn-inactive'}`}
    >
      {tab}
    </button>
  ))}
</div>
```

---

## 17. Section label

```jsx
<p className="section-label mb-2">Upcoming Events</p>
// renders as: small, all-caps, tracked, muted monospace label
```

---

## 18. Page wrapper (animate on enter)

```jsx
<main className="animate-page-enter max-w-2xl mx-auto px-4 py-6">
  {/* page content */}
</main>
```

---

## 19. Common Tailwind utility combos used throughout

```
/* Card padding */
p-4 sm:p-5

/* Rounded corners */
rounded-xl   → buttons, inputs, small elements
rounded-2xl  → modals, cards
rounded-full → pills, avatars, badges

/* Gap / spacing */
gap-2, gap-3, space-y-3, space-y-4

/* Divider */
<div className="border-t border-line-soft" />

/* Overlay backdrop */
bg-ink/40 backdrop-blur-sm

/* Transition defaults */
transition-all duration-200 ease-out
transition-colors
active:scale-95          ← all interactive elements use this
```

---

## 20. `.vscode/settings.json` (suppress Tailwind v4 warnings)

```json
{
  "css.lint.unknownAtRules": "ignore"
}
```
