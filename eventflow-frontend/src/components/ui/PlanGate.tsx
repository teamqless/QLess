import { Link } from 'react-router-dom'

interface PlanGateProps {
  feature:  string
  message?: string
}

export default function PlanGate({ feature, message }: PlanGateProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-purple-500/30 rounded-2xl p-8 sm:p-10 text-center max-w-lg mx-auto my-10 shadow-lg backdrop-blur-sm">
      <div className="text-4xl mb-4">🔒</div>
      <h3 className="text-xl font-bold text-purple-300 mb-3 tracking-tight">
        {feature} is a Pro feature
      </h3>
      <p className="text-sm text-purple-200/80 leading-relaxed mb-8">
        {message || 'Upgrade to Club Pro to unlock this feature and run unlimited events with no attendee caps.'}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/pricing" className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl no-underline text-sm font-semibold shadow-lg shadow-purple-600/30 transition-all hover:-translate-y-0.5">
          View plans →
        </Link>
        <Link to="/settings" className="px-6 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-xl no-underline text-sm font-medium border border-purple-500/30 transition-all">
          Settings
        </Link>
      </div>
    </div>
  )
}
