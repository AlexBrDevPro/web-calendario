import { useEffect, useMemo, useState } from 'react'
import { format, addDays, addMonths, addYears, addWeeks, startOfToday } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  useEvents, useCategories, useView,
  useTheme, useFilter,
  migrateOrSeed,
} from './lib/storage.js'
import { newEvent, toISO, shiftEventByDays, daysBetween, toggleDoneInstance } from './lib/events.js'
import { filterByOwner } from './data/users.js'
import { useAuth } from './contexts/AuthContext.jsx'

import LoginScreen from './components/LoginScreen.jsx'
import Header from './components/Header.jsx'
import MonthView from './components/MonthView.jsx'
import WeekView from './components/WeekView.jsx'
import DayView from './components/DayView.jsx'
import YearView from './components/YearView.jsx'
import EventModal from './components/EventModal.jsx'
import CategoriesPanel from './components/CategoriesPanel.jsx'
import ViewerMode from './components/ViewerMode.jsx'
import MobileTabBar from './components/MobileTabBar.jsx'

export default function App() {
  const { user, userId, loading: authLoading, logout } = useAuth()

  if (authLoading) return <Splash text="Cargando…" />
  if (!user) return <LoginScreen />
  return <AuthenticatedApp user={user} userId={userId} onLogout={logout} />
}

function Splash({ text }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl header-logo flex items-center justify-center text-xl">💞</div>
        <p className="text-fg-soft text-sm">{text}</p>
      </div>
    </div>
  )
}

function AuthenticatedApp({ user, userId, onLogout }) {
  const { events, addEvent, updateEvent, deleteEvent: removeEvent, loading: evLoading } = useEvents()
  const { categories, replaceCategories, loading: catLoading } = useCategories()

  const [view, setView] = useView()
  const [theme, setTheme] = useTheme()
  const [filter, setFilter] = useFilter()
  const [mode, setMode] = useState('visualizador')

  // currentUser viene del login (no del selector manual)
  const currentUser = userId || 'alex'

  const [selectedDate, setSelectedDate] = useState(startOfToday())
  const [editingEvent, setEditingEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showCategories, setShowCategories] = useState(false)

  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    migrateOrSeed().then((res) => {
      if (res && res.migrated) console.log('Datos antiguos migrados a Firestore.')
      if (res && res.seeded)   console.log('Categorías por defecto sembradas en Firestore.')
    })
  }, [])

  const isEditor = mode === 'editor'

  const filteredEvents = useMemo(
    () => filterByOwner(events, filter, currentUser),
    [events, filter, currentUser]
  )

  function openCreate(dateISO) {
    if (!isEditor) return
    // Por defecto el evento se crea para "ti", no compartido
    const init = dateISO
      ? { startDate: dateISO, endDate: dateISO, categoryId: categories[0]?.id || '', owner: currentUser }
      : { categoryId: categories[0]?.id || '', owner: currentUser }
    setEditingEvent(newEvent(init))
    setShowEventModal(true)
  }
  function openEdit(ev) {
    if (!isEditor) return
    setEditingEvent({ ...ev })
    setShowEventModal(true)
  }
  async function saveEvent(ev) {
    const exists = events.some((e) => e.id === ev.id)
    if (exists) await updateEvent(ev)
    else await addEvent(ev)
    setShowEventModal(false)
    setEditingEvent(null)
  }
  async function handleDelete(id) {
    await removeEvent(id)
    setShowEventModal(false)
    setEditingEvent(null)
  }
  async function moveEvent(eventId, fromISOStr, toISOStr) {
    const delta = daysBetween(fromISOStr, toISOStr)
    if (delta === 0) return
    const ev = events.find((e) => e.id === eventId)
    if (!ev) return
    await updateEvent(shiftEventByDays(ev, delta))
  }
  async function toggleDone(eventId, dateISO) {
    const ev = events.find((e) => e.id === eventId)
    if (!ev) return
    await updateEvent(toggleDoneInstance(ev, dateISO))
  }

  function navigate(delta) {
    setSelectedDate((prev) => {
      if (view === 'day') return addDays(prev, delta)
      if (view === 'week') return addWeeks(prev, delta)
      if (view === 'month') return addMonths(prev, delta)
      if (view === 'year') return addYears(prev, delta)
      return prev
    })
  }
  function goToday() { setSelectedDate(startOfToday()) }

  const periodLabel = useMemo(() => {
    if (view === 'day') return format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es })
    if (view === 'week') return `Semana del ${format(selectedDate, "d 'de' MMM", { locale: es })}`
    if (view === 'month') return format(selectedDate, "MMMM yyyy", { locale: es })
    if (view === 'year') return format(selectedDate, "yyyy", { locale: es })
    return ''
  }, [view, selectedDate])

  if (evLoading || catLoading) return <Splash text="Cargando datos…" />

  if (mode === 'visualizador') {
    return (
      <ViewerMode
        events={events}
        categories={categories}
        currentUser={currentUser}
        onExit={() => setMode('editor')}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'cookie' ? 'dark' : 'cookie')}
        onToggleDone={toggleDone}
        now={now}
        authUser={user}
        onLogout={onLogout}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        mode={mode} onModeChange={setMode}
        view={view} onViewChange={setView}
        theme={theme} onThemeToggle={() => setTheme(theme === 'cookie' ? 'dark' : 'cookie')}
        currentUser={currentUser}
        filter={filter} onFilterChange={setFilter}
        periodLabel={periodLabel}
        onPrev={() => navigate(-1)} onNext={() => navigate(1)} onToday={goToday}
        onCreate={() => openCreate(toISO(selectedDate))}
        onOpenCategories={() => setShowCategories(true)}
        authUser={user}
        onLogout={onLogout}
      />

      <main className="flex-1 px-2 sm:px-4 lg:px-6 pb-24 sm:pb-6 max-w-[1400px] w-full mx-auto">
        {view === 'month' && (
          <MonthView
            selectedDate={selectedDate} onSelectDate={setSelectedDate}
            events={filteredEvents} categories={categories}
            onDayClick={(d) => openCreate(toISO(d))}
            onEventClick={openEdit}
            onMoveEvent={moveEvent}
            editable={isEditor}
            theme={theme}
            now={now}
          />
        )}
        {view === 'week' && (
          <WeekView
            selectedDate={selectedDate} onSelectDate={setSelectedDate}
            events={filteredEvents} categories={categories}
            onDayClick={(d) => openCreate(toISO(d))}
            onEventClick={openEdit}
            onMoveEvent={moveEvent}
            editable={isEditor}
            theme={theme}
            now={now}
            onToggleDone={toggleDone}
          />
        )}
        {view === 'day' && (
          <DayView
            selectedDate={selectedDate}
            events={filteredEvents} categories={categories}
            onAdd={() => openCreate(toISO(selectedDate))}
            onEventClick={openEdit}
            theme={theme}
            now={now}
            onToggleDone={toggleDone}
          />
        )}
        {view === 'year' && (
          <YearView
            selectedDate={selectedDate}
            events={filteredEvents} categories={categories}
            onPickDate={(d) => { setSelectedDate(d); setView('day') }}
            onPickMonth={(d) => { setSelectedDate(d); setView('month') }}
          />
        )}
      </main>

      <MobileTabBar
        view={view} onViewChange={setView}
        onCreate={() => openCreate(toISO(selectedDate))}
      />

      {showEventModal && editingEvent && (
        <EventModal
          event={editingEvent}
          categories={categories}
          onClose={() => { setShowEventModal(false); setEditingEvent(null) }}
          onSave={saveEvent}
          onDelete={handleDelete}
          isNew={!events.some((e) => e.id === editingEvent.id)}
        />
      )}

      {showCategories && (
        <CategoriesPanel
          categories={categories}
          onChange={replaceCategories}
          onClose={() => setShowCategories(false)}
          events={events}
        />
      )}
    </div>
  )
}
