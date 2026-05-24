import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Clock, Check, X } from './icons.jsx'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

export default function TimePicker({ value, onChange, placeholder = '—:—' }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const hoursColRef = useRef(null)
  const minutesColRef = useRef(null)

  const parts = value ? value.split(':') : ['', '']
  const h = parts[0] || ''
  const m = parts[1] || ''

  // Cerrar al hacer click fuera o pulsar Escape
  useEffect(() => {
    if (!open) return
    function onDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Auto-scroll a la opción seleccionada al abrir
  useLayoutEffect(() => {
    if (!open) return
    function centerSelected(col, val) {
      if (!col || !val) return
      const item = col.querySelector('[data-val="' + val + '"]')
      if (item) {
        col.scrollTop = item.offsetTop - col.clientHeight / 2 + item.clientHeight / 2
      }
    }
    centerSelected(hoursColRef.current, h)
    centerSelected(minutesColRef.current, m)
  }, [open, h, m])

  function pickHour(hh) {
    const newMin = m || '00'
    onChange(hh + ':' + newMin)
  }
  function pickMinute(mm) {
    const newHour = h || '00'
    onChange(newHour + ':' + mm)
  }
  function clearValue() {
    onChange(null)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input flex items-center justify-between text-left"
        style={{ cursor: 'pointer' }}
      >
        <span className={value ? 'text-fg font-bold tabular-nums' : 'text-fg-mut'}>
          {value || placeholder}
        </span>
        <Clock className="w-4 h-4" style={{ color: 'var(--fg-muted)' }} />
      </button>

      {open && (
        <div
          className="absolute z-40 mt-1 left-0 w-full sm:w-64 card p-2 modal-in"
          style={{ boxShadow: '0 12px 36px rgba(0,0,0,0.18)' }}
        >
          <div className="grid grid-cols-2 gap-2">
            <Column label="Hora"   colRef={hoursColRef}   options={HOURS}   selected={h} onPick={pickHour}   />
            <Column label="Minuto" colRef={minutesColRef} options={MINUTES} selected={m} onPick={pickMinute} />
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-soft">
            <button type="button" onClick={clearValue}
              className="btn btn-ghost !text-xs !px-2 !py-1">
              <X className="w-3.5 h-3.5" /> Quitar
            </button>
            <button type="button" onClick={() => setOpen(false)}
              className="btn btn-primary !text-xs !px-3 !py-1">
              <Check className="w-3.5 h-3.5" /> Listo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Column({ label, colRef, options, selected, onPick }) {
  return (
    <div className="flex flex-col">
      <p className="text-[10px] uppercase font-bold text-fg-mut text-center pb-1 tracking-wider">
        {label}
      </p>
      <div
        ref={colRef}
        className="overflow-y-auto rounded h-48 p-1 scroll-smooth"
        style={{ backgroundColor: 'var(--surface-2)', scrollbarWidth: 'thin' }}
      >
        {options.map((opt) => {
          const active = selected === opt
          return (
            <button
              key={opt}
              type="button"
              data-val={opt}
              onClick={() => onPick(opt)}
              className="w-full text-center py-1.5 rounded font-bold text-sm transition tabular-nums"
              style={active
                ? { backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }
                : { color: 'var(--fg-soft)' }}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
