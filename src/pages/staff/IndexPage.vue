<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import StaffDashboardLayout from '@/components/StaffDashboardLayout.vue'
import { useTrainingStore } from '@/stores/trainingStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { getTrainingContents } from '@/services/training'

const { t } = useI18n()
const trainingStore = useTrainingStore()
const appointmentStore = useAppointmentStore()
const { trainings } = storeToRefs(trainingStore)
const { appointments } = storeToRefs(appointmentStore)

const adviceCount = ref(0)

const upcomingSessions = computed(() =>
  [...appointments.value]
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .slice(0, 5),
)

const stats = computed(() => ({
  sessions: appointments.value.length,
  trainings: trainings.value.length,
  advice: adviceCount.value,
}))

onMounted(async () => {
  trainingStore.fetchTrainings()
  appointmentStore.fetchAppointments()
  try {
    adviceCount.value = (await getTrainingContents()).length
  } catch {
    adviceCount.value = 0
  }
})
</script>

<template>
  <StaffDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">{{ t('staffHome.eyebrow') }}</span>
        <h1>{{ t('staffHome.greeting') }}</h1>
        <p class="muted measure">{{ t('staffHome.subtitle') }}</p>
      </div>
      <div class="layout-flex layout-gap-medium">
        <RouterLink to="/staff/trainings" class="ghost medium">{{ t('staffHome.actions.newTraining') }}</RouterLink>
        <RouterLink to="/staff/advice" class="primary medium">{{ t('staffHome.actions.newAdvice') }}</RouterLink>
      </div>
    </header>

    <div class="stats-row">
      <RouterLink to="/staff/planning" class="stat-tile">
        <span class="stat-tile-label">{{ t('staffHome.stats.sessions.label') }}</span>
        <span class="stat-tile-value">{{ stats.sessions }}</span>
        <p class="small muted">{{ t('staffHome.stats.sessions.hint') }}</p>
      </RouterLink>

      <RouterLink to="/staff/trainings" class="stat-tile">
        <span class="stat-tile-label">{{ t('staffHome.stats.trainings.label') }}</span>
        <span class="stat-tile-value">{{ stats.trainings }}</span>
        <p class="small muted">{{ t('staffHome.stats.trainings.hint') }}</p>
      </RouterLink>

      <RouterLink to="/staff/advice" class="stat-tile">
        <span class="stat-tile-label">{{ t('staffHome.stats.advice.label') }}</span>
        <span class="stat-tile-value">{{ stats.advice }}</span>
        <p class="small muted">{{ t('staffHome.stats.advice.hint') }}</p>
      </RouterLink>
    </div>

    <div class="dashboard-grid">
      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">{{ t('staffHome.planning.eyebrow') }}</span>
          <h3>{{ t('staffHome.planning.title') }}</h3>
        </div>
        <p v-if="!upcomingSessions.length" class="small muted">{{ t('staffHome.planning.empty') }}</p>
        <ul v-else class="layout-flex layout-columns layout-gap-medium">
          <li v-for="e in upcomingSessions" :key="e.id" class="event-row">
            <div class="event-row-date">
              <span class="tiny uppercase muted">{{ e.kind }}</span>
              <span style="font-weight: 700">{{ (e.starts_at ?? '').slice(0, 16) }}</span>
            </div>
            <div style="flex: 1">
              <div style="font-weight: 600">{{ e.title }}</div>
              <div class="tiny muted">{{ e.location }}</div>
            </div>
          </li>
        </ul>
        <RouterLink to="/staff/planning" class="ghost small" style="align-self: flex-start">
          {{ t('staffHome.planning.viewLink') }}
        </RouterLink>
      </article>

      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">{{ t('staffHome.shortcuts.eyebrow') }}</span>
          <h3>{{ t('staffHome.shortcuts.title') }}</h3>
        </div>
        <ul class="layout-flex layout-columns layout-gap-medium">
          <li class="advice-mini">
            <span style="font-weight: 600">{{ t('staffHome.shortcuts.trainingItem') }}</span>
            <RouterLink to="/staff/trainings" class="ghost small">{{ t('staffHome.shortcuts.open') }}</RouterLink>
          </li>
          <li class="advice-mini">
            <span style="font-weight: 600">{{ t('staffHome.shortcuts.adviceItem') }}</span>
            <RouterLink to="/staff/advice" class="ghost small">{{ t('staffHome.shortcuts.open') }}</RouterLink>
          </li>
          <li class="advice-mini">
            <span style="font-weight: 600">{{ t('staffHome.shortcuts.moderationItem') }}</span>
            <RouterLink to="/staff/moderation" class="ghost small">{{ t('staffHome.shortcuts.open') }}</RouterLink>
          </li>
        </ul>
      </article>
    </div>
  </StaffDashboardLayout>
</template>
