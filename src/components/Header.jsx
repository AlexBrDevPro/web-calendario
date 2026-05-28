import { Plus, Eye, Pencil, Tag, ChevronLeft, ChevronRight, Calendar as CalIcon, Sun, Moon, Filter, LogOut } from './icons.jsx'
import { USERS } from '../data/users.js'

const VIEWS = [
  { id: 'day',   label: 'Día' },
  { id: 'week',  label: 'Semana' },
  { id: 'month', label: 'Mes' },
  { id: 'year',  label: 'Año' },
]

const FILTERS = [
  { id: 'all',    label: 'Todos' },
  { id: 'mine',   label: 'Míos' },
  { id: 'dalia',  label: 'Dalia' },
  { id: 'alex',   label: 'Alex' },
  { id: 'shared', label: 'Compartidos' },
]

export default function Header({
  mode, onModeChange,
  view, onViewChange,
  theme, onThemeToggle,
  currentUser,
  filter, onFilterChange,
  periodLabel, onPrev, onNext, onToday,
  onCreate, onOpenCategories,
  authUser, onLogout,
}) {
  const me = USERS.find((u) => u.id === currentUser)
  return (
    <header className="sticky top-0 z-30 backdrop-blur border-b border-soft"
      style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 85%, transparent)' }}>
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl header-logo flex items-center justify-center">
              <CalIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-fg leading-tight">Nuestro Calendario</h1>
              {me ? (
                <p className="text-xs text-fg-mut hidden sm:flex items-center gap-1">
                  Hola, <strong style={{ color: me.color }}>{me.name}</strong>
                </p>
              ) : (
                <p className="text-xs text-fg-mut hidden sm:block">Para {USERS[0].name} & {USERS[1].name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={onOpenCategories} className="btn btn-ghost !px-2.5 sm:!px-3" title="Categorías">
              <Tag className="w-4 h-4" />
              <span className="hidden md:inline">Categorías</span>
            </button>
            <button onClick={onThemeToggle} className="btn btn-ghost !p-2"
              title={theme === 'cookie' ? 'Cambiar a tema oscuro' : 'Cambiar a tema cookie'}>
              {theme === 'cookie' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <ModeToggle mode={mode} onChange={onModeChange} />
            <AuthMenu user={authUser} me={me} onLogout={onLogout} />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button onClick={onPrev} className="btn btn-secondary !p-2" title="Anterior">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={onToday} className="btn btn-secondary !px-3">Hoy</button>
            <button onClick={onNext} className="btn btn-secondary !p-2" title="Siguiente">
              <ChevronRight className="w-4 h-4" />
            </button>
            <h2 className="ml-2 text-sm sm:text-base font-bold text-fg capitalize">{periodLabel}</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex surface-2 rounded-lg p-1 border border-soft">
              {VIEWS.map((v) => {
                const active = view === v.id
                return (
                  <button key={v.id} onClick={() => onViewChange(v.id)}
                    className="px-3 py-1.5 text-sm rounded-md font-semibold transition-all"
                    style={active
                      ? { backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }
                      : { color: 'var(--fg-soft)' }}>
                    {v.label}
                  </button>
                )
              })}
            </div>
            <button onClick={onCreate} className="btn btn-primary hidden sm:inline-flex">
              <Plus className="w-4 h-4" /> Nuevo evento
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-fg-mut flex-shrink-0" />
          <span className="text-[11px] uppercase font-bold text-fg-mut tracking-wider flex-shrink-0">Mostrar:</span>
          {FILTERS.map((f) => {
            const active = filter === f.id
            const isUserFilter = f.id === 'dalia' || f.id === 'alex'
            const user = USERS.find((u) => u.id === f.id)
            return (
              <button key={f.id} onClick={() => onFilterChange(f.id)}
                className="chip-pill flex-shrink-0 border transition"
                style={active
                  ? { backgroundColor: isUserFilter ? user.color : 'var(--accent)', color: '#fff', borderColor: 'transparent' }
                  : { backgroundColor: 'var(--surface)', color: 'var(--fg-soft)', borderColor: 'var(--border)' }}>
                {isUserFilter && (
                  <span className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: active ? '#fff' : user.color }} />
                )}
                {f.label}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}

function ModeToggle({ mode, onChange }) {
  const isEditor = mode === 'editor'
  return (
    <button onClick={() => onChange(isEditor ? 'visualizador' : 'editor')}
      className="btn !px-3 border border-soft transition"
      style={{
        backgroundColor: isEditor ? 'var(--accent-soft)' : 'var(--surface-2)',
        color: isEditor ? 'var(--accent)' : 'var(--fg-soft)',
      }}
      title={isEditor ? 'Cambiar a modo visualizador' : 'Cambiar a modo editor'}>
      {isEditor ? <Pencil className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      <span className="hidden sm:inline">{isEditor ? 'Editor' : 'Visualizador'}</span>
    </button>
  )
}

function AuthMenu({ user, me, onLogout }) {
  if (!user) return null
  const initial = (me ? me.initial : (user.displayName || user.email || '?').charAt(0)).toUpperCase()
  const color = me ? me.color : 'var(--accent)'
  return (
    <button onClick={() => { if (confirm('¿Cerrar sesión?')) onLogout() }}
      className="btn btn-ghost !p-1.5 !gap-1.5" title={'Salir (' + (user.email || '') + ')'}>
      {user.photoURL ? (
        <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer"
          style={{ border: '2px solid ' + color }} />
      ) : (
        <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white" style={{ backgroundColor: color }}>{initial}</span>
      )}
      <LogOut className="w-4 h-4 hidden sm:inline" />
    </button>
  )
}
