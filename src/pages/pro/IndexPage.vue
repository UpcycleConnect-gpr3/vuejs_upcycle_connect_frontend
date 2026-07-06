<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'

const stats = {
  availableObjects: 24,
  activeProjects: 5,
  subscription: 'Premium',
  pendingPickups: 3,
}

interface MaterialItem {
  id: number
  title: string
  category: string
  type: 'don' | 'vente'
  price: number | null
  postedAt: string
}

interface ProjectItem {
  id: number
  title: string
  material: string
  status: 'en cours' | 'terminé' | 'brouillon'
}

const newMaterials: MaterialItem[] = [
  {
    id: 1,
    title: 'Lot de planches de palette',
    category: 'Bois',
    type: 'don',
    price: null,
    postedAt: 'Il y a 2h',
  },
  {
    id: 2,
    title: 'Cadre vélo acier',
    category: 'Métal',
    type: 'vente',
    price: 15,
    postedAt: 'Il y a 4h',
  },
  {
    id: 3,
    title: 'Bobines de fil textile',
    category: 'Textile',
    type: 'don',
    price: null,
    postedAt: 'Il y a 6h',
  },
]

const recentProjects: ProjectItem[] = [
  { id: 1, title: 'Lampe upcyclée bocaux', material: 'Verre', status: 'en cours' },
  { id: 2, title: 'Étagère tuyaux acier', material: 'Métal', status: 'en cours' },
  { id: 3, title: 'Tabouret palette bois', material: 'Bois', status: 'terminé' },
]

const alerts = [
  { text: '3 nouveaux objets correspondent à vos critères de collecte prioritaires.' },
  { text: 'Conteneur Bastille disponible — récupération possible avant le 5 juillet.' },
]

const statusBadge: Record<ProjectItem['status'], string> = {
  'en cours': 'badge--accent',
  terminé: 'badge--success',
  brouillon: 'badge--muted',
}
</script>

<template>
  <ProDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Tableau de bord Pro</span>
        <h1>Bonjour 👋</h1>
        <p class="muted measure">
          Votre espace professionnel UpcycleConnect — matériaux, projets et collectes.
        </p>
      </div>
      <div class="layout-flex layout-gap-medium">
        <RouterLink to="/pro/projects" class="ghost medium">+ Nouveau projet</RouterLink>
        <RouterLink to="/pro/marketplace" class="primary medium">Parcourir les annonces</RouterLink>
      </div>
    </header>

    <div class="stats-row">
      <RouterLink to="/pro/marketplace" class="stat-tile">
        <span class="stat-tile-label">Objets disponibles à collecter</span>
        <div class="stat-tile-value-row">
          <span class="stat-tile-value">{{ stats.availableObjects }}</span>
          <span class="badge badge--success">+8 aujourd'hui</span>
        </div>
        <p class="small muted">Correspondant à vos critères</p>
      </RouterLink>

      <RouterLink to="/pro/projects" class="stat-tile">
        <span class="stat-tile-label">Projets en cours</span>
        <span class="stat-tile-value">{{ stats.activeProjects }}</span>
        <p class="small muted">2 en phase finale</p>
      </RouterLink>

      <RouterLink to="/pro/subscription" class="stat-tile">
        <span class="stat-tile-label">Abonnement</span>
        <div class="stat-tile-value-row">
          <span class="stat-tile-value" style="font-size: var(--font-size-xlarge)">{{
            stats.subscription
          }}</span>
          <span class="badge badge--success">Actif</span>
        </div>
        <p class="small muted">Renouvellement le 15 juillet</p>
      </RouterLink>

      <RouterLink to="/pro/pickups" class="stat-tile">
        <span class="stat-tile-label">Récupérations en attente</span>
        <div class="stat-tile-value-row">
          <span class="stat-tile-value">{{ stats.pendingPickups }}</span>
          <span class="badge badge--accent">Action</span>
        </div>
        <p class="small muted">Délai max 72h</p>
      </RouterLink>
    </div>

    <section v-if="alerts.length" class="layout-flex layout-columns layout-gap-small">
      <div v-for="(a, i) in alerts" :key="i" class="alert alert--accent">
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
          <span class="eyebrow">Mis en ligne récemment</span>
          <h3>Nouveaux matériaux pour vous</h3>
        </div>
        <ul class="layout-flex layout-columns layout-gap-medium">
          <li v-for="m in newMaterials" :key="m.id" class="event-row">
            <div class="event-row-date">
              <span class="tiny uppercase muted">{{ m.category }}</span>
              <span class="badge" :class="m.type === 'don' ? 'badge--success' : ''">
                {{ m.type === 'don' ? 'Don' : `${m.price}€` }}
              </span>
            </div>
            <div style="flex: 1">
              <div style="font-weight: 600">{{ m.title }}</div>
              <div class="tiny muted">{{ m.postedAt }}</div>
            </div>
            <RouterLink to="/pro/marketplace" class="ghost small">Voir</RouterLink>
          </li>
        </ul>
        <RouterLink to="/pro/marketplace" class="ghost small" style="align-self: flex-start">
          Voir toutes les annonces →
        </RouterLink>
      </article>

      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">Upcycling</span>
          <h3>Vos projets récents</h3>
        </div>
        <ul class="layout-flex layout-columns layout-gap-medium">
          <li v-for="p in recentProjects" :key="p.id" class="event-row">
            <div style="flex: 1">
              <div class="layout-flex layout-gap-small" style="margin-bottom: 4px">
                <span class="badge" :class="statusBadge[p.status]">{{ p.status }}</span>
                <span class="tiny muted">{{ p.material }}</span>
              </div>
              <div style="font-weight: 600">{{ p.title }}</div>
            </div>
            <RouterLink to="/pro/projects" class="ghost small">Détail</RouterLink>
          </li>
        </ul>
        <RouterLink to="/pro/projects" class="ghost small" style="align-self: flex-start">
          Gérer mes projets →
        </RouterLink>
      </article>
    </div>
  </ProDashboardLayout>
</template>
