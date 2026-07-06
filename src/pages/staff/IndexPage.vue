<script setup lang="ts">
import { RouterLink } from 'vue-router'
import StaffDashboardLayout from '@/components/StaffDashboardLayout.vue'

interface SessionEvent {
  id: number
  title: string
  date: string
  location: string
  kind: string
}

interface ToProcessItem {
  id: number
  kind: 'brouillon' | 'signalement'
  text: string
  to: string
}

interface Alert {
  type: 'success' | 'accent' | 'danger'
  text: string
}

const stats = {
  sessionsThisWeek: 3,
  trainingsAwaiting: 2,
  adviceDrafts: 4,
  forumReports: 7,
}

const upcomingSessions: SessionEvent[] = [
  {
    id: 1,
    title: 'Atelier upcycling débutant',
    date: '2 juil. · 10h00',
    location: 'Atelier Paris 11',
    kind: 'Atelier',
  },
  {
    id: 2,
    title: 'Formation réemploi textile',
    date: '4 juil. · 14h00',
    location: 'En ligne',
    kind: 'Formation',
  },
  {
    id: 3,
    title: 'Repair Café mensuel',
    date: '5 juil. · 09h30',
    location: 'Atelier Paris 11',
    kind: 'Événement',
  },
]

const toProcess: ToProcessItem[] = [
  {
    id: 1,
    kind: 'brouillon',
    text: 'Conseil : Peindre un meuble en bois en 6 étapes',
    to: '/staff/advice',
  },
  {
    id: 2,
    kind: 'signalement',
    text: 'Signalement : message hors-sujet par user#482',
    to: '/staff/moderation',
  },
  {
    id: 3,
    kind: 'brouillon',
    text: 'Conseil : Entretenir ses outils de bricolage',
    to: '/staff/advice',
  },
  {
    id: 4,
    kind: 'signalement',
    text: 'Signalement : contenu inapproprié par user#117',
    to: '/staff/moderation',
  },
]

const alerts: Alert[] = [
  {
    type: 'success',
    text: 'Formation "Restaurer un meuble" validée par le responsable.',
  },
  {
    type: 'accent',
    text: '2 signalements forum nécessitent une action dans les 24h.',
  },
]
</script>

<template>
  <StaffDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Tableau de bord</span>
        <h1>Bonjour 👋</h1>
        <p class="muted measure">Voici un aperçu de vos activités d'animation et de contenu.</p>
      </div>
      <div class="layout-flex layout-gap-medium">
        <RouterLink to="/staff/trainings" class="ghost medium">+ Créer une formation</RouterLink>
        <RouterLink to="/staff/advice" class="primary medium">+ Rédiger un conseil</RouterLink>
      </div>
    </header>

    <div class="stats-row">
      <RouterLink to="/staff/planning" class="stat-tile">
        <span class="stat-tile-label">Sessions cette semaine</span>
        <span class="stat-tile-value">{{ stats.sessionsThisWeek }}</span>
        <p class="small muted">à animer</p>
      </RouterLink>

      <RouterLink to="/staff/trainings" class="stat-tile">
        <span class="stat-tile-label">Formations en attente</span>
        <div class="stat-tile-value-row">
          <span class="stat-tile-value">{{ stats.trainingsAwaiting }}</span>
          <span class="badge badge--accent">Validation</span>
        </div>
        <p class="small muted">en cours de validation</p>
      </RouterLink>

      <RouterLink to="/staff/advice" class="stat-tile">
        <span class="stat-tile-label">Conseils en brouillon</span>
        <span class="stat-tile-value">{{ stats.adviceDrafts }}</span>
        <p class="small muted">non publiés</p>
      </RouterLink>

      <RouterLink to="/staff/moderation" class="stat-tile">
        <span class="stat-tile-label">Signalements forum</span>
        <div class="stat-tile-value-row">
          <span class="stat-tile-value">{{ stats.forumReports }}</span>
          <span class="badge badge--danger">Urgent</span>
        </div>
        <p class="small muted">à traiter</p>
      </RouterLink>
    </div>

    <section v-if="alerts.length" class="layout-flex layout-columns layout-gap-small">
      <div v-for="(a, i) in alerts" :key="i" class="alert" :class="`alert--${a.type}`">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <span>{{ a.text }}</span>
      </div>
    </section>

    <div class="dashboard-grid">
      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">Cette semaine</span>
          <h3>Prochaines sessions à animer</h3>
        </div>
        <ul class="layout-flex layout-columns layout-gap-medium">
          <li v-for="e in upcomingSessions" :key="e.id" class="event-row">
            <div class="event-row-date">
              <span class="tiny uppercase muted">{{ e.kind }}</span>
              <span style="font-weight: 700">{{ e.date }}</span>
            </div>
            <div style="flex: 1">
              <div style="font-weight: 600">{{ e.title }}</div>
              <div class="tiny muted">{{ e.location }}</div>
            </div>
            <RouterLink to="/staff/planning" class="ghost small">Détail</RouterLink>
          </li>
        </ul>
        <RouterLink to="/staff/planning" class="ghost small" style="align-self: flex-start">
          Voir mon planning →
        </RouterLink>
      </article>

      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">Actions requises</span>
          <h3>À traiter</h3>
        </div>
        <ul class="layout-flex layout-columns layout-gap-medium">
          <li v-for="item in toProcess" :key="item.id" class="advice-mini">
            <span
              class="badge"
              :class="item.kind === 'signalement' ? 'badge--danger' : 'badge--muted'"
            >
              {{ item.kind === 'signalement' ? 'Signalement' : 'Brouillon' }}
            </span>
            <span style="font-weight: 600">{{ item.text }}</span>
            <RouterLink :to="item.to" class="ghost small">Traiter →</RouterLink>
          </li>
        </ul>
      </article>
    </div>
  </StaffDashboardLayout>
</template>
