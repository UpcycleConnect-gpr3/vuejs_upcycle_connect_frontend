<script setup lang="ts">
import { RouterLink } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'

// TODO: aggregate dashboard stats — apiUpcycle GET /projects (+ /objects, /orders)
// have no single stats endpoint, so these tiles keep demo values for now.
const stats = {
  score: 482,
  scoreDelta: '+24',
  listingsActive: 3,
  upcomingEvents: 2,
  pendingDeposits: 1,
}

const upcoming = [
  {
    id: 1,
    title: 'Atelier transformation palettes',
    date: '12 mai · 14h00',
    location: 'Salle A',
    kind: 'Atelier',
  },
  {
    id: 2,
    title: 'Webinaire textile éco-responsable',
    date: '18 mai · 19h00',
    location: 'En ligne',
    kind: 'Conseil',
  },
]

const alerts = [
  { type: 'success', text: 'Annonce "Table basse palette" approuvée par l\'équipe.' },
  { type: 'accent', text: 'Code conteneur reçu pour votre dépôt #DEP-204.' },
]
</script>

<template>
  <DashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Tableau de bord</span>
        <h1>Bonjour Jean 👋</h1>
        <p class="muted measure">Voici un aperçu de votre activité sur UpcycleConnect.</p>
      </div>
      <div class="layout-flex layout-gap-medium">
        <RouterLink to="/dashboard/deposits/new" class="ghost medium">+ Dépôt conteneur</RouterLink>
        <RouterLink to="/dashboard/listings/new" class="primary medium" data-tour="new-listing"
          >+ Nouvelle annonce</RouterLink
        >
      </div>
    </header>

    <!-- Stats -->
    <div class="stats-row">
      <RouterLink to="/dashboard/score" class="stat-tile" data-tour="score">
        <span class="stat-tile-label">Upcycling Score</span>
        <div class="stat-tile-value-row">
          <span class="stat-tile-value">{{ stats.score }}</span>
          <span class="badge badge--success">{{ stats.scoreDelta }} ce mois</span>
        </div>
        <p class="small muted">Top 12% de la communauté</p>
      </RouterLink>

      <RouterLink to="/dashboard/listings" class="stat-tile">
        <span class="stat-tile-label">Annonces actives</span>
        <span class="stat-tile-value">{{ stats.listingsActive }}</span>
        <p class="small muted">2 en validation</p>
      </RouterLink>

      <RouterLink to="/dashboard/planning" class="stat-tile">
        <span class="stat-tile-label">Prochaines sessions</span>
        <span class="stat-tile-value">{{ stats.upcomingEvents }}</span>
        <p class="small muted">cette semaine</p>
      </RouterLink>

      <RouterLink to="/dashboard/deposits" class="stat-tile">
        <span class="stat-tile-label">Dépôts en attente</span>
        <div class="stat-tile-value-row">
          <span class="stat-tile-value">{{ stats.pendingDeposits }}</span>
          <span class="badge badge--accent">Action</span>
        </div>
        <p class="small muted">1 code disponible</p>
      </RouterLink>
    </div>

    <!-- Alerts -->
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
      <!-- Prochains rendez-vous -->
      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">Cette semaine</span>
          <h3>Prochains rendez-vous</h3>
        </div>
        <ul class="layout-flex layout-columns layout-gap-medium">
          <li v-for="e in upcoming" :key="e.id" class="event-row">
            <div class="event-row-date">
              <span class="tiny uppercase muted">{{ e.kind }}</span>
              <span style="font-weight: 700">{{ e.date }}</span>
            </div>
            <div style="flex: 1">
              <div style="font-weight: 600">{{ e.title }}</div>
              <div class="tiny muted">{{ e.location }}</div>
            </div>
            <RouterLink to="/dashboard/planning" class="ghost small">Détail</RouterLink>
          </li>
        </ul>
        <RouterLink to="/dashboard/planning" class="ghost small" style="align-self: flex-start"
          >Voir tous mes rendez-vous →</RouterLink
        >
      </article>

      <!-- Conseils du moment -->
      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">Conseils</span>
          <h3>À lire cette semaine</h3>
        </div>
        <ul class="layout-flex layout-columns layout-gap-medium">
          <li class="advice-mini">
            <span class="badge">Débutant</span>
            <span style="font-weight: 600">5 conseils pour bien démarrer</span>
            <span class="tiny muted">5 min de lecture</span>
          </li>
          <li class="advice-mini">
            <span class="badge">Outils</span>
            <span style="font-weight: 600">Outils essentiels pour l'upcycling</span>
            <span class="tiny muted">8 min de lecture</span>
          </li>
        </ul>
        <RouterLink to="/dashboard/advice" class="ghost small" style="align-self: flex-start"
          >Voir tous les conseils →</RouterLink
        >
      </article>
    </div>
  </DashboardLayout>
</template>
