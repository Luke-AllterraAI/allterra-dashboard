import { useQuery } from '@tanstack/react-query'
import { startOfMonth, format, eachDayOfInterval } from 'date-fns'

async function fetchCompanies() {
  const res = await fetch('/api/companies')
  if (!res.ok) throw new Error('Failed to fetch clients')
  return res.json()
}

async function fetchOpportunities({ companyId, startDate }) {
  const params = new URLSearchParams({ companyId, startDate })
  const res = await fetch(`/api/opportunities?${params}`)
  if (!res.ok) throw new Error('Failed to fetch leads')
  return res.json()
}

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
  })
}

const STAGE_LABELS = {
  NEW:            'New',
  CONTACTED:      'New',
  MEETING_BOOKED: 'Booked',
  QUOTE_SENT:     'Quoted',
  CLOSED_WON:     'Won',
  CLOSED_LOST:    'Lost',
}

export function useDashboard(companyId, avgJobValue = 2500) {
  const start = startOfMonth(new Date()).toISOString()

  const { data: opportunities = [], isLoading, error } = useQuery({
    queryKey: ['opportunities', companyId, start],
    queryFn: () => fetchOpportunities({ companyId, startDate: start }),
    enabled: !!companyId,
  })

  const totalLeads = opportunities.length

  const leadsByStage = ['NEW', 'CONTACTED', 'MEETING_BOOKED', 'QUOTE_SENT', 'CLOSED_WON', 'CLOSED_LOST']
    .reduce((acc, stage) => {
      acc[stage] = opportunities.filter(o => o.stage === stage).length
      return acc
    }, {})

  const estimatedRevenue = totalLeads * avgJobValue

  const today = new Date()
  const days = eachDayOfInterval({ start: startOfMonth(today), end: today })
  const callsPerDay = days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const calls = opportunities.filter(o =>
      format(new Date(o.createdAt), 'yyyy-MM-dd') === dateStr
    ).length
    return { date: format(day, 'MMM d'), calls }
  })

  const leads = opportunities.map(o => ({
    id: o.id,
    name: [o.pointOfContact?.name?.firstName, o.pointOfContact?.name?.lastName]
      .filter(Boolean).join(' ') || o.name || 'Unknown',
    phone: o.pointOfContact?.phones?.primaryPhoneNumber || '—',
    jobDescription: o.name || '—',
    stage: o.stage,
    stageLabel: STAGE_LABELS[o.stage] || o.stage,
    createdAt: o.createdAt,
  }))

  return { isLoading, error, totalLeads, leadsByStage, estimatedRevenue, callsPerDay, leads }
}
