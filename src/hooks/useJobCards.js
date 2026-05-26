import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useJobCards(tenant) {
  return useQuery({
    queryKey: ['job-cards', tenant],
    enabled: !!tenant,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_cards')
        .select('*')
        .eq('tenant', tenant)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })
}

export function useCreateJobCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (card) => {
      const { data, error } = await supabase
        .from('job_cards')
        .insert([card])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['job-cards', vars.tenant] }),
  })
}

export function useUpdateJobCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, tenant, ...updates }) => {
      const { data, error } = await supabase
        .from('job_cards')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => qc.invalidateQueries({ queryKey: ['job-cards', data.tenant] }),
  })
}
