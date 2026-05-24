import { Plus } from './icons.jsx'

const VIEWS = [
  { id: 'day',   label: 'Día' },
  { id: 'week',  label: 'Sem' },
  { id: 'month', label: 'Mes' },
  { id: 'year',  label: 'Año' },
]

export default function MobileTabBar({ view, onViewChange, onCreate }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 sm:hidden z-30 backdrop-blur border-t border-soft"
         style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 90%, transparent)' }}>
      <div className="flex items-stretch justify-around px-2">
        {VIEWS.map((v) => (
          <button key={v.id} onClick={() => onViewChange(v.id)}
            className="flex-1 py-2.5 text-xs font-bold transition"
            style={{ color: view === v.id ? 'var(--accent)' : 'var(--fg-muted)' }}>
            <div className="mx-auto h-1 w-6 rounded-full mb-1.5 transition"
              style={{ backgroundColor: view === v.id ? 'var(--accent)' : 'transparent' }} />
            {v.label}
          </button>
        ))}
        <button onClick={onCreate}
          className="ml-1 my-1.5 px-3 rounded-lg flex items-center gap-1 text-sm font-bold shadow-sm active:scale-95"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
