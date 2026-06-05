import type { EventStatus } from '@/types'

const CONFIG: Record<EventStatus, { label: string; dotClass: string }> = {
  draft:      { label: 'Draft',      dotClass: 'bg-gray-400' },
  published:  { label: 'Live',       dotClass: 'bg-green-500' },
  closed:     { label: 'Closed',     dotClass: 'bg-amber-500' },
  completed:  { label: 'Completed',  dotClass: 'bg-blue-500' },
}

export default function EventStatusBadge({ status }: { status: EventStatus }) {
  const { label, dotClass } = CONFIG[status] ?? CONFIG.draft
  return (
    <span className={`badge badge-${status} flex items-center gap-1.5 shrink-0`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} inline-block shadow-sm`} />
      {label}
    </span>
  )
}
