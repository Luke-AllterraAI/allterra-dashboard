import { useState, useMemo, useRef } from 'react'
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
  whatsapp_missed_call:      { icon: Phone,         color: GOLD,      label: 'WhatsApp call missed — bot picked up' },
  whatsapp_lead_engaged:     { icon: MessageCircle, color: GREEN,     label: 'AI replied to lead' },
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
          {['overview', 'jobs', 'timeline', 'campaigns'].map(t => (
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
                  <StatCard icon={MessageCircle} value={stats.whatsappReceived}     label="WhatsApp Handled"     sub={`${stats.whatsappMissedCalls} missed · ${stats.whatsappEngaged} replies`} />
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

            {/* ── CAMPAIGNS TAB ── */}
            {tab === 'campaigns' && (
              <CampaignTab tenant={tenant} />
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

// ── Campaign Tab ──────────────────────────────────────────────────────────────

const WEBHOOK_URL  = import.meta.env.VITE_WEBHOOK_URL  || ''
const ADMIN_KEY    = import.meta.env.VITE_ADMIN_KEY    || ''
const SC_API_KEY   = 'ffa063f0-b386-400b-b0ba-4d52d7b8386a'

const TEMPLATES = [
  {
    label: 'Winter geyser check',
    text: "Hi {name}, it's Chapman Plumbing here. Winter is here and now is the perfect time for a quick geyser health check before the cold hits hard. Reply YES and we'll book you in for a free inspection. 🔧",
  },
  {
    label: 'Maintenance reminder',
    text: "Hi {name}, Chapman Plumbing here. Don't wait for a burst pipe — a quick annual plumbing check can save you thousands. Reply YES to book your maintenance visit at a time that suits you.",
  },
  {
    label: 'Re-engagement',
    text: "Hi {name}, it's been a while! Chapman Plumbing here. If you need any plumbing help — big or small — just reply and we'll sort you out quickly. We're always just a message away. 👋",
  },
]

function CampaignTab({ tenant }) {
  const [message, setMessage]         = useState('')
  const [searchPhrase, setSearch]     = useState('')
  const [maxSend, setMaxSend]         = useState(50)
  const [dryRun, setDryRun]           = useState(true)
  const [status, setStatus]           = useState(null)   // null | 'previewing' | 'sending' | 'done' | 'error'
  const [result, setResult]           = useState(null)
  const [confirm, setConfirm]         = useState(false)
  const [customerCount, setCount]     = useState(null)
  const [counting, setCounting]       = useState(false)
  const abortRef                      = useRef(null)

  const charCount = message.length
  const hasName   = message.includes('{name}')

  async function fetchCount() {
    setCounting(true)
    setCount(null)
    try {
      const r = await fetch(`${WEBHOOK_URL}/campaigns/servcraft/count?key=${ADMIN_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servcraft_api_key: SC_API_KEY, search_phrase: searchPhrase }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const cd = await r.json()
      if (cd.error) throw new Error(cd.error)
      setCount(cd.count)
    } catch (e) {
      setCount('Error — check config')
    } finally {
      setCounting(false)
    }
  }

  async function sendCampaign(isDry) {
    setStatus(isDry ? 'previewing' : 'sending')
    setResult(null)
    setConfirm(false)
    try {
      const r = await fetch(`${WEBHOOK_URL}/campaigns/servcraft?key=${ADMIN_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servcraft_api_key: SC_API_KEY,
          message,
          search_phrase: searchPhrase,
          max_send: maxSend,
          dry_run: isDry,
        }),
      })
      if (!r.ok) throw new Error(`Server returned ${r.status}`)
      const data = await r.json()
      setResult(data)
      setStatus('done')
    } catch (e) {
      setResult({ error: e.message })
      setStatus('error')
    }
  }

  const busy = status === 'previewing' || status === 'sending'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>

      {/* ── Left: composer ── */}
      <div style={{ background: '#fff', border: '1px solid #d8d3c8', borderRadius: 6, padding: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: GREEN, marginBottom: 16 }}>
          COMPOSE MESSAGE
        </div>

        {/* Templates */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: SOFT, marginBottom: 6 }}>Quick templates</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TEMPLATES.map(t => (
              <button
                key={t.label}
                onClick={() => setMessage(t.text)}
                style={{
                  fontSize: 11, padding: '4px 10px', border: `1px solid ${GREEN}`,
                  borderRadius: 20, background: '#fff', color: GREEN, cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message textarea */}
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message here… Use {name} to personalise with the customer's first name."
          rows={5}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '10px 12px',
            border: '1.5px solid #d8d3c8', borderRadius: 6, fontSize: 13,
            fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5,
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: hasName ? GREEN : SOFT }}>
            {hasName ? '✓ Personalised with {name}' : 'Tip: add {name} to personalise'}
          </span>
          <span style={{ fontSize: 11, color: charCount > 300 ? '#b03a2e' : SOFT }}>{charCount} chars</span>
        </div>

        {/* Filters */}
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 140px', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: SOFT, marginBottom: 4 }}>Filter by name / suburb (optional)</div>
            <input
              value={searchPhrase}
              onChange={e => setSearch(e.target.value)}
              placeholder="e.g. Ballito, Simbithi — leave blank for all"
              style={{
                width: '100%', boxSizing: 'border-box', padding: '8px 10px',
                border: '1.5px solid #d8d3c8', borderRadius: 5, fontSize: 12, fontFamily: 'inherit',
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: SOFT, marginBottom: 4 }}>Max recipients</div>
            <input
              type="number"
              value={maxSend}
              onChange={e => setMaxSend(Math.max(1, Number(e.target.value)))}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '8px 10px',
                border: '1.5px solid #d8d3c8', borderRadius: 5, fontSize: 12, fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={fetchCount}
            disabled={busy || counting || !message}
            style={{
              padding: '9px 16px', fontSize: 12, fontWeight: 600, border: `1.5px solid ${GREEN}`,
              borderRadius: 5, background: '#fff', color: GREEN, cursor: 'pointer',
            }}
          >
            {counting ? 'Counting…' : 'Preview recipients'}
          </button>

          <button
            onClick={() => sendCampaign(true)}
            disabled={busy || !message}
            style={{
              padding: '9px 16px', fontSize: 12, fontWeight: 600,
              border: `1.5px solid #1a3d6b`, borderRadius: 5,
              background: '#fff', color: '#1a3d6b', cursor: 'pointer',
            }}
          >
            {status === 'previewing' ? 'Running dry run…' : 'Dry run'}
          </button>

          {!confirm ? (
            <button
              onClick={() => setConfirm(true)}
              disabled={busy || !message}
              style={{
                padding: '9px 20px', fontSize: 12, fontWeight: 700,
                border: 'none', borderRadius: 5,
                background: message ? GREEN : '#ccc',
                color: '#fff', cursor: message ? 'pointer' : 'default',
              }}
            >
              {status === 'sending' ? 'Sending…' : `Send to ${maxSend} customers`}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#b03a2e', fontWeight: 600 }}>Send real WhatsApps?</span>
              <button
                onClick={() => sendCampaign(false)}
                style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 5, background: '#b03a2e', color: '#fff', cursor: 'pointer' }}
              >
                Yes, send
              </button>
              <button
                onClick={() => setConfirm(false)}
                style={{ padding: '7px 12px', fontSize: 12, border: '1px solid #d8d3c8', borderRadius: 5, background: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div style={{
            marginTop: 14, padding: 12, borderRadius: 5,
            background: status === 'error' ? '#fdf0f0' : '#e6f4ee',
            border: `1px solid ${status === 'error' ? '#f5b1ab' : '#a8d5bc'}`,
          }}>
            {status === 'error' ? (
              <span style={{ fontSize: 12, color: '#7f1d1d' }}>Error: {result.error}</span>
            ) : (
              <span style={{ fontSize: 12, color: '#14532d', fontWeight: 600 }}>
                {result.dry_run
                  ? `Dry run queued — check Railway logs to see who would receive it.`
                  : `Campaign sent to up to ${result.max_send} customers. Check timeline for campaign_sent events.`
                }
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Right: info panel ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Recipient count card */}
        <div style={{ background: '#fff', border: '1px solid #d8d3c8', borderRadius: 6, padding: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: GREEN, marginBottom: 10 }}>
            RECIPIENTS
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: INK, lineHeight: 1 }}>
            {counting ? '…' : customerCount !== null ? customerCount.toLocaleString() : '—'}
          </div>
          <div style={{ fontSize: 11, color: SOFT, marginTop: 4 }}>
            {customerCount !== null
              ? `ServCraft customers matching filter${searchPhrase ? ` "${searchPhrase}"` : ' (all)'}`
              : 'Click "Preview recipients" to count'}
          </div>
          {customerCount !== null && maxSend < customerCount && (
            <div style={{ marginTop: 8, fontSize: 11, color: GOLD, fontWeight: 600 }}>
              Capped at {maxSend} — increase max recipients to reach all
            </div>
          )}
        </div>

        {/* How it works */}
        <div style={{ background: INK, borderRadius: 6, padding: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7edba8', marginBottom: 12 }}>
            HOW IT WORKS
          </div>
          {[
            ['1', 'Your message is sent via WhatsApp to each customer\'s mobile number from Chapman\'s WhatsApp line'],
            ['2', '{name} is replaced with their actual first name automatically'],
            ['3', 'Use the filter to target a suburb or specific customers'],
            ['4', 'Always do a dry run first — it logs without sending'],
            ['5', 'Campaigns are capped at 10 messages per 10 seconds to stay within limits'],
          ].map(([n, text]) => (
            <div key={n} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#1a6b4a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0,
              }}>{n}</div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Not configured warning */}
        {!WEBHOOK_URL && (
          <div style={{ background: '#fdf3e7', border: '1px solid #f5d499', borderRadius: 6, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>VITE_WEBHOOK_URL not set</div>
            <div style={{ fontSize: 11, color: '#92400e', marginTop: 4 }}>Add it to your .env and Vercel environment variables.</div>
          </div>
        )}
        {!ADMIN_KEY && (
          <div style={{ background: '#fdf3e7', border: '1px solid #f5d499', borderRadius: 6, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>VITE_ADMIN_KEY not set</div>
            <div style={{ fontSize: 11, color: '#92400e', marginTop: 4 }}>Add your Railway ADMIN_KEY to .env to enable campaigns.</div>
          </div>
        )}
      </div>
    </div>
  )
}
