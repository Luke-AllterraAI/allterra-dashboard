const CONFIG = {
  NEW:            { label: 'New',    cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  CONTACTED:      { label: 'New',    cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  MEETING_BOOKED: { label: 'Booked', cls: 'bg-violet-500/15 text-violet-400 border-violet-500/25' },
  QUOTE_SENT:     { label: 'Quoted', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  CLOSED_WON:     { label: 'Won',    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  CLOSED_LOST:    { label: 'Lost',   cls: 'bg-red-500/15 text-red-400 border-red-500/25' },
}

export default function StatusBadge({ stage }) {
  const { label, cls } = CONFIG[stage] ?? { label: stage, cls: 'bg-slate-500/15 text-slate-400 border-slate-500/25' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  )
}
