import { useMemo, useState } from 'react'
import { format, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { weekDays, eventsByDay, toISO, getEventState } from '../lib/events.js'
import { getEventColors } from '../lib/colors.js'
import { USERS } from '../data/users.js'
import { Plus, Check } from './icons.jsx'

export default function WeekView({
  selectedDate, onSelectDate, events, categories,
  onDayClick, onEventClick, onMoveEvent, editable, theme, now, onToggleDone,
}) {
  const days = useMemo(() => weekDays(selectedDate), [selectedDate])
  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])
  const userMap = useMemo(() => Object.fromEntries(USERS.map((u) => [u.id, u])), [])
  const rangeFrom = toISO(days[0])
  const rangeTo = toISO(days[days.length - 1])
  const map = useMemo(() => eventsByDay(events, rangeFrom, rangeTo), [events, rangeFrom, rangeTo])

  const [dragOverISO, setDragOverISO] = useState(null)

  function handleDragStart(e, eventId, fromISO) {
    if (!editable) return
    e.dataTransfer.setData('application/json', JSON.stringify({ eventId, fromISO }))
    e.dataTransfer.effectAllowed = 'move'
    e.currentTarget.classList.add('dragging')
  }
  function handleDragEnd(e) { e.currentTarget.classList.remove('dragging'); setDragOverISO(null) }
  function handleDragOver(e, dayISO) {
    if (!editable) return
    e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverISO(dayISO)
  }
  function handleDrop(e, dayISO) {
    if (!editable) return
    e.preventDefault(); setDragOverISO(null)
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      if (data && data.eventId) onMoveEvent(data.eventId, data.fromISO, dayISO)
    } catch {}
  }

  return (
    <div className="mt-3 sm:mt-4 fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 sm:gap-3">
        {days.map((day) => {
          const key = toISO(day)
          const today = isToday(day)
          const dayEvents = map[key] || []
          const isDropTarget = dragOverISO === key
          return (
            <div key={key}
              className={['card p-3 min-h-[160px] flex flex-col transition', isDropTarget ? 'drop-target' : ''].join(' ')}
              style={today ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-soft)' } : {}}
              onClick={() => onSelectDate(day)}
              onDragOver={(e) => handleDragOver(e, key)}
              onDragLeave={() => setDragOverISO((v) => v === key ? null : v)}
              onDrop={(e) => handleDrop(e, key)}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[10px] uppercase font-bold text-fg-mut tracking-wider">
                    {format(day, 'EEE', { locale: es })}
                  </p>
                  <p className="text-2xl font-extrabold leading-none"
                    style={{ color: today ? 'var(--accent)' : 'var(--fg)' }}>
                    {format(day, 'd')}
                  </p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDayClick(day) }}
                  className="btn-ghost p-1 rounded" title="Añadir evento">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 flex-1">
                {dayEvents.length === 0 && (
                  <p className="text-xs text-fg-mut italic">Sin eventos</p>
                )}
                {dayEvents.map((inst, idx) => {
                  const cat = catMap[inst.event.categoryId]
                  const baseColor = cat ? cat.color : '#6366f1'
                  const colors = getEventColors(baseColor, theme)
                  const owner = inst.event.owner || 'shared'
                  const state = getEventState(inst.event, key, now)
                  const stateClass = state === 'done' ? 'is-done' : (state === 'in_progress' ? 'pulse-now' : '')
                  return (
                    <div key={inst.event.id + '-' + idx}
                      draggable={editable}
                      onDragStart={(e) => handleDragStart(e, inst.event.id, key)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => { e.stopPropagation(); onEventClick(inst.event) }}
                      className={['rounded-lg p-2 hover:brightness-95 transition', editable ? 'draggable-event' : 'cursor-pointer', stateClass].join(' ')}
                      style={{ backgroundColor: colors.bg, borderLeft: '3px solid ' + colors.border }}>
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold flex-1 min-w-0" style={{ color: colors.text }}>
                          <OwnerDot owner={owner} userMap={userMap} />
                          <span>{cat ? cat.icon : ''}</span>
                          <span className="truncate ev-title">{inst.event.title || 'Sin título'}</span>
                        </div>
                        <DoneButton
                          isDone={state === 'done'}
                          onClick={(e) => { e.stopPropagation(); onToggleDone && onToggleDone(inst.event.id, key) }} />
                      </div>
                      {state === 'in_progress' && (
                        <div className="text-[10px] mt-0.5 font-bold" style={{ color: '#15803d' }}>🟢 En curso</div>
                      )}
                      {(inst.event.timeStart || inst.event.timeEnd) && (
                        <div className="text-[11px] mt-0.5" style={{ color: colors.textSoft }}>
                          {inst.event.timeStart}{inst.event.timeEnd ? ' – ' + inst.event.timeEnd : ''}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {editable && (
        <p className="mt-3 text-center text-xs text-fg-mut">
          ✨ Tip: arrastra los eventos entre columnas para cambiarlos de día. Toca el círculo para marcar como hecho.
        </p>
      )}
    </div>
  )
}

function DoneButton({ isDone, onClick }) {
  return (
    <button onClick={onClick} type="button"
      className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition hover:scale-110"
      style={isDone
        ? { backgroundColor: '#22c55e', borderColor: '#22c55e', color: '#fff' }
        : { backgroundColor: 'transparent', borderColor: 'var(--border-strong)' }}
      title={isDone ? 'Marcada como hecha (toca para deshacer)' : 'Marcar como hecha'}>
      {isDone && <Check className="w-3 h-3" strokeWidth={3} />}
    </button>
  )
}

function OwnerDot({ owner, userMap }) {
  if (owner === 'shared') {
    return (
      <span className="inline-flex items-center">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: userMap.dalia.color }} />
        <span className="w-2 h-2 rounded-full -ml-0.5" style={{ backgroundColor: userMap.alex.color }} />
      </span>
    )
  }
  return <span className="w-2 h-2 rounded-full" style={{ backgroundColor: userMap[owner] ? userMap[owner].color : '#888' }} />
}
