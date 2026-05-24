import { useState } from 'react'
import { X, Plus, Trash, Check, Pencil } from './icons.jsx'
import { COLOR_PALETTE, ICON_SUGGESTIONS } from '../data/defaults.js'

export default function CategoriesPanel({ categories, onChange, onClose, events }) {
  const [editingId, setEditingId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState({ name: '', color: COLOR_PALETTE[0], icon: ICON_SUGGESTIONS[0] })

  function startCreate() {
    setCreating(true); setEditingId(null)
    setDraft({ name: '', color: COLOR_PALETTE[0], icon: ICON_SUGGESTIONS[0] })
  }
  function startEdit(cat) {
    setEditingId(cat.id); setCreating(false)
    setDraft({ name: cat.name, color: cat.color, icon: cat.icon })
  }
  function saveDraft() {
    if (!draft.name.trim()) { alert('Pon un nombre a la categoría'); return }
    if (creating) {
      const newCat = { id: 'cat-' + Date.now().toString(36), ...draft }
      onChange([...categories, newCat]); setCreating(false)
    } else if (editingId) {
      onChange(categories.map((c) => c.id === editingId ? { ...c, ...draft } : c))
      setEditingId(null)
    }
  }
  function cancelDraft() { setCreating(false); setEditingId(null) }
  function deleteCategory(cat) {
    const usage = events.filter((e) => e.categoryId === cat.id).length
    const msg = usage
      ? 'La categoría "' + cat.name + '" tiene ' + usage + ' evento(s) asociado(s). Se quedarán sin categoría. ¿Continuar?'
      : '¿Eliminar la categoría "' + cat.name + '"?'
    if (!confirm(msg)) return
    onChange(categories.filter((c) => c.id !== cat.id))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 fade-in">
      <div className="modal-in w-full sm:max-w-xl card !rounded-b-none sm:!rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 border-b border-soft px-5 py-3 flex items-center justify-between"
          style={{ backgroundColor: 'var(--surface)' }}>
          <h3 className="font-bold text-fg">🏷️ Categorías</h3>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {!creating && !editingId && (
            <button onClick={startCreate} className="btn btn-primary mb-4">
              <Plus className="w-4 h-4" /> Nueva categoría
            </button>
          )}

          {(creating || editingId) && (
            <div className="rounded-xl p-4 mb-4 border border-soft" style={{ backgroundColor: 'var(--surface-2)' }}>
              <h4 className="font-bold text-sm mb-3 text-fg">{creating ? 'Nueva categoría' : 'Editando categoría'}</h4>
              <div className="space-y-3">
                <div>
                  <label className="label">Nombre</label>
                  <input autoFocus type="text"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="Ej. Mascota" className="input" />
                </div>
                <div>
                  <label className="label">Icono</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ICON_SUGGESTIONS.map((ic) => (
                      <button key={ic} type="button" onClick={() => setDraft({ ...draft, icon: ic })}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg border transition"
                        style={draft.icon === ic
                          ? { backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent)' }
                          : { backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PALETTE.map((c) => (
                      <button key={c} type="button" onClick={() => setDraft({ ...draft, color: c })}
                        className="w-8 h-8 rounded-full transition"
                        style={{
                          backgroundColor: c,
                          transform: draft.color === c ? 'scale(1.15)' : 'scale(1)',
                          boxShadow: draft.color === c ? '0 0 0 3px var(--accent-soft)' : 'none',
                        }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={cancelDraft} className="btn btn-secondary">Cancelar</button>
                <button onClick={saveDraft} className="btn btn-primary">
                  <Check className="w-4 h-4" /> Guardar
                </button>
              </div>
            </div>
          )}

          <ul>
            {categories.map((cat) => {
              const usage = events.filter((e) => e.categoryId === cat.id).length
              return (
                <li key={cat.id} className="flex items-center gap-3 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: hexToRgba(cat.color, 0.22) }}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-fg text-sm truncate">{cat.name}</p>
                    <p className="text-xs text-fg-mut">{usage} evento(s)</p>
                  </div>
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                  <button onClick={() => startEdit(cat)} className="btn btn-ghost !p-2" title="Editar">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteCategory(cat)} className="btn btn-danger !p-2" title="Eliminar">
                    <Trash className="w-4 h-4" />
                  </button>
                </li>
              )
            })}
          </ul>

          {categories.length === 0 && (
            <p className="text-center text-sm text-fg-mut py-6">No hay categorías. Crea la primera.</p>
          )}
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
