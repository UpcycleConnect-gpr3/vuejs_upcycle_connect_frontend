<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'
import { useObjectStore } from '@/stores/objectStore'
import { useProjectStore } from '@/stores/projectStore'

const objectStore = useObjectStore()
const projectStore = useProjectStore()
const { objects } = storeToRefs(objectStore)
const { projects } = storeToRefs(projectStore)

const newMaterials = computed(() => objects.value.slice(0, 5))
const recentProjects = computed(() => projects.value.slice(0, 5))

const stats = computed(() => ({
  availableObjects: objects.value.length,
  activeProjects: projects.value.length,
}))

onMounted(() => {
  objectStore.fetchObjects()
  projectStore.fetchProjects()
})
</script>

<template>
  <ProDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Tableau de bord Pro</span>
        <h1>Bonjour </h1>
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
        <span class="stat-tile-label">Annonces disponibles</span>
        <span class="stat-tile-value">{{ stats.availableObjects }}</span>
        <p class="small muted">Objets en don ou en vente</p>
      </RouterLink>

      <RouterLink to="/pro/projects" class="stat-tile">
        <span class="stat-tile-label">Mes projets</span>
        <span class="stat-tile-value">{{ stats.activeProjects }}</span>
        <p class="small muted">Projets d'upcycling</p>
      </RouterLink>

      <RouterLink to="/pro/subscription" class="stat-tile">
        <span class="stat-tile-label">Abonnement</span>
        <span class="stat-tile-value" style="font-size: var(--font-size-xlarge)">Gérer</span>
        <p class="small muted">Formules et facturation</p>
      </RouterLink>
    </div>

    <div class="dashboard-grid">
      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">Marketplace</span>
          <h3>Annonces récentes</h3>
        </div>
        <p v-if="!newMaterials.length" class="small muted">Aucune annonce pour l'instant.</p>
        <ul v-else class="layout-flex layout-columns layout-gap-medium">
          <li v-for="m in newMaterials" :key="m.id" class="event-row">
            <div class="event-row-date">
              <span class="badge" :class="!m.price ? 'badge--success' : ''">
                {{ !m.price ? 'Don' : `${m.price}€` }}
              </span>
            </div>
            <div style="flex: 1">
              <div style="font-weight: 600">{{ m.name }}</div>
              <div v-if="m.score > 0" class="tiny muted"> {{ m.score }} kg CO₂</div>
            </div>
            <RouterLink :to="`/annonces/${m.id}`" class="ghost small">Voir</RouterLink>
          </li>
        </ul>
        <RouterLink to="/pro/marketplace" class="ghost small" style="align-self: flex-start">
          Voir toutes les annonces
        </RouterLink>
      </article>

      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">Upcycling</span>
          <h3>Vos projets récents</h3>
        </div>
        <p v-if="!recentProjects.length" class="small muted">Aucun projet pour l'instant.</p>
        <ul v-else class="layout-flex layout-columns layout-gap-medium">
          <li v-for="p in recentProjects" :key="p.id" class="event-row">
            <div style="flex: 1">
              <div style="font-weight: 600">{{ p.name }}</div>
              <div class="tiny muted">{{ (p.description || '').slice(0, 60) }}</div>
            </div>
            <RouterLink to="/pro/projects" class="ghost small">Gérer</RouterLink>
          </li>
        </ul>
        <RouterLink to="/pro/projects" class="ghost small" style="align-self: flex-start">
          Gérer mes projets
        </RouterLink>
      </article>
    </div>
  </ProDashboardLayout>
</template>
