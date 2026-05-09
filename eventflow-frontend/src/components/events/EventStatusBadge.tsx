import type { EventStatus } from '@/types'

const CONFIG: Record<EventStatus, { label: string; dot: string }> = {
  draft:      { label: 'Draft',      dot: '#9896b0' },
  published:  { label: 'Live',       dot: '#16a34a' },
  closed:     { label: 'Closed',     dot: '#d97706' },
  completed:  { label: 'Completed',  dot: '#2563eb' },
}

export default function EventStatusBadge({ status }: { status: EventStatus }) {
  const { label, dot } = CONFIG[status] ?? CONFIG.draft
  return (
    <span className={`badge badge-${status}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block' }} />
      {label}
    </span>
  )
}
