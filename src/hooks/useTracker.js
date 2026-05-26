import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const REFRESH_INTERVAL = 30_000  // refetch every 30s

/** Distinct list of tenants (clients) that have any analytics events. */
export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics')
        .select('tenant')
        .limit(1000)
      if (error) throw error
      const set = new Set((data || []).map(r => r.tenant).filter(Boolean))
      return Array.from(set).sort()
    },
    staleTime: 60_000,
  })
}

/** All tracker stats for a given tenant over the last N days. */
export function useTrackerStats(tenant, days = 30) {
  return useQuery({
    queryKey: ['tracker-stats', tenant, days],
    enabled: !!tenant,
    refetchInterval: REFRESH_INTERVAL,
    queryFn: async () => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

      // Events for this tenant within the period
      const { data: events, error: eventsErr } = await supabase
        .from('analytics')
        .select('event_type, metadata, created_at')
        .eq('tenant', tenant)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(5000)

      if (eventsErr) throw eventsErr

      // Jobs for this tenant within the period
      const { data: jobs, error: jobsErr } = await supabase
        .from('jobs')
        .select('*')
        .eq('tenant', tenant)
        .gte('captured_at', since)
        .order('captured_at', { ascending: false })
        .limit(1000)

      if (jobsErr) throw jobsErr

      // Aggregate event counts
      const counts = {}
      for (const ev of events || []) {
        counts[ev.event_type] = (counts[ev.event_type] || 0) + 1
      }

      // Recent timeline (latest 30 events)
      const timeline = (events || []).slice(0, 30).map(ev => ({
        type: ev.event_type,
        time: ev.created_at,
        metadata: ev.metadata || {},
      }))

      return {
        counts: {
          callsAnswered: counts.call_answered || 0,
          jobsCaptured: counts.job_captured || 0,
          emergencies: counts.emergency_escalated || 0,
          // WhatsApp Handled = missed calls picked up + bot replies in active conversations
          whatsappReceived: (counts.whatsapp_missed_call || 0) + (counts.whatsapp_lead_engaged || 0),
          whatsappMissedCalls: counts.whatsapp_missed_call || 0,
          whatsappEngaged: counts.whatsapp_lead_engaged || 0,
          reviewsRequested: counts.review_requested || 0,
          reviewsReceived: counts.review_received || 0,
          campaignsSent: counts.campaign_sent || 0,
        },
        jobs: jobs || [],
        timeline,
        totalEvents: (events || []).length,
      }
    },
  })
}
