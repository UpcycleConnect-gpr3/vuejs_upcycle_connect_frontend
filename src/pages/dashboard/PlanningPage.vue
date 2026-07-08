<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/components/DashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'
import { getEventSteps } from '@/services/upcycle'
import { getSchedules } from '@/services/training'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { useToastsStore } from '@/stores/toasts'
import type { Appointment } from '@/types'

const toasts = useToastsStore()
const appointmentStore = useAppointmentStore()
const { t } = useI18n()

const APPOINTMENT_ID_OFFSET = 200000
const KIND_VALUES = ['training', 'workshop', 'event', 'deposit'] as const

function appointmentToEvent(a: Appointment): PEvent {
  const start = (a.starts_at ?? '').replace('T', ' ').slice(0, 16)
  const startDate = new Date(a.starts_at.replace(' ', 'T'))
  const endDate = new Date(a.ends_at.replace(' ', 'T'))
  const duration = Math.max(15, Math.round((endDate.getTime() - startDate.getTime()) / 60000) || 60)
  return {
    id: APPOINTMENT_ID_OFFSET + a.id,
    title: a.title,
    kind: (KIND_VALUES as readonly string[]).includes(a.kind) ? (a.kind as EventKind) : 'event',
    start,
    duration,
    location: a.location,
  }
}

type EventKind = 'training' | 'workshop' | 'event' | 'deposit'

interface PEvent {
  id: number
  title: string
  kind: EventKind
  start: string
  duration: number
  location: string
}

const events = ref<PEvent[]>([
  {
    id: 1,
    title: t('dashPlanning.demo.1.title'),
    kind: 'workshop',
    start: '2026-05-12 14:00',
    duration: 180,
    location: t('dashPlanning.demo.1.location'),
  },
  {
    id: 2,
    title: t('dashPlanning.demo.2.title'),
    kind: 'training',
    start: '2026-05-20 10:00',
    duration: 360,
    location: t('dashPlanning.demo.2.location'),
  },
  {
    id: 3,
    title: t('dashPlanning.demo.3.title'),
    kind: 'event',
    start: '2026-04-30 10:00',
    duration: 240,
    location: t('dashPlanning.demo.3.location'),
  },
  {
    id: 4,
    title: t('dashPlanning.demo.4.title'),
    kind: 'deposit',
    start: '2026-04-29 16:00',
    duration: 30,
    location: t('dashPlanning.demo.4.location'),
  },
  {
    id: 5,
    title: t('dashPlanning.demo.5.title'),
    kind: 'training',
    start: '2026-05-12 16:30',
    duration: 90,
    location: t('dashPlanning.demo.5.location'),
  },
])

const view = ref<'list' | 'week'>('week')

onMounted(async () => {
  const collected: PEvent[] = []
  try {
    const steps = await getEventSteps()
    for (const s of steps ?? []) {
      collected.push({
        id: Number(s.id),
        title: ((s.name as string) || (s.title as string)) ?? t('dashPlanning.kinds.event'),
        kind: 'event',
        start: (((s.scheduled_at as string) || (s.start_at as string)) ?? '')
          .replace('T', ' ')
          .slice(0, 16),
        duration: (s.duration as number) ?? 60,
        location: (s.location as string) ?? '',
      })
    }
  } catch {
    toasts.error(t('dashPlanning.toastEventsUnavailable'))
  }
  try {
    await appointmentStore.fetchAppointments()
    for (const a of appointmentStore.appointments) {
      collected.push(appointmentToEvent(a))
    }
  } catch {
    toasts.error(t('dashPlanning.toastAppointmentsUnavailable'))
  }
  try {
    const schedules = await getSchedules()
    for (const s of schedules ?? []) {
      collected.push({
        id: Number(s.id) + 100000,
        title: s.title ?? t('dashPlanning.kinds.training'),
        kind: 'training',
        start: '',
        duration: Number(s.duration) || 120,
        location: t('dashPlanning.dayNumber', { day: s.day_number ?? 1 }),
      })
    }
  } catch {}
  if (collected.length) {
    events.value = collected
    jumpToFirstEvent()
  }
})

function parseStart(s: string): Date | null {
  if (!s) return null
  const [datePart, timePart] = s.replace('T', ' ').split(' ')
  const [y, mo, d] = (datePart ?? '').split('-').map(Number)
  if (!y || !mo || !d) return null
  const [h, mi] = (timePart ?? '00:00').split(':').map(Number)
  return new Date(y, mo - 1, d, h || 0, mi || 0)
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const dow = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - dow)
  d.setHours(0, 0, 0, 0)
  return d
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const today = new Date()

const datedEvents = computed(() => events.value.filter((e) => parseStart(e.start)))
const undatedEvents = computed(() => events.value.filter((e) => !parseStart(e.start)))

function jumpToFirstEvent() {
  const first = datedEvents.value
    .map((e) => parseStart(e.start)!)
    .sort((a, b) => a.getTime() - b.getTime())[0]
  currentWeekStart.value = startOfWeek(first ?? today)
}

const currentWeekStart = ref(startOfWeek(today))
jumpToFirstEvent()

function shiftWeek(delta: number) {
  const d = new Date(currentWeekStart.value)
  d.setDate(d.getDate() + delta * 7)
  currentWeekStart.value = d
}

function goToday() {
  currentWeekStart.value = startOfWeek(today)
}

const dayFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' })
const rangeFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })
const rangeFmtFull = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const weekRangeLabel = computed(() => {
  const start = currentWeekStart.value
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return `${rangeFmt.format(start)} – ${rangeFmtFull.format(end)}`
})

const DAY_START_HOUR = 7
const DAY_END_HOUR = 21
const HOUR_HEIGHT = 52

const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i)
const gridHeight = hours.length * HOUR_HEIGHT

interface PlacedEvent {
  event: PEvent
  top: number
  height: number
  leftPct: number
  widthPct: number
}

function layoutDay(dayEvents: PEvent[]): PlacedEvent[] {
  const items = dayEvents
    .map((e) => {
      const d = parseStart(e.start)!
      const startMin = d.getHours() * 60 + d.getMinutes()
      return { e, startMin, endMin: startMin + e.duration, col: 0, total: 1 }
    })
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin)

  let cluster: typeof items = []
  let clusterEnd = -1
  const finalize = () => {
    if (!cluster.length) return
    const colEnds: number[] = []
    for (const it of cluster) {
      let c = colEnds.findIndex((end) => end <= it.startMin)
      if (c === -1) {
        c = colEnds.length
        colEnds.push(it.endMin)
      } else {
        colEnds[c] = it.endMin
      }
      it.col = c
    }
    for (const it of cluster) it.total = colEnds.length
    cluster = []
    clusterEnd = -1
  }
  for (const it of items) {
    if (cluster.length && it.startMin >= clusterEnd) finalize()
    cluster.push(it)
    clusterEnd = Math.max(clusterEnd, it.endMin)
  }
  finalize()

  const base = DAY_START_HOUR * 60
  return items.map((it) => ({
    event: it.e,
    top: ((it.startMin - base) / 60) * HOUR_HEIGHT,
    height: Math.max(((it.endMin - it.startMin) / 60) * HOUR_HEIGHT - 2, 24),
    leftPct: (it.col / it.total) * 100,
    widthPct: (1 / it.total) * 100,
  }))
}

const weekColumns = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart.value)
    date.setDate(date.getDate() + i)
    const dayEvents = datedEvents.value.filter((e) => sameDay(parseStart(e.start)!, date))
    return {
      iso: date.toISOString().slice(0, 10),
      dayName: dayFmt.format(date).replace('.', ''),
      dayNum: date.getDate(),
      isToday: sameDay(date, today),
      events: layoutDay(dayEvents),
    }
  })
})

const monthFmt = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })

const sorted = computed(() => [...datedEvents.value].sort((a, b) => a.start.localeCompare(b.start)))

const groupedByMonth = computed(() => {
  const map: Record<string, PEvent[]> = {}
  for (const e of sorted.value) {
    const d = parseStart(e.start)!
    const key = monthFmt.format(d)
    if (!map[key]) map[key] = []
    map[key].push(e)
  }
  return map
})

const kindColor: Record<EventKind, string> = {
  training: 'var(--purple-500)',
  workshop: 'var(--lime-500)',
  event: 'var(--lime-300)',
  deposit: 'var(--text-tertiary)',
}

const kindLabel: Record<EventKind, string> = {
  training: t('dashPlanning.kinds.training'),
  workshop: t('dashPlanning.kinds.workshop'),
  event: t('dashPlanning.kinds.event'),
  deposit: t('dashPlanning.kinds.deposit'),
}

function eventStyle(p: PlacedEvent) {
  const color = kindColor[p.event.kind]
  return {
    top: `${p.top}px`,
    height: `${p.height}px`,
    left: `calc(${p.leftPct}% + 2px)`,
    width: `calc(${p.widthPct}% - 4px)`,
    borderLeft: `3px solid ${color}`,
    background: `color-mix(in oklch, ${color} 16%, var(--surface-3))`,
  }
}

const stats = computed(() => {
  const weekStart = startOfWeek(today)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  return {
    upcoming: events.value.length,
    thisWeek: datedEvents.value.filter((e) => {
      const d = parseStart(e.start)!
      return d >= weekStart && d < weekEnd
    }).length,
    thisMonth: datedEvents.value.filter((e) => e.start.startsWith(monthKey)).length,
    year: datedEvents.value.filter((e) => e.start.startsWith(String(today.getFullYear()))).length,
  }
})

const detailEvent = ref<PEvent | null>(null)

const showAdd = ref(false)
const isSaving = ref(false)
const addForm = reactive({
  title: '',
  kind: 'event' as EventKind,
  date: '',
  duration: 60,
  location: '',
})

async function submitAdd() {
  if (!addForm.title.trim() || !addForm.date) return
  isSaving.value = true
  const startsAt = addForm.date.replace('T', ' ') + ':00'
  const endDate = new Date(new Date(addForm.date).getTime() + addForm.duration * 60000)
  const pad = (n: number) => String(n).padStart(2, '0')
  const endsAt = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())} ${pad(endDate.getHours())}:${pad(endDate.getMinutes())}:00`
  const created = await appointmentStore.addAppointment({
    title: addForm.title.trim(),
    kind: addForm.kind,
    location: addForm.location.trim(),
    starts_at: startsAt,
    ends_at: endsAt,
  })
  isSaving.value = false
  if (created) {
    const newEvent = appointmentToEvent(created)
    events.value.push(newEvent)
    const startDate = parseStart(newEvent.start)
    if (startDate) currentWeekStart.value = startOfWeek(startDate)
    view.value = 'week'
    toasts.success(t('dashPlanning.toastAppointmentAdded'))
    showAdd.value = false
    Object.assign(addForm, { title: '', kind: 'event', date: '', duration: 60, location: '' })
  } else {
    toasts.error(appointmentStore.error ?? t('dashPlanning.toastAddError'))
  }
}

async function unsubscribe() {
  if (!detailEvent.value) return
  const removedId = detailEvent.value.id
  if (removedId >= APPOINTMENT_ID_OFFSET) {
    const ok = await appointmentStore.removeAppointment(removedId - APPOINTMENT_ID_OFFSET)
    if (!ok) return
  }
  events.value = events.value.filter((e) => e.id !== removedId)
  toasts.success(t('dashPlanning.toastUnsubscribed'))
  detailEvent.value = null
}

function exportICS() {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UpcycleConnect//EN',
    ...datedEvents.value.flatMap((e) => [
      'BEGIN:VEVENT',
      `UID:${e.id}@upcycleconnect`,
      `SUMMARY:${e.title}`,
      `DTSTART:${e.start.replace(/[-:]/g, '').replace(' ', 'T')}00`,
      `LOCATION:${e.location}`,
      'END:VEVENT',
    ]),
    'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'upcycleconnect-planning.ics'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <DashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">{{ $t('dashPlanning.eyebrow') }}</span>
        <h1>{{ $t('dashPlanning.title') }}</h1>
        <p class="muted measure">
          {{ $t('dashPlanning.subtitle') }}
        </p>
      </div>
      <div class="layout-flex layout-gap-medium">
        <button class="ghost medium" @click="exportICS">{{ $t('dashPlanning.exportIcs') }}</button>
        <button class="primary medium" @click="showAdd = true">{{ $t('dashPlanning.add') }}</button>
        <div class="planning-view-toggle">
          <button type="button" :class="{ 'is-active': view === 'week' }" @click="view = 'week'">
            {{ $t('dashPlanning.agenda') }}
          </button>
          <button type="button" :class="{ 'is-active': view === 'list' }" @click="view = 'list'">
            {{ $t('dashPlanning.list') }}
          </button>
        </div>
      </div>
    </header>

    <div class="stats-row">
      <div class="stat-tile">
        <span class="stat-tile-label">{{ $t('dashPlanning.stats.upcoming') }}</span>
        <span class="stat-tile-value">{{ stats.upcoming }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">{{ $t('dashPlanning.stats.thisWeek') }}</span>
        <span class="stat-tile-value">{{ stats.thisWeek }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">{{ $t('dashPlanning.stats.thisMonth') }}</span>
        <span class="stat-tile-value">{{ stats.thisMonth }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">{{ $t('dashPlanning.stats.totalYear', { year: today.getFullYear() }) }}</span>
        <span class="stat-tile-value">{{ stats.year }}</span>
      </div>
    </div>

    <div class="planning-legend">
      <span v-for="(label, kind) in kindLabel" :key="kind" class="planning-legend-item">
        <span class="planning-legend-dot" :style="{ backgroundColor: kindColor[kind] }"></span>
        {{ label }}
      </span>
    </div>

    <section v-if="view === 'week'" class="planning-week">
      <div class="planning-week-toolbar">
        <div class="planning-week-nav">
          <button class="planning-nav-btn" :title="$t('dashPlanning.previousWeek')" @click="shiftWeek(-1)">
            ‹
          </button>
          <button class="ghost small" @click="goToday">{{ $t('dashPlanning.today') }}</button>
          <button class="planning-nav-btn" :title="$t('dashPlanning.nextWeek')" @click="shiftWeek(1)">›</button>
        </div>
        <span class="planning-week-range">{{ weekRangeLabel }}</span>
      </div>

      <div v-if="undatedEvents.length" class="planning-undated">
        <span class="tiny uppercase muted">{{ $t('dashPlanning.noTimeSet') }}</span>
        <div class="planning-undated-list">
          <button
            v-for="e in undatedEvents"
            :key="e.id"
            class="planning-chip"
            :style="{ borderLeftColor: kindColor[e.kind] }"
            @click="detailEvent = e"
          >
            {{ e.title }} · {{ kindLabel[e.kind] }}
          </button>
        </div>
      </div>

      <div class="planning-grid-wrap">
        <div class="planning-grid">
          <div class="planning-grid-head">
            <div class="planning-time-gutter"></div>
            <div
              v-for="d in weekColumns"
              :key="d.iso"
              class="planning-day-head"
              :class="{ 'is-today': d.isToday }"
            >
              <span class="planning-day-name">{{ d.dayName }}</span>
              <span class="planning-day-num">{{ d.dayNum }}</span>
            </div>
          </div>

          <div class="planning-grid-body" :style="{ height: gridHeight + 'px' }">
            <div class="planning-time-gutter">
              <div
                v-for="h in hours"
                :key="h"
                class="planning-hour-label"
                :style="{ height: HOUR_HEIGHT + 'px' }"
              >
                <span>{{ h }}h</span>
              </div>
            </div>

            <div
              v-for="d in weekColumns"
              :key="d.iso"
              class="planning-day-col"
              :class="{ 'is-today': d.isToday }"
            >
              <div
                v-for="h in hours"
                :key="h"
                class="planning-hour-line"
                :style="{ height: HOUR_HEIGHT + 'px' }"
              ></div>

              <button
                v-for="item in d.events"
                :key="item.event.id"
                class="planning-event"
                :style="eventStyle(item)"
                @click="detailEvent = item.event"
              >
                <span class="planning-event-time">{{ item.event.start.slice(11, 16) }}</span>
                <span class="planning-event-title">{{ item.event.title }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="layout-flex layout-columns layout-gap-extra-large">
      <p v-if="!sorted.length" class="muted">{{ $t('dashPlanning.noEventsPlanned') }}</p>
      <div v-for="(monthEvents, month) in groupedByMonth" :key="month">
        <h3 class="planning-month">{{ month }}</h3>
        <div class="layout-flex layout-columns layout-gap-small" style="margin-top: var(--space-3)">
          <article
            v-for="e in monthEvents"
            :key="e.id"
            class="planning-event-row"
            @click="detailEvent = e"
          >
            <span class="planning-event-bar" :style="{ backgroundColor: kindColor[e.kind] }"></span>
            <div class="planning-event-row-date">
              <span style="font-weight: 700; font-size: var(--font-size-xlarge)">{{
                e.start.slice(8, 10)
              }}</span>
              <span class="tiny muted uppercase">{{ e.start.slice(11, 16) }}</span>
            </div>
            <div style="flex: 1">
              <div class="layout-flex layout-gap-small layout-items-center">
                <span class="badge">{{ kindLabel[e.kind] }}</span>
              </div>
              <div style="font-weight: 600; margin-top: 2px">{{ e.title }}</div>
              <div class="tiny muted">{{ $t('dashPlanning.locationDuration', { location: e.location, duration: e.duration }) }}</div>
            </div>
            <span class="ghost small">{{ $t('dashPlanning.detail') }} </span>
          </article>
        </div>
      </div>
    </section>

    <AppModal
      :open="!!detailEvent"
      :title="detailEvent?.title"
      size="small"
      @close="detailEvent = null"
    >
      <div v-if="detailEvent" class="layout-flex layout-columns layout-gap-medium">
        <div class="layout-flex layout-gap-small layout-items-center">
          <span class="badge">{{ kindLabel[detailEvent.kind] }}</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">{{ $t('dashPlanning.date') }}</span
          ><span>{{ detailEvent.start || $t('dashPlanning.notPlanned') }}</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">{{ $t('dashPlanning.duration') }}</span><span>{{ $t('dashPlanning.minutes', { count: detailEvent.duration }) }}</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">{{ $t('dashPlanning.location') }}</span><span>{{ detailEvent.location }}</span>
        </div>
      </div>
      <template #footer>
        <button class="ghost medium" style="color: var(--destructive-color)" @click="unsubscribe">
          {{ $t('dashPlanning.unsubscribe') }}
        </button>
        <button class="primary medium" @click="detailEvent = null">{{ $t('dashPlanning.closeModal') }}</button>
      </template>
    </AppModal>
    <AppModal :open="showAdd" :title="$t('dashPlanning.addModalTitle')" @close="showAdd = false">
      <form
        id="add-appointment-form"
        class="layout-flex layout-columns layout-gap-medium"
        @submit.prevent="submitAdd"
      >
        <div class="form-group">
          <label class="uppercase">{{ $t('dashPlanning.form.titleLabel') }}</label>
          <input v-model="addForm.title" type="text" class="primary medium full-width" required />
        </div>
        <div class="layout-flex layout-gap-medium">
          <div class="form-group" style="flex: 1">
            <label class="uppercase">{{ $t('dashPlanning.form.type') }}</label>
            <select v-model="addForm.kind" class="primary medium full-width">
              <option value="event">{{ $t('dashPlanning.kinds.event') }}</option>
              <option value="training">{{ $t('dashPlanning.kinds.training') }}</option>
              <option value="workshop">{{ $t('dashPlanning.kinds.workshop') }}</option>
              <option value="deposit">{{ $t('dashPlanning.kinds.deposit') }}</option>
            </select>
          </div>
          <div class="form-group" style="flex: 1">
            <label class="uppercase">{{ $t('dashPlanning.form.durationLabel') }}</label>
            <input
              v-model.number="addForm.duration"
              type="number"
              min="15"
              step="15"
              class="primary medium full-width"
              required
            />
          </div>
        </div>
        <div class="form-group">
          <label class="uppercase">{{ $t('dashPlanning.form.dateTime') }}</label>
          <input v-model="addForm.date" type="datetime-local" class="primary medium full-width" required />
        </div>
        <div class="form-group">
          <label class="uppercase">{{ $t('dashPlanning.location') }}</label>
          <input v-model="addForm.location" type="text" class="primary medium full-width" />
        </div>
        <p v-if="appointmentStore.error" class="small" style="color: var(--destructive-color)">
          {{ appointmentStore.error }}
        </p>
      </form>
      <template #footer>
        <button class="ghost medium" @click="showAdd = false">{{ $t('common.cancel') }}</button>
        <button
          type="submit"
          form="add-appointment-form"
          class="primary medium"
          :disabled="isSaving || !addForm.title.trim() || !addForm.date"
        >
          {{ isSaving ? $t('dashPlanning.saving') : $t('dashPlanning.add') }}
        </button>
      </template>
    </AppModal>
  </DashboardLayout>
</template>
