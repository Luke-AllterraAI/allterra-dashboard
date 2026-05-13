import { useState, useMemo } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Phone, Wrench, MessageCircle, AlertTriangle,
  Star, Megaphone, Loader2, ChevronDown, Download,
} from 'lucide-react'
import { useTenants, useTrackerStats } from '../hooks/useTracker'

const INK = '#0f1a14'
const GREEN = '#1a6b4a'
const GOLD = '#c9813a'
const SOFT = '#5a6360'
const MONTHLY_COST = 8500

const EVENT_META = {
  call_answered:             { icon: Phone,         color: GREEN,     label: 'After-hours call answered' },
  job_captured:              { icon: Wrench,        color: GREEN,     label: 'Job captured' },
  emergency_escalated:       { icon: AlertTriangle, color: '#b03a2e', label: 'EMERGENCY — escalated to owner' },
  whatsapp_message_received: { icon: MessageCircle, color: '#1a3d6b', label: 'WhatsApp message received' },
  whatsapp_missed_call:      { icon: Phone,         color: GOLD,      label: 'WhatsApp call missed' },
  review_requested:          { icon: Star,          color: GOLD,      label: 'Review request sent' },
  review_received:           { icon: Star,          color: GREEN,     label: 'Google review received' },
  campaign_sent:             { icon: Megaphone,     color: '#1a3d6b', label: 'Campaign message sent' },
}

export default function Tracker() {
  const [tenant, setTenant] = useState(null)
  const [days, setDays] = useState(30)
  const [jobValue, setJobValue] = useState(3000)
  const [tab, setTab] = useState('overview')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const { data: tenants = [], isLoading: tenantsLoading } = useTenants()
  const { data, isLoading, error } = useTrackerStats(tenant, days)

  // Auto-select first tenant once loaded
  if (!tenant && tenants.length > 0) {
    setTenant(tenants[0])
  }

  const stats = data?.counts || {
    callsAnswered: 0, jobsCaptured: 0, emergencies: 0,
    whatsappReceived: 0, whatsappMissedCalls: 0,
    reviewsRequested: 0, reviewsReceived: 0, campaignsSent: 0,
  }

  const revenueRecovered = stats.jobsCaptured * jobValue
  const totalValue = revenueRecovered  // + campaignRevenue when campaigns ship
  const roi = useMemo(
    () => MONTHLY_COST > 0 ? Math.round((totalValue / MONTHLY_COST) * 10) / 10 : 0,
    [totalValue]
  )

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'IBM Plex Sans', system-ui, sans-serif", background: '#f4f1eb', minHeight: '100vh', color: INK }}
    >

      {/* ── Header ── */}
      <div style={{ background: INK, padding: '20px 28px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7edba8', marginBottom: 4 }}>
              ALLTERRA AI · TRACKER
            </div>

            {/* Tenant dropdown */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 22, fontWeight: 700, color: '#fff', padding: 0,
                }}
              >
                {tenantsLoading ? 'Loading…' : (tenant || 'Select Client')}
                <ChevronDown size={18} style={{ color: '#aecfbe' }} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 50,
                  background: '#fff', borderRadius: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  minWidth: 220, overflow: 'hidden',
                }}>
                  {tenants.length === 0 ? (
                    <div style={{ padding: 14, fontSize: 12, color: SOFT }}>No data yet</div>
                  ) : tenants.map(t => (
                    <button
                      key={t}
                      onClick={() => { setTenant(t); setDropdownOpen(false) }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 14px', fontSize: 13, border: 'none',
                        background: tenant === t ? '#f9f8f4' : '#fff',
                        color: INK, cursor: 'pointer', fontWeight: tenant === t ? 700 : 500,
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ fontSize: 12, color: '#aecfbe', marginTop: 4 }}>
              Last {days} days · {format(new Date(), 'MMMM yyyy')}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#aecfbe', marginBottom: 4 }}>TOTAL VALUE GENERATED</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#7edba8' }}>R{totalValue.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: GOLD, fontWeight: 600 }}>
              {roi}× return on R{MONTHLY_COST.toLocaleString()}/mo
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginTop: 20 }}>
          {['overview', 'jobs', 'timeline'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 18px', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: '4px 4px 0 0',
                background: tab === t ? '#f4f1eb' : 'transparent',
                color: tab === t ? INK : '#aecfbe',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 28px' }}>

        {/* Loading / Error */}
        {(isLoading || tenantsLoading) && (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Loader2 size={28} style={{ color: GREEN, animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div style={{ background: '#fdf0f0', border: '1px solid #f5b1ab', borderRadius: 6, padding: 16, color: '#7f1d1d' }}>
            Failed to load tracker data: {error.message}
          </div>
        )}

        {!isLoading && !error && tenant && (
          <>
            {/* ── OVERVIEW TAB ── */}
            {tab === 'overview' && (
              <>
                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 20 }}>
                  <StatCard icon={Phone}         value={stats.callsAnswered}        label="Calls Answered"       sub="After hours & overflow" />
                  <StatCard icon={Wrench}        value={stats.jobsCaptured}         label="Jobs Captured"        sub="Would have been missed" />
                  <StatCard icon={MessageCircle} value={stats.whatsappReceived}     label="WhatsApp Handled"     sub="Messages processed" />
                  <StatCard icon={AlertTriangle} value={stats.emergencies}          label="Emergencies"          sub="Escalated instantly" />
                  <StatCard icon={Megaphone}     value={stats.campaignsSent}        label="Campaigns Sent"       sub="To existing clients" />
                  <StatCard icon={Star}          value={stats.reviewsRequested}     label="Reviews Requested"    sub={`${stats.reviewsReceived} received`} />
                </div>

                {/* Revenue + ROI */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>

                  {/* Revenue calculator */}
                  <div style={{ background: '#fff', border: '1px solid #d8d3c8', borderRadius: 6, padding: 18 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: GREEN, marginBottom: 12 }}>
                      AFTER-HOURS REVENUE RECOVERED
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 12, color: SOFT }}>Avg job value: R</span>
                      <input
                        type="number"
                        value={jobValue}
                        onChange={e => setJobValue(Number(e.target.value) || 0)}
                        style={{ width: 100, padding: '4px 8px', border: '1.5px solid #d8d3c8', borderRadius: 4, fontSize: 13, fontWeight: 700 }}
                      />
                    </div>
                    <Row label="Jobs captured" value={stats.jobsCaptured} />
                    <Row label="× Average job value" value={`R${jobValue.toLocaleString()}`} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>Revenue recovered</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: GREEN }}>R{revenueRecovered.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* ROI */}
                  <div style={{ background: INK, borderRadius: 6, padding: 18 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7edba8', marginBottom: 14 }}>
                      RETURN ON INVESTMENT
                    </div>
                    <DarkRow label="Revenue recovered" value={`R${revenueRecovered.toLocaleString()}`} highlight />
                    <DarkRow label="Campaign revenue" value="R0" sub="(coming soon)" />
                    <DarkRow label="Monthly cost of Allterra AI" value={`R${MONTHLY_COST.toLocaleString()}`} />
                    <div style={{ marginTop: 14, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#aecfbe', marginBottom: 4 }}>Total ROI this period</div>
                      <div style={{ fontSize: 42, fontWeight: 900, color: GOLD, lineHeight: 1 }}>{roi}×</div>
                      <div style={{ fontSize: 11, color: GOLD, marginTop: 2 }}>return on investment</div>
                    </div>
                  </div>
                </div>

                {/* Feedback (placeholder until post-job review module ships) */}
                <div style={{ background: '#fff', border: '1px solid #d8d3c8', borderRadius: 6, padding: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: GREEN, marginBottom: 12 }}>
                    CLIENT FEEDBACK & REVIEWS
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    <FeedbackCard label="Happy Clients"          value={0} color={GREEN}      bg="#e6f4ee" />
                    <FeedbackCard label="Unhappy (Resolved)"     value={0} color="#b03a2e"   bg="#fdf0f0" />
                    <FeedbackCard label="Review Requests Sent"   value={stats.reviewsRequested} color={GOLD}    bg="#fdf3e7" />
                    <FeedbackCard label="Google Reviews"         value={stats.reviewsReceived}  color="#1a3d6b" bg="#e6eef8" />
                  </div>
                  <div style={{ fontSize: 11, color: SOFT, marginTop: 12, textAlign: 'center' }}>
                    Post-job review automation activates with ServCraft completion webhook
                  </div>
                </div>
              </>
            )}

            {/* ── JOBS TAB ── */}
            {tab === 'jobs' && (
              <div style={{ background: '#fff', border: '1px solid #d8d3c8', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0ede7' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: GREEN }}>
                    JOBS CAPTURED ({data?.jobs?.length || 0})
                  </div>
                </div>
                {data?.jobs?.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: SOFT, fontSize: 13 }}>
                    No jobs captured yet for this period.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9f8f4' }}>
                        {['Name', 'Phone', 'Address', 'Description', 'Priority', 'Captured'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: SOFT, textAlign: 'left', borderBottom: '1px solid #d8d3c8' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.jobs || []).map(j => (
                        <tr key={j.id} style={{ borderBottom: '1px solid #f0ede7' }}>
                          <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>{j.client_name || '—'}</td>
                          <td style={{ padding: '10px 14px', fontSize: 12, color: SOFT, fontFamily: 'monospace' }}>{j.phone || '—'}</td>
                          <td style={{ padding: '10px 14px', fontSize: 12 }}>{j.address || '—'}</td>
                          <td style={{ padding: '10px 14px', fontSize: 12, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.description || '—'}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 3,
                              background: j.priority === 'high' ? '#fdf0f0' : '#e6f4ee',
                              color:      j.priority === 'high' ? '#b03a2e' : GREEN,
                            }}>
                              {(j.priority || 'normal').toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: 11, color: SOFT }}>
                            {format(new Date(j.captured_at), 'dd MMM HH:mm')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ── TIMELINE TAB ── */}
            {tab === 'timeline' && (
              <div style={{ background: '#fff', border: '1px solid #d8d3c8', borderRadius: 6, padding: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: GREEN, marginBottom: 16 }}>
                  ACTIVITY TIMELINE
                </div>
                {(data?.timeline?.length || 0) === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: SOFT, fontSize: 13 }}>
                    No activity yet for this period.
                  </div>
                ) : (data?.timeline || []).map((item, i) => {
                  const meta = EVENT_META[item.type] || { icon: MessageCircle, color: SOFT, label: item.type }
                  const Icon = meta.icon
                  const detail = item.metadata?.caller_name
                    || item.metadata?.from
                    || item.metadata?.body_preview
                    || ''
                  return (
                    <div key={i} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: '1px solid #f0ede7', alignItems: 'flex-start' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: meta.color + '18',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={16} style={{ color: meta.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: INK, lineHeight: 1.4 }}>
                          {meta.label}{detail ? ` — ${detail}` : ''}
                        </div>
                        <div style={{ fontSize: 11, color: SOFT, marginTop: 3 }}>
                          {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #d8d3c8' }}>
          <span style={{ fontSize: 11, color: SOFT }}>Allterra AI · allterra.ai</span>
          <span style={{ fontSize: 11, color: GREEN, fontWeight: 600 }}>
            R{totalValue.toLocaleString()} value generated this period
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Small components ─────────────────────────────────────────────────────────

function StatCard({ icon: Icon, value, label, sub }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #d8d3c8', borderRadius: 6, padding: '14px 14px 12px' }}>
      <Icon size={18} style={{ color: GREEN, marginBottom: 4 }} />
      <div style={{ fontSize: 26, fontWeight: 800, color: INK, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: INK, marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: 10, color: SOFT, marginTop: 2 }}>{sub}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0ede7' }}>
      <span style={{ fontSize: 12, color: SOFT }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function DarkRow({ label, value, sub, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
        {label}{sub ? <span style={{ color: '#aecfbe', marginLeft: 4 }}>{sub}</span> : null}
      </span>
      <span style={{ fontSize: 12, fontWeight: 700, color: highlight ? '#7edba8' : '#aecfbe' }}>{value}</span>
    </div>
  )
}

function FeedbackCard({ label, value, color, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 5, padding: '12px 10px', textAlign: 'center' }}>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 10, color: SOFT, marginTop: 3, lineHeight: 1.4 }}>{label}</div>
    </div>
  )
}
