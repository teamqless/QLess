// ============================================================
// pages/Landing.tsx — PHASE 2
// Public marketing page shown at /
// ============================================================

export default function Landing() {
  // TODO Phase 2: Build landing page
  // Should include:
  // - Hero section with headline + CTA buttons (Get Started Free, Login)
  // - Feature highlights: Registration forms, QR delivery, Gate scanner
  // - Pricing tiers: Free | Club Pro ₹499/event | Institution ₹4999/yr
  // - How it works: 3-step visual (Create event → Attendees register → Scan at gate)
  // - Footer with contact

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-indigo-600">EventFlow</h1>
        <p className="mt-4 text-gray-500">Landing page — build in Phase 2</p>
        <div className="mt-8 flex gap-4 justify-center">
          <a href="/signup" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
            Get Started Free
          </a>
          <a href="/login" className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50">
            Login
          </a>
        </div>
      </div>
    </div>
  )
}
