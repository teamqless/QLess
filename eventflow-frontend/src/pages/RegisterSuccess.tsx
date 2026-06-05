import { Link } from 'react-router-dom'

export default function RegisterSuccess() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 relative overflow-hidden">
      
      {/* Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-10 md:p-12 w-full max-w-[480px] text-center shadow-glass relative z-10">
        
        {/* Animated checkmark */}
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-200 to-green-300 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_0_8px_rgba(240,253,244,1)] text-4xl text-green-700 animate-[bounce_0.5s_ease-out]">
          ✓
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-3">
          Registration submitted!
        </h1>

        <p className="text-base text-slate-500 leading-relaxed mb-8">
          Your registration is in. Once the organizer reviews your details
          and verifies your payment, you'll receive your{' '}
          <strong className="text-slate-900 font-bold">QR entry pass via email</strong>.
        </p>

        <div className="bg-slate-100/50 backdrop-blur-md border border-slate-200 rounded-2xl p-5 mb-8 text-left space-y-3">
          {[
            { icon: '📧', text: 'Check your inbox for a confirmation' },
            { icon: '📂', text: 'Also check your spam/promotions folder' },
            { icon: '📱', text: 'Screenshot or save your QR when it arrives' },
          ].map(tip => (
            <div key={tip.text} className="flex gap-3 text-[14px] text-slate-600 leading-snug items-start">
              <span className="text-lg leading-none">{tip.icon}</span> 
              <span>{tip.text}</span>
            </div>
          ))}
        </div>

        <Link to="/" className="inline-block px-6 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded-xl no-underline text-[15px] font-bold transition-colors">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
