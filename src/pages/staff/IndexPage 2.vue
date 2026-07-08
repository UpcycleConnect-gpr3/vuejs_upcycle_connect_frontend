<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import StaffDashboardLayout from '@/components/StaffDashboardLayout.vue'
import { useTrainingStore } from '@/stores/trainingStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { getTrainingContents } from '@/services/training'

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
        <span class="eyebrow">Tableau de bord</span>
        <h1>Bonjour </h1>
        <p class="muted measure">Voici un aperçu de vos activités d'animation et de contenu.</p>
      </div>
      <div class="layout-flex layout-gap-medium">
        <RouterLink to="/staff/trainings" class="ghost medium">+ Créer une formation</RouterLink>
        <RouterLink to="/staff/advice" class="primary medium">+ Rédiger un conseil</RouterLink>
      </div>
    </header>

    <div class="stats-row">
      <RouterLink to="/staff/planning" class="stat-tile">
        <span class="stat-tile-label">Sessions planifiées</span>
        <span class="stat-tile-value">{{ stats.sessions }}</span>
        <p class="small muted">à animer</p>
      </RouterLink>

      <RouterLink to="/staff/trainings" class="stat-tile">
        <span class="stat-tile-label">Formations</span>
        <span class="stat-tile-value">{{ stats.trainings }}</span>
        <p class="small muted">au catalogue</p>
      </RouterLink>

      <RouterLink to="/staff/advice" class="stat-tile">
        <span class="stat-tile-label">Conseils publiés</span>
        <span class="stat-tile-value">{{ stats.advice }}</span>
        <p class="small muted">ressources</p>
      </RouterLink>
    </div>

    <div class="dashboard-grid">
      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">Planning</span>
          <h3>Prochaines sessions à animer</h3>
        </div>
        <p v-if="!upcomingSessions.length" class="small muted">Aucune session planifiée.</p>
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
          Voir mon planning
        </RouterLink>
      </article>

      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">Raccourcis</span>
          <h3>Gérer mes contenus</h3>
        </div>
        <ul class="layout-flex layout-columns layout-gap-medium">
          <li class="advice-mini">
            <span style="font-weight: 600">Créer une formation ou un atelier</span>
            <RouterLink to="/staff/trainings" class="ghost small">Ouvrir </RouterLink>
          </li>
          <li class="advice-mini">
            <span style="font-weight: 600">Rédiger un conseil</span>
            <RouterLink to="/staff/advice" class="ghost small">Ouvrir </RouterLink>
          </li>
          <li class="advice-mini">
            <span style="font-weight: 600">Modérer le forum</span>
            <RouterLink to="/staff/moderation" class="ghost small">Ouvrir </RouterLink>
          </li>
        </ul>
      </article>
    </div>
  </StaffDashboardLayout>
</template>
