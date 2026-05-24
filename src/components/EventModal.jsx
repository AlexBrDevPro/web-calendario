import { useEffect, useState } from 'react'
import { X, Trash, Check, Calendar, Clock, Repeat, Tag, Users } from './icons.jsx'
import { USERS, OWNER_OPTIONS } from '../data/users.js'
import TimePicker from './TimePicker.jsx'

const RECURRENCE_OPTIONS = [
  { value: 'none',    label: 'No se repite' },
  { value: 'weekly',  label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'yearly',  label: 'Anual' },
]

function snapTime(value) {
  if (!value) return null
  const parts = value.split(':')
  const hh = parseInt(parts[0], 10)
  const mm = parseInt(parts[1], 10)
  if (isNaN(hh) || isNaN(mm)) return null
  const snapped = Math.round(mm / 5) * 5
  const finalH = snapped === 60 ? (hh + 1) % 24 : hh
  const finalM = snapped === 60 ? 0 : snapped
  return String(finalH).padStart(2, '0') + ':' + String(finalM).padStart(2, '0')
}

export default function EventModal({ event, categories, onClose, onSave, onDelete, isNew }) {
  const [draft, setDraft] = useState(event)

  useEffect(() => {
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
      setDraft((d) => ({ ...d, endDate: d.startDate }))
    }
  }, [draft.startDate, draft.endDate])

  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  function update(patch) { setDraft((d) => ({ ...d, ...patch })) }
  function updateRec(patch) { setDraft((d) => ({ ...d, recurrence: { ...d.recurrence, ...patch } })) }

  function handleSave() {
    if (!draft.title || !draft.title.trim()) { alert('El evento necesita un título'); return }
    if (!draft.categoryId) { alert('Selecciona una categoría'); return }
    const cleaned = {
      ...draft,
      timeStart: snapTime(draft.timeStart),
      timeEnd:   snapTime(draft.timeEnd),
    }
    onSave(cleaned)
  }

  const rec = draft.recurrence || { type: 'none', interval: 1, until: null }
  const cat = categories.find((c) => c.id === draft.categoryId)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 fade-in">
      <div className="modal-in w-full sm:max-w-lg card !rounded-b-none sm:!rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 backdrop-blur border-b border-soft px-5 py-3 flex items-center justify-between"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--surface) 90%, transparent)',
            borderTopColor: cat ? cat.color : 'var(--accent)',
            borderTopWidth: 4,
          }}>
          <h3 className="font-bold text-fg">
            {isNew ? '✨ Nuevo evento' : 'Editar evento'}
          </h3>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="label">Título</label>
            <input autoFocus type="text"
              value={draft.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Ej. Cena con los padres"
              className="input text-base" />
          </div>

          <div>
            <label className="label">Descripción <span className="text-fg-mut normal-case font-normal">(opcional)</span></label>
            <textarea rows={2}
              value={draft.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Notas, lugar, detalles…"
              className="input resize-none" />
          </div>

          <div>
            <label className="label flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Para</label>
            <div className="grid grid-cols-3 gap-2">
              {OWNER_OPTIONS.map((opt) => {
                const active = draft.owner === opt.value
                const user = USERS.find((u) => u.id === opt.value)
                const color = user ? user.color : null
                let activeStyle = { background: 'linear-gradient(90deg, ' + USERS[0].color + ', ' + USERS[1].color + ')', color: '#fff', borderColor: 'transparent' }
                if (color) activeStyle = { backgroundColor: color, color: '#fff', borderColor: color }
                return (
                  <button key={opt.value} type="button" onClick={() => update({ owner: opt.value })}
                    className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-sm font-bold border transition"
                    style={active ? activeStyle : { backgroundColor: 'var(--surface-2)', color: 'var(--fg-soft)', borderColor: 'var(--border)' }}>
                    {opt.value === 'shared' ? (
                      <span className="flex">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: active ? 'rgba(255,255,255,0.6)' : USERS[0].color }} />
                        <span className="w-3 h-3 rounded-full -ml-1" style={{ backgroundColor: active ? 'rgba(255,255,255,0.9)' : USERS[1].color }} />
                      </span>
                    ) : (
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: active ? 'rgba(255,255,255,0.8)' : color }} />
                    )}
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Categoría</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((c) => {
                const active = draft.categoryId === c.id
                return (
                  <button key={c.id} type="button" onClick={() => update({ categoryId: c.id })}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm border transition"
                    style={active
                      ? { backgroundColor: hexToRgba(c.color, 0.22), color: darken(c.color), borderColor: c.color }
                      : { backgroundColor: 'var(--surface-2)', color: 'var(--fg-soft)', borderColor: 'var(--border)' }}>
                    <span>{c.icon}</span>
                    <span className="truncate text-xs font-bold">{c.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Desde</label>
              <input type="date" value={draft.startDate}
                onChange={(e) => update({ startDate: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Hasta</label>
              <input type="date" value={draft.endDate} min={draft.startDate}
                onChange={(e) => update({ endDate: e.target.value })} className="input" />
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Hora
              <span className="text-fg-mut normal-case font-normal">(opcional, pasos de 5 min)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase font-semibold text-fg-mut mb-1">Inicio</p>
                <TimePicker value={draft.timeStart} onChange={(v) => update({ timeStart: v })} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-fg-mut mb-1">Fin</p>
                <TimePicker value={draft.timeEnd} onChange={(v) => update({ timeEnd: v })} />
              </div>
            </div>
            <p className="text-[11px] text-fg-mut mt-1">
              La hora es informativa: el evento aparece en el día, no se desglosa por horas.
            </p>
          </div>

          <div>
            <label className="label flex items-center gap-1.5"><Repeat className="w-3.5 h-3.5" /> Repetición</label>
            <div className="grid grid-cols-4 gap-1.5">
              {RECURRENCE_OPTIONS.map((opt) => {
                const active = rec.type === opt.value
                return (
                  <button key={opt.value} type="button" onClick={() => updateRec({ type: opt.value })}
                    className="text-xs font-bold rounded-lg py-2 border transition"
                    style={active
                      ? { backgroundColor: 'var(--accent)', color: 'var(--accent-fg)', borderColor: 'var(--accent)' }
                      : { backgroundColor: 'var(--surface-2)', color: 'var(--fg-soft)', borderColor: 'var(--border)' }}>
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {rec.type !== 'none' && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Cada</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} max={99} value={rec.interval || 1}
                      onChange={(e) => updateRec({ interval: parseInt(e.target.value) || 1 })}
                      className="input w-20" />
                    <span className="text-sm text-fg-soft">
                      {rec.type === 'weekly' && 'semana(s)'}
                      {rec.type === 'monthly' && 'mes(es)'}
                      {rec.type === 'yearly' && 'año(s)'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="label">Hasta <span className="text-fg-mut normal-case font-normal">(opcional)</span></label>
                  <input type="date" value={rec.until || ''} min={draft.startDate}
                    onChange={(e) => updateRec({ until: e.target.value || null })} className="input" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-soft px-5 py-3 flex items-center justify-between gap-2"
          style={{ backgroundColor: 'var(--surface)' }}>
          {!isNew ? (
            <button onClick={() => {
              if (confirm('¿Eliminar este evento? Si es recurrente, se eliminarán todas las ocurrencias.'))
                onDelete(draft.id)
            }} className="btn btn-danger">
              <Trash className="w-4 h-4" /> Eliminar
            </button>
          ) : <span />}
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn btn-secondary">Cancelar</button>
            <button onClick={handleSave} className="btn btn-primary">
              <Check className="w-4 h-4" /> Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')'
}
function darken(hex) {
  const h = hex.replace('#', '')
  let r = parseInt(h.substring(0, 2), 16)
  let g = parseInt(h.substring(2, 4), 16)
  let b = parseInt(h.substring(4, 6), 16)
  r = Math.floor(r * 0.5); g = Math.floor(g * 0.5); b = Math.floor(b * 0.5)
  return 'rgb(' + r + ',' + g + ',' + b + ')'
}
