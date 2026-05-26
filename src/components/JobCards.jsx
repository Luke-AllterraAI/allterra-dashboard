import { useState } from 'react'
import { format } from 'date-fns'
import { MapPin, Phone, Wrench, Plus, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useJobCards, useCreateJobCard, useUpdateJobCard } from '../hooks/useJobCards'

const INK   = '#0f1a14'
const GREEN = '#1a6b4a'
const GOLD  = '#c9813a'
const SOFT  = '#5a6360'
const RED   = '#b03a2e'

const STATUS_META = {
  open:        { label: 'Open',        bg: '#e6eef8', color: '#1a3d6b' },
  quoted:      { label: 'Quoted',      bg: '#fdf3e7', color: GOLD },
  in_progress: { label: 'In Progress', bg: '#e6f4ee', color: GREEN },
  completed:   { label: 'Completed',   bg: '#f0f0f0', color: SOFT },
}

const PRIORITY_META = {
  normal:    { label: 'Normal',    color: SOFT },
  high:      { label: 'High',      color: GOLD },
  emergency: { label: 'Emergency', color: RED  },
}

const EMPTY_FORM = {
  address: '', contact_name: '', contact_phone: '',
  description: '', status: 'open', priority: 'normal', notes: '',
}

export default function JobCards({ tenant }) {
  const [showForm, setShowForm]   = useState(false)
  const [expanded, setExpanded]   = useState(null)
  const [filter, setFilter]       = useState('all')
  const [search, setSearch]       = useState('')
  const [form, setForm]           = useState(EMPTY_FORM)
  const [editId, setEditId]       = useState(null)

  const { data: cards = [], isLoading, error } = useJobCards(tenant)
  const createCard  = useCreateJobCard()
  const updateCard  = useUpdateJobCard()

  const filtered = cards.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        c.address?.toLowerCase().includes(q) ||
        c.contact_name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      )
    }
    return true
  })

  function openNew() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(card) {
    setForm({
      address:       card.address || '',
      contact_name:  card.contact_name || '',
      contact_phone: card.contact_phone || '',
      description:   card.description || '',
      status:        card.status || 'open',
      priority:      card.priority || 'normal',
      notes:         card.notes || '',
    })
    setEditId(card.id)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.address.trim()) return
    if (editId) {
      await updateCard.mutateAsync({ id: editId, tenant, ...form })
    } else {
      await createCard.mutateAsync({ tenant, ...form })
    }
    setShowForm(false)
    setForm(EMPTY_FORM)
    setEditId(null)
  }

  async function changeStatus(card, status) {
    await updateCard.mutateAsync({ id: card.id, tenant: card.tenant, status })
  }

  const saving = createCard.isPending || updateCard.isPending

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search address, name, description…"
          style={{
            flex: 1, minWidth: 180, padding: '8px 12px', fontSize: 12,
            border: '1.5px solid #d8d3c8', borderRadius: 5, fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', 'open', 'quoted', 'in_progress', 'completed'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '6px 12px', fontSize: 11, fontWeight: 600, border: 'none',
                borderRadius: 4, cursor: 'pointer',
                background: filter === s ? INK : '#e8e4dc',
                color:      filter === s ? '#fff' : SOFT,
                letterSpacing: '0.05em', textTransform: 'capitalize',
              }}
            >
              {s === 'all' ? 'All' : STATUS_META[s]?.label}
            </button>
          ))}
        </div>
        <button
          onClick={openNew}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', fontSize: 12, fontWeight: 700,
            border: 'none', borderRadius: 5, background: GREEN, color: '#fff', cursor: 'pointer',
          }}
        >
          <Plus size={14} /> New Job Card
        </button>
      </div>

      {/* New / Edit form */}
      {showForm && (
        <div style={{
          background: '#fff', border: `2px solid ${GREEN}`, borderRadius: 8,
          padding: 20, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: GREEN }}>
              {editId ? 'Edit Job Card' : 'New Job Card'}
            </div>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: SOFT }}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>

              {/* Address — spans full width, big label */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: GREEN, display: 'block', marginBottom: 4 }}>
                  Property Address *
                </label>
                <input
                  required
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="12 Ocean Drive, Ballito"
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                    border: '2px solid #d8d3c8', borderRadius: 5, fontSize: 14,
                    fontWeight: 600, fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: SOFT, display: 'block', marginBottom: 4 }}>
                  Contact Name
                </label>
                <input
                  value={form.contact_name}
                  onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                  placeholder="Current occupant"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1.5px solid #d8d3c8', borderRadius: 5, fontSize: 13, fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: SOFT, display: 'block', marginBottom: 4 }}>
                  Phone
                </label>
                <input
                  value={form.contact_phone}
                  onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                  placeholder="082 000 0000"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1.5px solid #d8d3c8', borderRadius: 5, fontSize: 13, fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: SOFT, display: 'block', marginBottom: 4 }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What needs doing?"
                  rows={2}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1.5px solid #d8d3c8', borderRadius: 5, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: SOFT, display: 'block', marginBottom: 4 }}>
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #d8d3c8', borderRadius: 5, fontSize: 13, fontFamily: 'inherit' }}
                >
                  {Object.entries(STATUS_META).map(([v, m]) => (
                    <option key={v} value={v}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: SOFT, display: 'block', marginBottom: 4 }}>
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #d8d3c8', borderRadius: 5, fontSize: 13, fontFamily: 'inherit' }}
                >
                  {Object.entries(PRIORITY_META).map(([v, m]) => (
                    <option key={v} value={v}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: SOFT, display: 'block', marginBottom: 4 }}>
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any extra detail…"
                  rows={2}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1.5px solid #d8d3c8', borderRadius: 5, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '9px 22px', fontSize: 12, fontWeight: 700,
                  border: 'none', borderRadius: 5, background: GREEN, color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {saving && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                {editId ? 'Save Changes' : 'Create Job Card'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ padding: '9px 16px', fontSize: 12, border: '1px solid #d8d3c8', borderRadius: 5, background: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <Loader2 size={24} style={{ color: GREEN, animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && (
        <div style={{ background: '#fdf0f0', border: '1px solid #f5b1ab', borderRadius: 6, padding: 14, color: '#7f1d1d', fontSize: 12 }}>
          Failed to load job cards: {error.message}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filtered.length === 0 && (
        <div style={{ background: '#fff', border: '1px solid #d8d3c8', borderRadius: 6, padding: 48, textAlign: 'center' }}>
          <Wrench size={28} style={{ color: '#d8d3c8', marginBottom: 10 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: SOFT }}>
            {cards.length === 0 ? 'No job cards yet' : 'No cards match your filter'}
          </div>
          {cards.length === 0 && (
            <div style={{ fontSize: 12, color: SOFT, marginTop: 6 }}>
              Create your first job card — address is the permanent identifier.
            </div>
          )}
        </div>
      )}

      {/* Card list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(card => {
          const sm = STATUS_META[card.status]   || STATUS_META.open
          const pm = PRIORITY_META[card.priority] || PRIORITY_META.normal
          const isOpen = expanded === card.id

          return (
            <div
              key={card.id}
              style={{
                background: '#fff', border: '1px solid #d8d3c8', borderRadius: 6,
                overflow: 'hidden',
                borderLeft: card.priority === 'emergency' ? `4px solid ${RED}`
                           : card.priority === 'high'      ? `4px solid ${GOLD}`
                           : '4px solid transparent',
              }}
            >
              {/* Card header — always visible */}
              <div
                onClick={() => setExpanded(isOpen ? null : card.id)}
                style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }}
              >
                <MapPin size={16} style={{ color: GREEN, marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: INK, lineHeight: 1.3 }}>
                    {card.address}
                  </div>
                  {card.contact_name && (
                    <div style={{ fontSize: 12, color: SOFT, marginTop: 2 }}>
                      {card.contact_name}{card.contact_phone ? ` · ${card.contact_phone}` : ''}
                    </div>
                  )}
                  {card.description && (
                    <div style={{ fontSize: 12, color: INK, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isOpen ? 'normal' : 'nowrap' }}>
                      {card.description}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 3, background: sm.bg, color: sm.color }}>
                    {sm.label}
                  </span>
                  {card.priority !== 'normal' && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: pm.color }}>
                      {pm.label.toUpperCase()}
                    </span>
                  )}
                  {isOpen ? <ChevronUp size={14} style={{ color: SOFT }} /> : <ChevronDown size={14} style={{ color: SOFT }} />}
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ borderTop: '1px solid #f0ede7', padding: '12px 16px', background: '#fafaf8' }}>
                  {card.notes && (
                    <div style={{ fontSize: 12, color: SOFT, marginBottom: 12, lineHeight: 1.5 }}>
                      <strong>Notes:</strong> {card.notes}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: SOFT, marginBottom: 12 }}>
                    Created {format(new Date(card.created_at), 'dd MMM yyyy HH:mm')}
                    {card.updated_at !== card.created_at && ` · Updated ${format(new Date(card.updated_at), 'dd MMM HH:mm')}`}
                  </div>

                  {/* Status quick-change */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: SOFT, marginRight: 4 }}>Move to:</span>
                    {Object.entries(STATUS_META)
                      .filter(([v]) => v !== card.status)
                      .map(([v, m]) => (
                        <button
                          key={v}
                          onClick={() => changeStatus(card, v)}
                          disabled={updateCard.isPending}
                          style={{
                            fontSize: 11, fontWeight: 600, padding: '4px 10px',
                            border: `1px solid ${m.color}`, borderRadius: 3,
                            background: m.bg, color: m.color, cursor: 'pointer',
                          }}
                        >
                          {m.label}
                        </button>
                      ))
                    }
                    <button
                      onClick={() => openEdit(card)}
                      style={{
                        marginLeft: 'auto', fontSize: 11, fontWeight: 600, padding: '4px 12px',
                        border: '1px solid #d8d3c8', borderRadius: 3,
                        background: '#fff', color: SOFT, cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary bar */}
      {cards.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', gap: 16, fontSize: 11, color: SOFT }}>
          {Object.entries(STATUS_META).map(([v, m]) => {
            const n = cards.filter(c => c.status === v).length
            return n > 0 ? (
              <span key={v}>
                <span style={{ fontWeight: 700, color: m.color }}>{n}</span> {m.label}
              </span>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}
