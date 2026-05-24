import { useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { expandAll, toISO, getEventState } from '../lib/events.js'
import { getEventColors } from '../lib/colors.js'
import { USERS } from '../data/users.js'
import { Plus, Clock, Repeat, Check } from './icons.jsx'

export default function DayView({ selectedDate, events, categories, onAdd, onEventClick, theme, now, onToggleDone }) {
  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])
  const userMap = useMemo(() => Object.fromEntries(USERS.map((u) => [u.id, u])), [])
  const iso = toISO(selectedDate)
  const instances = useMemo(() => expandAll(events, iso, iso), [events, iso])

  const grouped = useMemo(() => {
    const g = {}
    for (const inst of instances) {
      const cid = inst.event.categoryId || '_'
      if (!g[cid]) g[cid] = []
      g[cid].push(inst)
    }
    return g
  }, [instances])

  const orderedCats = categories.filter((c) => grouped[c.id] && grouped[c.id].length)
  const uncategorized = grouped['_'] || []

  return (
    <div className="mt-3 sm:mt-4 fade-in">
      <div className="card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase font-bold text-fg-mut tracking-wider">
              {format(selectedDate, "EEEE", { locale: es })}
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-fg capitalize">
              {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
            </h3>
          </div>
          <button onClick={onAdd} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Añadir</span>
          </button>
        </div>

        {instances.length === 0 && (
          <div className="text-center py-12 text-fg-mut">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-sm">No hay eventos para este día.</p>
            <button onClick={onAdd} className="btn btn-secondary mt-4">
              <Plus className="w-4 h-4" /> Añadir el primero
            </button>
          </div>
        )}

        <div className="space-y-5">
          {orderedCats.map((cat) => (
            <CategorySection key={cat.id} category={cat} instances={grouped[cat.id]}
              userMap={userMap} onEventClick={onEventClick}
              theme={theme} now={now} dayISO={iso} onToggleDone={onToggleDone} />
          ))}
          {uncategorized.length > 0 && (
            <CategorySection
              category={{ id: '_', name: 'Sin categoría', icon: '📌', color: '#94a3b8' }}
              instances={uncategorized}
              userMap={userMap}
              onEventClick={onEventClick}
              theme={theme} now={now} dayISO={iso} onToggleDone={onToggleDone} />
          )}
        </div>
      </div>
    </div>
  )
}

function CategorySection({ category, instances, userMap, onEventClick, theme, now, dayISO, onToggleDone }) {
  const colors = getEventColors(category.color, theme)
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{category.icon}</span>
        <h4 className="font-bold text-sm uppercase tracking-wider" style={{ color: colors.text }}>
          {category.name}
        </h4>
        <span className="text-xs text-fg-mut">({instances.length})</span>
        <div className="flex-1 h-px ml-2" style={{ backgroundColor: colors.bgStrong }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {instances.map((inst, idx) => (
          <EventCard key={inst.event.id + '-' + idx}
            instance={inst} colors={colors} userMap={userMap}
            onClick={() => onEventClick(inst.event)}
            state={getEventState(inst.event, dayISO, now)}
            onToggleDone={() => onToggleDone && onToggleDone(inst.event.id, dayISO)} />
        ))}
      </div>
    </div>
  )
}

function EventCard({ instance, colors, userMap, onClick, state, onToggleDone }) {
  const ev = instance.event
  const recurring = ev.recurrence && ev.recurrence.type !== 'none'
  const owner = ev.owner || 'shared'
  const isDone = state === 'done'
  const inProgress = state === 'in_progress'
  return (
    <div className={['rounded-xl p-3 transition group',
                     isDone ? 'is-done' : '',
                     inProgress ? 'pulse-now' : ''].join(' ')}
      style={{ backgroundColor: colors.bg, borderLeft: '4px solid ' + colors.border }}>
      <div className="flex items-start gap-2">
        <button type="button" onClick={(e) => { e.stopPropagation(); onToggleDone() }}
          className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition hover:scale-110"
          style={isDone
            ? { backgroundColor: '#22c55e', borderColor: '#22c55e', color: '#fff' }
            : { backgroundColor: 'transparent', borderColor: colors.border }}
          title={isDone ? 'Marcada como hecha (toca para deshacer)' : 'Marcar como hecha'}>
          {isDone && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
        </button>

        <button onClick={onClick} className="flex-1 text-left min-w-0 hover:opacity-95">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <OwnerBadge owner={owner} userMap={userMap} />
            {inProgress && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold text-white"
                style={{ backgroundColor: '#22c55e' }}>🟢 EN CURSO</span>
            )}
            <p className="font-bold truncate ev-title" style={{ color: colors.text }}>
              {ev.title || 'Sin título'}
            </p>
          </div>
          {ev.description && (
            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: colors.textSoft }}>{ev.description}</p>
          )}
          {(ev.timeStart || ev.timeEnd) && (
            <div className="flex items-center gap-1 text-xs mt-2 font-semibold" style={{ color: colors.textSoft }}>
              <Clock className="w-3 h-3" />
              {ev.timeStart}{ev.timeEnd ? ' – ' + ev.timeEnd : ''}
            </div>
          )}
        </button>

        {recurring && <Repeat className="w-3.5 h-3.5 text-fg-mut flex-shrink-0 mt-1" />}
      </div>
    </div>
  )
}

function OwnerBadge({ owner, userMap }) {
  if (owner === 'shared') {
    const grad = 'linear-gradient(90deg, ' + userMap.dalia.color + ', ' + userMap.alex.color + ')'
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold text-white"
        title="Compartido" style={{ background: grad }}>D + A</span>
    )
  }
  const u = userMap[owner]
  if (!u) return null
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold text-white"
      title={u.name} style={{ backgroundColor: u.color }}>{u.initial}</span>
  )
}
