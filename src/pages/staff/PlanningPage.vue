<script setup lang="ts">
import { ref, computed } from 'vue'
import StaffDashboardLayout from '@/components/StaffDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'

type EventKind = 'training' | 'workshop' | 'event'

interface PEvent {
  id: number
  title: string
  kind: EventKind
  start: string // "YYYY-MM-DD HH:mm"
  duration: number // minutes
  location: string
  participants: number
}

const events = ref<PEvent[]>([
  {
    id: 1,
    title: 'Atelier upcycling débutant',
    kind: 'workshop',
    start: '2026-07-02 10:00',
    duration: 180,
    location: 'Atelier Paris 11',
    participants: 8,
  },
  {
    id: 2,
    title: 'Formation réemploi textile',
    kind: 'training',
    start: '2026-07-04 14:00',
    duration: 240,
    location: 'En ligne',
    participants: 12,
  },
  {
    id: 3,
    title: 'Repair Café mensuel',
    kind: 'event',
    start: '2026-07-05 09:30',
    duration: 300,
    location: 'Atelier Paris 11',
    participants: 20,
  },
  {
    id: 4,
    title: 'Restaurer un meuble en bois',
    kind: 'training',
    start: '2026-07-10 09:00',
    duration: 360,
    location: 'Atelier Paris 11',
    participants: 12,
  },
  {
    id: 5,
    title: 'Upcycling textile débutant',
    kind: 'workshop',
    start: '2026-07-15 14:00',
    duration: 180,
    location: 'Salle B',
    participants: 8,
  },
  {
    id: 6,
    title: 'Repair Café électronique',
    kind: 'workshop',
    start: '2026-07-22 10:00',
    duration: 240,
    location: 'Atelier Paris 11',
    participants: 15,
  },
])

const view = ref<'list' | 'week'>('week')

/* ── Date helpers ─────────────────────────────────────────────────────────── */

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
  const dow = (d.getDay() + 6) % 7 // Monday = 0
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

/* ── Week grid layout ─────────────────────────────────────────────────────── */

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

/* ── List view grouping ───────────────────────────────────────────────────── */

const monthFmt = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })

const sorted = computed(() =>
  [...datedEvents.value].sort((a, b) => a.start.localeCompare(b.start)),
)

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

/* ── Misc ─────────────────────────────────────────────────────────────────── */

const kindColor: Record<EventKind, string> = {
  training: 'var(--purple-500)',
  workshop: 'var(--lime-500)',
  event: 'var(--lime-300)',
}

const kindLabel: Record<EventKind, string> = {
  training: 'Formation',
  workshop: 'Atelier',
  event: 'Événement',
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
  a.download = 'upcycleconnect-planning-salarie.ics'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <StaffDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Mon planning</span>
        <h1>Planning des sessions</h1>
        <p class="muted measure">Vos formations, ateliers et événements à animer.</p>
      </div>
      <div class="layout-flex layout-gap-medium">
        <button class="ghost medium" @click="exportICS">Exporter (.ics)</button>
        <div class="planning-view-toggle">
          <button
            type="button"
            :class="{ 'is-active': view === 'week' }"
            @click="view = 'week'"
          >
            Agenda
          </button>
          <button
            type="button"
            :class="{ 'is-active': view === 'list' }"
            @click="view = 'list'"
          >
            Liste
          </button>
        </div>
      </div>
    </header>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-tile">
        <span class="stat-tile-label">Sessions à venir</span>
        <span class="stat-tile-value">{{ stats.upcoming }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">Cette semaine</span>
        <span class="stat-tile-value">{{ stats.thisWeek }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">Ce mois</span>
        <span class="stat-tile-value">{{ stats.thisMonth }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">Total {{ today.getFullYear() }}</span>
        <span class="stat-tile-value">{{ stats.year }}</span>
      </div>
    </div>

    <!-- Legend -->
    <div class="planning-legend">
      <span v-for="(label, kind) in kindLabel" :key="kind" class="planning-legend-item">
        <span class="planning-legend-dot" :style="{ backgroundColor: kindColor[kind] }"></span>
        {{ label }}
      </span>
    </div>

    <!-- Week / agenda view -->
    <section v-if="view === 'week'" class="planning-week">
      <div class="planning-week-toolbar">
        <div class="planning-week-nav">
          <button class="planning-nav-btn" title="Semaine précédente" @click="shiftWeek(-1)">
            ‹
          </button>
          <button class="ghost small" @click="goToday">Aujourd'hui</button>
          <button class="planning-nav-btn" title="Semaine suivante" @click="shiftWeek(1)">›</button>
        </div>
        <span class="planning-week-range">{{ weekRangeLabel }}</span>
      </div>

      <div class="planning-grid-wrap">
        <div class="planning-grid">
          <!-- Header row -->
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

          <!-- Body -->
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

    <!-- List view -->
    <section v-else class="layout-flex layout-columns layout-gap-extra-large">
      <p v-if="!sorted.length" class="muted">Aucune session planifiée.</p>
      <div v-for="(monthEvents, month) in groupedByMonth" :key="month">
        <h3 class="planning-month">{{ month }}</h3>
        <div class="layout-flex layout-columns layout-gap-small" style="margin-top: var(--space-3)">
          <article
            v-for="e in monthEvents"
            :key="e.id"
            class="planning-event-row"
            @click="detailEvent = e"
          >
            <span
              class="planning-event-bar"
              :style="{ backgroundColor: kindColor[e.kind] }"
            ></span>
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
              <div class="tiny muted">{{ e.location }} · {{ e.duration }} min · {{ e.participants }} participants</div>
            </div>
            <span class="ghost small">Détail →</span>
          </article>
        </div>
      </div>
    </section>

    <!-- Detail modal -->
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
          <span class="tiny uppercase muted">Date</span>
          <span>{{ detailEvent.start || 'Non planifié' }}</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">Durée</span>
          <span>{{ detailEvent.duration }} min</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">Lieu</span>
          <span>{{ detailEvent.location }}</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">Participants</span>
          <span>{{ detailEvent.participants }} inscrits</span>
        </div>
      </div>
      <template #footer>
        <button class="primary medium" @click="detailEvent = null">Fermer</button>
      </template>
    </AppModal>
  </StaffDashboardLayout>
</template>
