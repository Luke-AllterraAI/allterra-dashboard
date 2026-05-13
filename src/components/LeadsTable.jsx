import { format } from 'date-fns'
import StatusBadge from './StatusBadge'

export default function LeadsTable({ leads }) {
  if (!leads.length) {
    return (
      <div className="bg-[#0d1f35] border border-[#1e3a5f] rounded-xl p-16 text-center">
        <p className="text-slate-400">No leads found for this month.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#0d1f35] border border-[#1e3a5f] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#1e3a5f] flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">All Leads</h3>
          <p className="text-slate-400 text-xs mt-0.5">{leads.length} lead{leads.length !== 1 ? 's' : ''} this month</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e3a5f]">
              {['Name', 'Phone', 'Job Description', 'Status', 'Date'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-[#1e3a5f]/50 hover:bg-[#122545]/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-medium">{lead.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300 font-mono text-xs">{lead.phone}</td>
                <td className="px-6 py-4 text-slate-300 max-w-[240px]">
                  <span className="truncate block">{lead.jobDescription}</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge stage={lead.stage} />
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {format(new Date(lead.createdAt), 'dd MMM yyyy')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
