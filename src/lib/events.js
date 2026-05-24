import {
  parseISO, format, addDays, addWeeks, addMonths, addYears,
  isBefore, isAfter, differenceInCalendarDays,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval,
} from 'date-fns'

export const toISO = (date) => format(date, 'yyyy-MM-dd')
export const fromISO = (s) => parseISO(s)

export function newEvent(partial = {}) {
  const today = toISO(new Date())
  return {
    id: cryptoId(),
    title: '',
    description: '',
    categoryId: '',
    owner: 'shared',
    startDate: today,
    endDate: today,
    timeStart: null,
    timeEnd: null,
    recurrence: { type: 'none', interval: 1, until: null },
    createdAt: new Date().toISOString(),
    createdBy: null,
    ...partial,
  }
}

function cryptoId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function expandEvent(event, fromISO_, toISO_) {
  if (!event || !event.startDate) return []
  const rangeFrom = parseISO(fromISO_)
  const rangeTo = parseISO(toISO_)

  const start = parseISO(event.startDate)
  const end = event.endDate ? parseISO(event.endDate) : start
  const durationDays = Math.max(0, differenceInCalendarDays(end, start))

  const rec = event.recurrence || { type: 'none', interval: 1, until: null }
  const interval = Math.max(1, rec.interval || 1)
  const until = rec.until ? parseISO(rec.until) : null

  const instances = []
  let cursor = start
  let safety = 0
  const SAFETY_LIMIT = 5000

  while (safety++ < SAFETY_LIMIT) {
    const occStart = cursor
    const occEnd = addDays(occStart, durationDays)
    if (until && isAfter(occStart, until)) break
    if (isAfter(occStart, rangeTo)) break
    const overlaps = !isAfter(occStart, rangeTo) && !isBefore(occEnd, rangeFrom)
    if (overlaps) {
      instances.push({ event, date: toISO(occStart), endDate: toISO(occEnd), durationDays })
    }
    if (rec.type === 'none') break
    if (rec.type === 'weekly') cursor = addWeeks(cursor, interval)
    else if (rec.type === 'monthly') cursor = addMonths(cursor, interval)
    else if (rec.type === 'yearly') cursor = addYears(cursor, interval)
    else break
  }
  return instances
}

export function expandAll(events, fromISO_, toISO_) {
  const result = []
  for (const ev of events) result.push(...expandEvent(ev, fromISO_, toISO_))
  return result
}

export function eventsByDay(events, fromISO_, toISO_) {
  const instances = expandAll(events, fromISO_, toISO_)
  const map = {}
  const rangeFrom = parseISO(fromISO_)
  const rangeTo = parseISO(toISO_)
  for (const inst of instances) {
    const start = parseISO(inst.date)
    const end = parseISO(inst.endDate)
    const realStart = isBefore(start, rangeFrom) ? rangeFrom : start
    const realEnd = isAfter(end, rangeTo) ? rangeTo : end
    const days = eachDayOfInterval({ start: realStart, end: realEnd })
    for (const d of days) {
      const key = toISO(d)
      if (!map[key]) map[key] = []
      map[key].push(inst)
    }
  }
  return map
}

export function recurrenceLabel(rec) {
  if (!rec || rec.type === 'none') return 'Sin repetición'
  const every = rec.interval > 1 ? 'cada ' + rec.interval + ' ' : ''
  const map = {
    weekly: every ? every + 'semanas' : 'Semanalmente',
    monthly: every ? every + 'meses' : 'Mensualmente',
    yearly: every ? every + 'años' : 'Anualmente',
  }
  const base = map[rec.type] || ''
  return rec.until ? base + ' hasta ' + formatDayMonthYear(rec.until) : base
}

export function formatDayMonthYear(iso) {
  return format(parseISO(iso), 'd/MM/yyyy')
}

export function shiftEventByDays(event, deltaDays) {
  if (!deltaDays) return event
  const shifted = {
    ...event,
    startDate: toISO(addDays(parseISO(event.startDate), deltaDays)),
    endDate:   toISO(addDays(parseISO(event.endDate),   deltaDays)),
  }
  if (event.recurrence && event.recurrence.until) {
    shifted.recurrence = {
      ...event.recurrence,
      until: toISO(addDays(parseISO(event.recurrence.until), deltaDays)),
    }
  }
  return shifted
}

export function daysBetween(fromISOStr, toISOStr) {
  return differenceInCalendarDays(parseISO(toISOStr), parseISO(fromISOStr))
}

export function monthGridDays(referenceDate) {
  const start = startOfWeek(startOfMonth(referenceDate), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(referenceDate), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function weekDays(referenceDate) {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

// === Estado de una tarea/evento en una fecha concreta ===
// Devuelve: 'done' | 'in_progress' | 'pending'
//
// - 'done'        → la fecha está en event.doneInstances
// - 'in_progress' → es hoy y la hora actual está dentro del rango timeStart..timeEnd
// - 'pending'     → cualquier otro caso (futuro, pasado sin marcar, sin hora)
export function getEventState(event, dateISO, now) {
  const n = now || new Date()
  const list = event.doneInstances || []
  if (list.indexOf(dateISO) >= 0) return 'done'

  const todayISO = toISO(n)
  if (dateISO === todayISO && event.timeStart && event.timeEnd) {
    const startMin = timeToMinutes(event.timeStart)
    const endMin   = timeToMinutes(event.timeEnd)
    const nowMin   = n.getHours() * 60 + n.getMinutes()
    if (nowMin >= startMin && nowMin <= endMin) return 'in_progress'
  }
  return 'pending'
}

function timeToMinutes(hhmm) {
  if (!hhmm) return 0
  const parts = hhmm.split(':')
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
}

// Alterna la marca de "hecho" para una instancia concreta de un evento.
export function toggleDoneInstance(event, dateISO) {
  const list = event.doneInstances || []
  const has = list.indexOf(dateISO) >= 0
  return {
    ...event,
    doneInstances: has ? list.filter((d) => d !== dateISO) : list.concat([dateISO]),
  }
}
