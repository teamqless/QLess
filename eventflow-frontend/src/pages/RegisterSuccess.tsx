// ============================================================
// pages/RegisterSuccess.tsx — PHASE 3
// Shown after successful registration at /register/:slug/success
// ============================================================

export default function RegisterSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✓</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">You're registered!</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Your registration has been submitted successfully.
          Once the organizer reviews your details, you'll receive your
          <strong> QR entry pass via email</strong>.
        </p>
        <p className="text-gray-400 text-xs mt-4">
          Check your inbox (and spam folder) for the confirmation email.
        </p>
      </div>
    </div>
  )
}
