const COLOR = {
  blue:   { bg: 'bg-blue-500/10',    icon: 'text-blue-400' },
  purple: { bg: 'bg-violet-500/10',  icon: 'text-violet-400' },
  green:  { bg: 'bg-emerald-500/10', icon: 'text-emerald-400' },
  yellow: { bg: 'bg-amber-500/10',   icon: 'text-amber-400' },
}

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  const c = COLOR[color] ?? COLOR.blue
  return (
    <div className="bg-[#0d1f35] border border-[#1e3a5f] rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-1 truncate">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`${c.bg} p-3 rounded-xl shrink-0`}>
            <Icon size={22} className={c.icon} />
          </div>
        )}
      </div>
    </div>
  )
}
