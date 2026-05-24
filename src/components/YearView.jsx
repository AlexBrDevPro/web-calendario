import { useMemo } from 'react'
import {
  format, startOfYear, endOfYear, eachMonthOfInterval,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, isToday,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { eventsByDay, toISO } from '../lib/events.js'

export default function YearView({ selectedDate, events, categories, onPickDate, onPickMonth }) {
  const year = selectedDate.getFullYear()
  const months = useMemo(() => eachMonthOfInterval({
    start: startOfYear(selectedDate),
    end: endOfYear(selectedDate),
  }), [year])

  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])
  const rangeFrom = toISO(startOfYear(selectedDate))
  const rangeTo = toISO(endOfYear(selectedDate))
  const dayMap = useMemo(() => eventsByDay(events, rangeFrom, rangeTo), [events, rangeFrom, rangeTo])

  return (
    <div className="mt-3 sm:mt-4 fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {months.map((m) => (
          <MiniMonth key={m.toISOString()} monthDate={m} dayMap={dayMap} catMap={catMap}
            onPickDate={onPickDate} onPickMonth={onPickMonth} />
        ))}
      </div>
    </div>
  )
}

function MiniMonth({ monthDate, dayMap, catMap, onPickDate, onPickMonth }) {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end })

  return (
    <div className="card p-3">
      <button onClick={() => onPickMonth(monthDate)} className="block w-full text-left mb-2 transition">
        <h4 className="font-bold text-sm capitalize text-fg hover:opacity-70">
          {format(monthDate, 'MMMM', { locale: es })}
        </h4>
      </button>
      <div className="grid grid-cols-7 gap-px text-[9px]">
        {['L','M','X','J','V','S','D'].map((d) => (
          <div key={d} className="text-center text-fg-mut font-bold py-0.5">{d}</div>
        ))}
        {days.map((day) => {
          const key = toISO(day)
          const inMonth = isSameMonth(day, monthDate)
          const dayEvents = dayMap[key] || []
          const dot = dayEvents[0] ? catMap[dayEvents[0].event.categoryId]?.color : null
          const today = isToday(day)
          return (
            <button key={key} onClick={() => onPickDate(day)}
              className="relative aspect-square flex items-center justify-center rounded text-[10px] transition hover:opacity-80"
              style={today
                ? { backgroundColor: 'var(--accent)', color: 'var(--accent-fg)', fontWeight: 800 }
                : { color: inMonth ? 'var(--fg)' : 'var(--fg-muted)' }}
              title={dayEvents.length ? dayEvents.length + ' evento(s)' : ''}>
              {format(day, 'd')}
              {dayEvents.length > 0 && !today && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full"
                  style={{ backgroundColor: dot || 'var(--accent)' }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
