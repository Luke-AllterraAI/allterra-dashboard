import { useState } from 'react'
import { format } from 'date-fns'
import { MapPin, Phone, Wrench, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useQuery, useMutation } from '@tanstack/react-query'

const INK   = '#0f1a14'
const GREEN = '#1a6b4a'
const GOLD  = '#c9813a'
const SOFT  = '#5a6360'
const RED   = '#b03a2e'

const STATUS_META = {
  open:        { label: 'Open',        bg: '#e6eef8', color: '#1a3d6b' },
  quoted:      { label: 'Quoted',      bg: '#fdf3e7', color: GOLD },
  in_progress: { label: 'In Progress', bg: '#e6f4ee', color: GREEN },
  completed:   { label: 'Completed',   bg: '#e6f4ee', color: GREEN },
}

const PRIORITY_META = {
  normal:    { label: 'Standard',   color: SOFT,  icon: null },
  high:      { label: 'High',       color: GOLD,  icon: '⚠️' },
  emergency: { label: 'EMERGENCY',  color: RED,   icon: '🚨' },
}

function useJobCard(id) {
  return useQuery({
    queryKey: ['job-card', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_cards')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
  })
}

export default function JobCardView({ id }) {
  const { data: card, isLoading, error, refetch } = useJobCard(id)
  const [completedBy, setCompletedBy]   = useState('')
  const [completionNotes, setNotes]     = useState('')
  const [submitted, setSubmitted]       = useState(false)

  const signOff = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('job_cards')
        .update({
          status:            'completed',
          completion_notes:  completionNotes,
          completed_by:      completedBy,
          completed_at:      new Date().toISOString(),
          updated_at:        new Date().toISOString(),
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      setSubmitted(true)
      refetch()
    },
  })

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f1eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} style={{ color: GREEN, animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f1eb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <AlertTriangle size={32} style={{ color: RED, marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>Job card not found</div>
          <div style={{ fontSize: 13, color: SOFT, marginTop: 6 }}>This link may have expired or the card has been removed.</div>
        </div>
      </div>
    )
  }

  const sm  = STATUS_META[card.status]   || STATUS_META.open
  const pm  = PRIORITY_META[card.priority] || PRIORITY_META.normal
  const isCompleted = card.status === 'completed'

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f4f1eb', minHeight: '100vh', color: INK }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: INK, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7edba8', marginBottom: 2 }}>
          ALLTERRA AI · JOB CARD
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{card.tenant}</div>
      </div>

      <div style={{ padding: '20px 20px 40px', maxWidth: 480, margin: '0 auto' }}>

        {/* Priority banner for emergencies */}
        {card.priority === 'emergency' && (
          <div style={{ background: RED, color: '#fff', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            🚨 EMERGENCY JOB — Respond immediately
          </div>
        )}
        {card.priority === 'high' && (
          <div style={{ background: '#fdf3e7', border: `1px solid ${GOLD}`, color: GOLD, borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontWeight: 700, fontSize: 13 }}>
            ⚠️ HIGH PRIORITY
          </div>
        )}

        {/* Main card */}
        <div style={{ background: '#fff', border: '1px solid #d8d3c8', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>

          {/* Address — primary identifier */}
          <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #f0ede7' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SOFT, marginBottom: 6 }}>
              PROPERTY ADDRESS
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <MapPin size={20} style={{ color: GREEN, marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 20, fontWeight: 800, color: INK, lineHeight: 1.3 }}>
                {card.address}
              </div>
            </div>
          </div>

          {/* Contact */}
          {(card.contact_name || card.contact_phone) && (
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #f0ede7' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SOFT, marginBottom: 6 }}>
                CONTACT
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={15} style={{ color: SOFT }} />
                <div>
                  {card.contact_name && <div style={{ fontSize: 14, fontWeight: 600 }}>{card.contact_name}</div>}
                  {card.contact_phone && (
                    <a href={`tel:${card.contact_phone}`} style={{ fontSize: 13, color: GREEN, fontWeight: 600, textDecoration: 'none' }}>
                      {card.contact_phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Job description */}
          {card.description && (
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #f0ede7' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SOFT, marginBottom: 6 }}>
                JOB DESCRIPTION
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Wrench size={15} style={{ color: SOFT, marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{card.description}</div>
              </div>
            </div>
          )}

          {/* Notes */}
          {card.notes && (
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #f0ede7' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SOFT, marginBottom: 6 }}>
                NOTES
              </div>
              <div style={{ fontSize: 13, color: SOFT, lineHeight: 1.5 }}>{card.notes}</div>
            </div>
          )}

          {/* Status + date */}
          <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 4, background: sm.bg, color: sm.color }}>
              {sm.label}
            </span>
            <span style={{ fontSize: 11, color: SOFT }}>
              {format(new Date(card.created_at), 'dd MMM yyyy')}
            </span>
          </div>
        </div>

        {/* Completion details (if already done) */}
        {isCompleted && card.completed_at && (
          <div style={{ background: '#e6f4ee', border: `1px solid #a8d5bc`, borderRadius: 8, padding: 18, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <CheckCircle size={18} style={{ color: GREEN }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>
                Completed {format(new Date(card.completed_at), 'dd MMM yyyy HH:mm')}
                {card.completed_by ? ` by ${card.completed_by}` : ''}
              </div>
            </div>
            {card.completion_notes && (
              <div style={{ fontSize: 13, color: INK, lineHeight: 1.5 }}>
                <strong>Work done:</strong> {card.completion_notes}
              </div>
            )}
          </div>
        )}

        {/* Sign-off form — only show if not yet completed */}
        {!isCompleted && !submitted && (
          <div style={{ background: '#fff', border: '1px solid #d8d3c8', borderRadius: 8, padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: GREEN, marginBottom: 14 }}>
              SIGN OFF
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: SOFT, display: 'block', marginBottom: 4 }}>
                YOUR NAME
              </label>
              <input
                value={completedBy}
                onChange={e => setCompletedBy(e.target.value)}
                placeholder="Plumber / technician name"
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                  border: '1.5px solid #d8d3c8', borderRadius: 6, fontSize: 14,
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: SOFT, display: 'block', marginBottom: 4 }}>
                WORK COMPLETED
              </label>
              <textarea
                value={completionNotes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Describe what was done, parts used, etc."
                rows={4}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                  border: '1.5px solid #d8d3c8', borderRadius: 6, fontSize: 14,
                  fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5,
                }}
              />
            </div>

            {signOff.isError && (
              <div style={{ fontSize: 12, color: RED, marginBottom: 10 }}>
                Failed to save — please try again.
              </div>
            )}

            <button
              onClick={() => signOff.mutate()}
              disabled={signOff.isPending || !completedBy.trim()}
              style={{
                width: '100%', padding: '14px', fontSize: 15, fontWeight: 800,
                border: 'none', borderRadius: 6, cursor: completedBy.trim() ? 'pointer' : 'default',
                background: completedBy.trim() ? GREEN : '#ccc',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {signOff.isPending
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                : <><CheckCircle size={16} /> Mark as Complete</>
              }
            </button>
            <div style={{ fontSize: 11, color: SOFT, textAlign: 'center', marginTop: 8 }}>
              Your name is required to sign off
            </div>
          </div>
        )}

        {/* Success state */}
        {submitted && (
          <div style={{ background: '#e6f4ee', border: `1px solid #a8d5bc`, borderRadius: 8, padding: 24, textAlign: 'center' }}>
            <CheckCircle size={32} style={{ color: GREEN, marginBottom: 10 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: GREEN }}>Job signed off!</div>
            <div style={{ fontSize: 13, color: SOFT, marginTop: 6 }}>The office has been notified.</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: SOFT }}>
          Allterra AI · allterra.co.za
        </div>
      </div>
    </div>
  )
}
