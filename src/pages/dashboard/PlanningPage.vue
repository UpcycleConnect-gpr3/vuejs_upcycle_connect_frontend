<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'
import { getEventSteps } from '@/services/upcycle'
import { getSchedules } from '@/services/training'
import { useToastsStore } from '@/stores/toasts'

const toasts = useToastsStore()

type EventKind = 'training' | 'workshop' | 'event' | 'deposit'

interface PEvent {
  id: number
  title: string
  kind: EventKind
  start: string // ISO
  duration: number
  location: string
}

const events = ref<PEvent[]>([
  {
    id: 1,
    title: 'Atelier upcycling N1',
    kind: 'workshop',
    start: '2026-05-12 14:00',
    duration: 180,
    location: 'Atelier Paris 11',
  },
  {
    id: 2,
    title: 'Restaurer un meuble',
    kind: 'training',
    start: '2026-05-20 10:00',
    duration: 360,
    location: 'Atelier Paris 11',
  },
  {
    id: 3,
    title: 'Repair Café',
    kind: 'event',
    start: '2026-04-30 10:00',
    duration: 240,
    location: 'Atelier Paris 11',
  },
  {
    id: 4,
    title: 'Dépôt DEP-204',
    kind: 'deposit',
    start: '2026-04-29 16:00',
    duration: 30,
    location: 'Conteneur Bastille',
  },
])

const view = ref<'list' | 'week'>('list')

onMounted(async () => {
  const collected: PEvent[] = []
  try {
    const steps = await getEventSteps()
    for (const s of steps ?? []) {
      collected.push({
        id: Number(s.id),
        title: s.title ?? 'Événement',
        kind: 'event',
        start: (s.start_at as string) ?? '',
        duration: (s.duration as number) ?? 60,
        location: (s.location as string) ?? '',
      })
    }
  } catch {
    toasts.error('Événements indisponibles, affichage des données de démonstration.')
  }
  try {
    const schedules = await getSchedules()
    // The Go ContentSchedule model has no absolute datetime or location; only a
    // relative day_number and a string duration. Surface day_number as the label.
    for (const s of schedules ?? []) {
      collected.push({
        id: Number(s.id) + 100000,
        title: s.title ?? 'Formation',
        kind: 'training',
        start: '',
        duration: Number(s.duration) || 120,
        location: `Jour ${s.day_number ?? 1}`,
      })
    }
  } catch {
    // keep mock + event steps
  }
  if (collected.length) events.value = collected
})

const sorted = computed(() => [...events.value].sort((a, b) => a.start.localeCompare(b.start)))

const groupedByMonth = computed(() => {
  const map: Record<string, PEvent[]> = {}
  for (const e of sorted.value) {
    const m = e.start.slice(0, 7)
    if (!map[m]) map[m] = []
    map[m].push(e)
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
  training: 'Formation',
  workshop: 'Atelier',
  event: 'Événement',
  deposit: 'Dépôt',
}

const detailEvent = ref<PEvent | null>(null)

function unsubscribe() {
  if (!detailEvent.value) return
  events.value = events.value.filter((e) => e.id !== detailEvent.value!.id)
  detailEvent.value = null
}

function exportICS() {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UpcycleConnect//EN',
    ...events.value.flatMap((e) => [
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
        <span class="eyebrow">Mon planning</span>
        <h1>Planning personnel</h1>
        <p class="muted measure">
          Vos formations, ateliers, événements et rendez-vous de dépôt à venir.
        </p>
      </div>
      <div class="layout-flex layout-gap-medium">
        <button class="ghost medium" @click="exportICS">Exporter (.ics)</button>
        <button class="ghost medium" @click="view = view === 'list' ? 'week' : 'list'">
          Vue {{ view === 'list' ? 'agenda' : 'liste' }}
        </button>
      </div>
    </header>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-tile">
        <span class="stat-tile-label">À venir</span>
        <span class="stat-tile-value">{{ events.length }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">Cette semaine</span>
        <span class="stat-tile-value">2</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">Ce mois</span>
        <span class="stat-tile-value">{{
          events.filter((e) => e.start.startsWith('2026-05')).length
        }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">Total 2026</span>
        <span class="stat-tile-value">{{ events.length + 6 }}</span>
      </div>
    </div>

    <!-- List view -->
    <section v-if="view === 'list'" class="layout-flex layout-columns layout-gap-extra-large">
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
              <div class="tiny muted">{{ e.location }} · {{ e.duration }} min</div>
            </div>
            <span class="ghost small">Détail →</span>
          </article>
        </div>
      </div>
    </section>

    <!-- Week placeholder -->
    <section v-else class="dashboard-card center" style="padding: var(--space-16)">
      <p class="muted">
        Vue agenda hebdomadaire (réutilise la grille `.planning-grid` du backoffice)
      </p>
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
          <span class="tiny uppercase muted">Date</span><span>{{ detailEvent.start }}</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">Durée</span><span>{{ detailEvent.duration }} min</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">Lieu</span><span>{{ detailEvent.location }}</span>
        </div>
      </div>
      <template #footer>
        <button class="ghost medium" style="color: var(--destructive-color)" @click="unsubscribe">
          Se désinscrire
        </button>
        <button class="primary medium" @click="detailEvent = null">Fermer</button>
      </template>
    </AppModal>
  </DashboardLayout>
</template>
