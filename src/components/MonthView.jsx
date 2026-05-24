import { useMemo, useState } from 'react'
import { format, isSameMonth, isSameDay, isToday } from 'date-fns'
import { monthGridDays, eventsByDay, toISO, getEventState } from '../lib/events.js'
import { getEventColors, hexToRgba } from '../lib/colors.js'
import { USERS } from '../data/users.js'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function MonthView({
  selectedDate, onSelectDate, events, categories,
  onDayClick, onEventClick, onMoveEvent, editable, theme, now,
}) {
  const days = useMemo(() => monthGridDays(selectedDate), [selectedDate])
  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])
  const userMap = useMemo(() => Object.fromEntries(USERS.map((u) => [u.id, u])), [])

  const rangeFrom = toISO(days[0])
  const rangeTo = toISO(days[days.length - 1])
  const map = useMemo(() => eventsByDay(events, rangeFrom, rangeTo), [events, rangeFrom, rangeTo])

  const [dragOverISO, setDragOverISO] = useState(null)

  function handleDragStart(e, eventId, fromISOStr) {
    if (!editable) return
    e.dataTransfer.setData('application/json', JSON.stringify({ eventId, fromISO: fromISOStr }))
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
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2 px-0.5">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] sm:text-xs font-bold text-fg-mut uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day) => {
          const key = toISO(day)
          const inMonth = isSameMonth(day, selectedDate)
          const today = isToday(day)
          const selected = isSameDay(day, selectedDate)
          const dayEvents = map[key] || []
          const isDropTarget = dragOverISO === key

          return (
            <div key={key}
              onClick={() => { onSelectDate(day); onDayClick(day) }}
              onDragOver={(e) => handleDragOver(e, key)}
              onDragLeave={() => setDragOverISO((v) => v === key ? null : v)}
              onDrop={(e) => handleDrop(e, key)}
              className={[
                'group relative text-left rounded-lg sm:rounded-xl p-1 sm:p-2 min-h-[78px] sm:min-h-[112px]',
                'border transition-all duration-150 cursor-pointer card-hover',
                isDropTarget ? 'drop-target' : '',
              ].join(' ')}
              style={{
                backgroundColor: inMonth ? 'var(--surface)' : 'var(--surface-2)',
                borderColor: today ? 'var(--accent)' : selected ? 'var(--border-strong)' : 'var(--border)',
                ...(today ? { boxShadow: '0 0 0 3px var(--accent-soft)' } : {}),
              }}>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center text-xs sm:text-sm font-bold rounded-full w-6 h-6 sm:w-7 sm:h-7"
                  style={today
                    ? { backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }
                    : { color: inMonth ? 'var(--fg)' : 'var(--fg-muted)' }}>
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 0 && (
                  <span className="hidden sm:inline text-[10px] font-bold text-fg-mut">{dayEvents.length}</span>
                )}
              </div>

              <div className="mt-1 space-y-0.5 sm:space-y-1">
                {dayEvents.slice(0, 3).map((inst, idx) => {
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
                      className={['flex items-center gap-1 text-[10px] sm:text-xs rounded px-1 py-0.5 truncate hover:brightness-95',
                        editable ? 'draggable-event' : 'cursor-pointer', stateClass].join(' ')}
                      style={{ backgroundColor: colors.bgStrong, color: colors.text }}
                      title={inst.event.title + (state === 'done' ? ' (hecho)' : state === 'in_progress' ? ' (en curso)' : '')}>
                      <OwnerDot owner={owner} userMap={userMap} />
                      {state === 'done' && <span>✓</span>}
                      {state === 'in_progress' && <span>🟢</span>}
                      <span className="hidden sm:inline">{cat ? cat.icon : ''}</span>
                      <span className="truncate font-semibold ev-title">{inst.event.title || 'Sin título'}</span>
                    </div>
                  )
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] sm:text-xs text-fg-mut font-bold pl-1">+{dayEvents.length - 3} más</div>
                )}
              </div>

              {dayEvents.length > 0 && (
                <div className="absolute bottom-1 left-1 right-1 hidden sm:flex gap-0.5 opacity-70">
                  {uniqueColors(dayEvents, catMap).slice(0, 6).map((c, i) => (
                    <span key={i} className="h-0.5 flex-1 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {editable && (
        <p className="mt-3 text-center text-xs text-fg-mut">
          ✨ Tip: arrastra los eventos para moverlos a otro día.
        </p>
      )}
    </div>
  )
}

function OwnerDot({ owner, userMap }) {
  if (owner === 'shared') {
    return (
      <span className="inline-flex items-center">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: userMap.dalia.color }} />
        <span className="w-1.5 h-1.5 rounded-full -ml-0.5" style={{ backgroundColor: userMap.alex.color }} />
      </span>
    )
  }
  const u = userMap[owner]
  if (!u) return null
  return <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: u.color }} />
}

function uniqueColors(instances, catMap) {
  const set = new Set()
  for (const i of instances) {
    const c = catMap[i.event.categoryId] && catMap[i.event.categoryId].color
    if (c) set.add(c)
  }
  return [...set]
}
