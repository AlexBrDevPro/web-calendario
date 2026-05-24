import { useMemo, useState } from 'react'
import { format, startOfToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { expandAll, toISO, getEventState } from '../lib/events.js'
import { getEventColors } from '../lib/colors.js'
import { USERS } from '../data/users.js'
import { Pencil, Clock, Repeat, Sun, Moon, Check, LogOut } from './icons.jsx'

const FILTERS = [
  { id: 'all',    label: 'Todo',         icon: '🌈' },
  { id: 'dalia',  label: USERS[0].name,  icon: '💖' },
  { id: 'alex',   label: USERS[1].name,  icon: '💙' },
  { id: 'shared', label: 'Compartidos',  icon: '💞' },
]

export default function ViewerMode({ events, categories, currentUser, onExit, theme, onThemeToggle, onToggleDone, now, authUser, onLogout }) {
  const [filter, setFilter] = useState('all')

  const today = startOfToday()
  const iso = toISO(today)
  const allInstances = useMemo(() => expandAll(events, iso, iso), [events, iso])
  const userMap = useMemo(() => Object.fromEntries(USERS.map((u) => [u.id, u])), [])

  const instances = useMemo(() => {
    if (filter === 'all') return allInstances
    return allInstances.filter((i) => (i.event.owner || 'shared') === filter)
  }, [allInstances, filter])

  const counts = useMemo(() => {
    const c = { all: allInstances.length, dalia: 0, alex: 0, shared: 0 }
    for (const i of allInstances) {
      const o = i.event.owner || 'shared'
      if (c[o] !== undefined) c[o]++
    }
    return c
  }, [allInstances])

  const stateCounts = useMemo(() => {
    const c = { done: 0, in_progress: 0, pending: 0 }
    for (const i of instances) {
      const s = getEventState(i.event, iso, now)
      c[s] = (c[s] || 0) + 1
    }
    return c
  }, [instances, iso, now])

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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <header className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>
            Hoy es
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-fg capitalize mt-1 leading-tight">
            {format(today, "EEEE", { locale: es })}
          </h1>
          <p className="text-lg sm:text-2xl font-bold text-fg-soft capitalize">
            {format(today, "d 'de' MMMM", { locale: es })}
          </p>
          <p className="text-xs text-fg-mut mt-1">
            Vista de <strong>{userMap[currentUser] ? userMap[currentUser].name : ''}</strong>
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl sm:text-4xl font-extrabold text-fg tabular-nums">
            {format(now, 'HH:mm')}
          </p>
          <div className="flex gap-1 mt-2 justify-end flex-wrap">
            <button onClick={onThemeToggle} className="btn btn-secondary !p-2" title="Cambiar tema">
              {theme === 'cookie' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button onClick={onExit} className="btn btn-secondary text-xs">
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
            {authUser && (
              <button onClick={() => { if (confirm('¿Cerrar sesión?')) onLogout() }}
                className="btn btn-secondary !p-2" title={'Salir (' + (authUser.email || '') + ')'}>
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {instances.length > 0 && (
        <div className="px-4 sm:px-8 mb-3">
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            <span className="chip-pill" style={{ backgroundColor: 'var(--surface)', color: 'var(--fg-soft)', border: '1px solid var(--border)' }}>
              📋 {instances.length} total
            </span>
            {stateCounts.in_progress > 0 && (
              <span className="chip-pill text-white" style={{ backgroundColor: '#22c55e' }}>
                🟢 {stateCounts.in_progress} en curso
              </span>
            )}
            <span className="chip-pill" style={{ backgroundColor: 'var(--surface)', color: 'var(--fg-soft)', border: '1px solid var(--border)' }}>
              ⏳ {stateCounts.pending} pendiente(s)
            </span>
            {stateCounts.done > 0 && (
              <span className="chip-pill text-white" style={{ backgroundColor: '#16a34a' }}>
                ✓ {stateCounts.done} hecha(s)
              </span>
            )}
          </div>
        </div>
      )}

      <div className="px-4 sm:px-8 mb-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.id
            const user = USERS.find((u) => u.id === f.id)
            const count = counts[f.id]
            let activeStyle = { backgroundColor: 'var(--accent)', color: 'var(--accent-fg)', borderColor: 'var(--accent)' }
            if (user) activeStyle = { backgroundColor: user.color, color: '#fff', borderColor: user.color }
            else if (f.id === 'shared') activeStyle = { background: 'linear-gradient(90deg, ' + USERS[0].color + ', ' + USERS[1].color + ')', color: '#fff', borderColor: 'transparent' }
            return (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className="px-3 sm:px-4 py-2 rounded-full font-bold text-sm transition border flex items-center gap-2"
                style={active ? activeStyle : { backgroundColor: 'var(--surface)', color: 'var(--fg-soft)', borderColor: 'var(--border)' }}>
                <span>{f.icon}</span>
                {f.label}
                <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-extrabold"
                  style={active ? { backgroundColor: 'rgba(255,255,255,0.25)' } : { backgroundColor: 'var(--surface-2)' }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <main className="flex-1 px-4 sm:px-8 pb-12 max-w-5xl mx-auto w-full">
        {instances.length === 0 ? (
          <div className="text-center py-16 sm:py-24">
            <div className="text-7xl sm:text-8xl mb-4">{filter === 'all' ? '🌿' : '💭'}</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-fg-soft">
              {filter === 'all' ? 'Día tranquilo' : 'Nada en este filtro'}
            </h2>
            <p className="text-fg-mut mt-2">
              {filter === 'all' ? 'No hay nada planeado para hoy.' : 'Prueba con otro filtro.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8 mt-2">
            {orderedCats.map((cat) => (
              <BigCategoryBlock key={cat.id} category={cat}
                instances={grouped[cat.id]} userMap={userMap}
                theme={theme} now={now} dayISO={iso} onToggleDone={onToggleDone} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function BigCategoryBlock({ category, instances, userMap, theme, now, dayISO, onToggleDone }) {
  const colors = getEventColors(category.color, theme)
  return (
    <section className="rounded-2xl p-5 sm:p-6 shadow-soft border"
      style={{ backgroundColor: colors.bg, borderColor: colors.bgStrong }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
          style={{ backgroundColor: colors.bgStrong }}>
          {category.icon}
        </div>
        <div>
          <h3 className="font-extrabold text-xl sm:text-2xl" style={{ color: colors.text }}>
            {category.name}
          </h3>
          <p className="text-xs text-fg-mut">{instances.length} evento(s)</p>
        </div>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {instances.map((inst, idx) => {
          const ev = inst.event
          const recurring = ev.recurrence && ev.recurrence.type !== 'none'
          const owner = ev.owner || 'shared'
          const state = getEventState(ev, dayISO, now)
          const isDone = state === 'done'
          const inProgress = state === 'in_progress'
          return (
            <li key={ev.id + '-' + idx}
              className={['rounded-xl p-3 sm:p-4 border',
                          isDone ? 'is-done' : '',
                          inProgress ? 'pulse-now' : ''].join(' ')}
              style={{
                backgroundColor: 'var(--surface)',
                borderLeft: '4px solid ' + colors.border,
                borderColor: colors.bgStrong,
              }}>
              <div className="flex items-start gap-2">
                <button type="button"
                  onClick={() => onToggleDone && onToggleDone(ev.id, dayISO)}
                  className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center transition hover:scale-110"
                  style={isDone
                    ? { backgroundColor: '#22c55e', borderColor: '#22c55e', color: '#fff' }
                    : { backgroundColor: 'transparent', borderColor: colors.border }}
                  title={isDone ? 'Hecha (toca para deshacer)' : 'Marcar como hecha'}>
                  {isDone && <Check className="w-4 h-4" strokeWidth={3} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <OwnerBadgeBig owner={owner} userMap={userMap} />
                    {inProgress && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold text-white"
                        style={{ backgroundColor: '#22c55e' }}>🟢 EN CURSO</span>
                    )}
                    {recurring && <Repeat className="w-4 h-4 text-fg-mut flex-shrink-0" />}
                  </div>
                  <p className="font-extrabold text-base sm:text-lg text-fg ev-title">{ev.title || 'Sin título'}</p>
                  {ev.description && (
                    <p className="text-sm text-fg-soft mt-1">{ev.description}</p>
                  )}
                  {(ev.timeStart || ev.timeEnd) && (
                    <div className="flex items-center gap-1.5 text-sm font-bold mt-2" style={{ color: colors.text }}>
                      <Clock className="w-4 h-4" />
                      {ev.timeStart}{ev.timeEnd ? ' – ' + ev.timeEnd : ''}
                    </div>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function OwnerBadgeBig({ owner, userMap }) {
  if (owner === 'shared') {
    const grad = 'linear-gradient(90deg, ' + userMap.dalia.color + ', ' + userMap.alex.color + ')'
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold text-white"
        style={{ background: grad }}>💞 Compartido</span>
    )
  }
  const u = userMap[owner]
  if (!u) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold text-white"
      style={{ backgroundColor: u.color }}>{u.initial} · {u.name}</span>
  )
}
