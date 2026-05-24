// Capa de persistencia.
//   - Preferencias por dispositivo (tema, vista, filtro, "quién soy"): localStorage.
//   - Datos compartidos (eventos, categorías): Firestore + listener en tiempo real.
import { useEffect, useRef, useState } from 'react'
import {
  collection, doc, onSnapshot, setDoc, deleteDoc,
  getDocs, writeBatch,
} from 'firebase/firestore'
import { db } from './firebase.js'
import { DEFAULT_CATEGORIES } from '../data/defaults.js'

// === Preferencias locales (localStorage) ==================================
const LK = {
  view: 'wc.view.v1',
  theme: 'wc.theme.v1',
  currentUser: 'wc.currentUser.v1',
  filter: 'wc.filter.v1',
  migrated: 'wc.migrated.firestore.v1',
}
function readJSON(k, fallback) {
  try { const r = localStorage.getItem(k); return r == null ? fallback : JSON.parse(r) }
  catch { return fallback }
}
function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => readJSON(key, initial))
  useEffect(() => { writeJSON(key, value) }, [key, value])
  return [value, setValue]
}
export function useView()        { return usePersistentState(LK.view, 'month') }
export function useTheme()       { return usePersistentState(LK.theme, 'cookie') }
export function useCurrentUser() { return usePersistentState(LK.currentUser, 'dalia') }
export function useFilter()      { return usePersistentState(LK.filter, 'all') }

// === Eventos (Firestore) ==================================================
export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const col = collection(db, 'events')
    const unsub = onSnapshot(col, (snap) => {
      const arr = []
      snap.forEach((d) => arr.push({ ...d.data(), id: d.id }))
      setEvents(arr)
      setLoading(false)
    }, (err) => {
      console.error('events listener:', err)
      setLoading(false)
    })
    return unsub
  }, [])

  return {
    events,
    loading,
    addEvent:    (ev) => setDoc(doc(db, 'events', ev.id), ev),
    updateEvent: (ev) => setDoc(doc(db, 'events', ev.id), ev),
    deleteEvent: (id) => deleteDoc(doc(db, 'events', id)),
  }
}

// === Categorías (Firestore) ===============================================
export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const col = collection(db, 'categories')
    const unsub = onSnapshot(col, (snap) => {
      const arr = []
      snap.forEach((d) => arr.push({ ...d.data(), id: d.id }))
      setCategories(arr)
      setLoading(false)
    })
    return unsub
  }, [])

  return {
    categories,
    loading,
    addCategory:    (c) => setDoc(doc(db, 'categories', c.id), c),
    updateCategory: (c) => setDoc(doc(db, 'categories', c.id), c),
    deleteCategory: (id) => deleteDoc(doc(db, 'categories', id)),
    // Compatibilidad con CategoriesPanel actual (bulk replace).
    replaceCategories: async (arr) => {
      const existing = await getDocs(collection(db, 'categories'))
      const newIds = new Set(arr.map((c) => c.id))
      const batch = writeBatch(db)
      existing.forEach((d) => { if (!newIds.has(d.id)) batch.delete(doc(db, 'categories', d.id)) })
      for (const c of arr) batch.set(doc(db, 'categories', c.id), c)
      await batch.commit()
    },
  }
}

// === Migración / siembra inicial ==========================================
// Se ejecuta una sola vez por dispositivo, marcada en localStorage.
// - Si hay datos antiguos en localStorage, los sube a Firestore.
// - Si Firestore aún está vacío y no hay datos antiguos, siembra las
//   categorías por defecto.
// - Si Firestore ya tiene datos (otro dispositivo migró antes), solo
//   marca la migración como hecha.
export async function migrateOrSeed() {
  if (localStorage.getItem(LK.migrated) === '1') return { migrated: false, seeded: false }
  try {
    const legacyEvents = readJSON('wc.events.v1', null)
    const legacyCats   = readJSON('wc.categories.v1', null)

    const existingCats = await getDocs(collection(db, 'categories'))
    const existingEvts = await getDocs(collection(db, 'events'))

    let migrated = false, seeded = false
    const batch = writeBatch(db)

    // Eventos
    if (Array.isArray(legacyEvents) && legacyEvents.length && existingEvts.empty) {
      for (const ev of legacyEvents) batch.set(doc(db, 'events', ev.id), ev)
      migrated = true
    }
    // Categorías
    if (existingCats.empty) {
      const toWrite = (Array.isArray(legacyCats) && legacyCats.length) ? legacyCats : DEFAULT_CATEGORIES
      for (const c of toWrite) batch.set(doc(db, 'categories', c.id), c)
      if (Array.isArray(legacyCats) && legacyCats.length) migrated = true
      else seeded = true
    }

    if (migrated || seeded) await batch.commit()
    localStorage.setItem(LK.migrated, '1')
    return { migrated, seeded }
  } catch (e) {
    console.warn('migrateOrSeed:', e)
    return { migrated: false, seeded: false, error: e }
  }
}
