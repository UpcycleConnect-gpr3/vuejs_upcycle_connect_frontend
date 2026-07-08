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
        <span class="eyebrow">{{ $t('proHome.eyebrow') }}</span>
        <h1>{{ $t('proHome.greeting') }}</h1>
        <p class="muted measure">
          {{ $t('proHome.subtitle') }}
        </p>
      </div>
      <div class="layout-flex layout-gap-medium">
        <RouterLink to="/pro/projects" class="ghost medium">{{ $t('proHome.newProject') }}</RouterLink>
        <RouterLink to="/pro/marketplace" class="primary medium">{{ $t('proHome.browseListings') }}</RouterLink>
      </div>
    </header>

    <div class="stats-row">
      <RouterLink to="/pro/marketplace" class="stat-tile">
        <span class="stat-tile-label">{{ $t('proHome.stats.availableListings') }}</span>
        <span class="stat-tile-value">{{ stats.availableObjects }}</span>
        <p class="small muted">{{ $t('proHome.stats.availableListingsHint') }}</p>
      </RouterLink>

      <RouterLink to="/pro/projects" class="stat-tile">
        <span class="stat-tile-label">{{ $t('proHome.stats.myProjects') }}</span>
        <span class="stat-tile-value">{{ stats.activeProjects }}</span>
        <p class="small muted">{{ $t('proHome.stats.myProjectsHint') }}</p>
      </RouterLink>

      <RouterLink to="/pro/subscription" class="stat-tile">
        <span class="stat-tile-label">{{ $t('proHome.stats.subscription') }}</span>
        <span class="stat-tile-value" style="font-size: var(--font-size-xlarge)">{{ $t('proHome.stats.subscriptionAction') }}</span>
        <p class="small muted">{{ $t('proHome.stats.subscriptionHint') }}</p>
      </RouterLink>
    </div>

    <div class="dashboard-grid">
      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">{{ $t('proHome.marketplace.eyebrow') }}</span>
          <h3>{{ $t('proHome.marketplace.title') }}</h3>
        </div>
        <p v-if="!newMaterials.length" class="small muted">{{ $t('proHome.marketplace.empty') }}</p>
        <ul v-else class="layout-flex layout-columns layout-gap-medium">
          <li v-for="m in newMaterials" :key="m.id" class="event-row">
            <div class="event-row-date">
              <span class="badge" :class="!m.price ? 'badge--success' : ''">
                {{ !m.price ? $t('proHome.marketplace.donation') : `${m.price}€` }}
              </span>
            </div>
            <div style="flex: 1">
              <div style="font-weight: 600">{{ m.name }}</div>
              <div v-if="m.score > 0" class="tiny muted"> {{ $t('proHome.marketplace.co2', { score: m.score }) }}</div>
            </div>
            <RouterLink :to="`/annonces/${m.id}`" class="ghost small">{{ $t('proHome.marketplace.view') }}</RouterLink>
          </li>
        </ul>
        <RouterLink to="/pro/marketplace" class="ghost small" style="align-self: flex-start">
          {{ $t('proHome.marketplace.viewAll') }}
        </RouterLink>
      </article>

      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">{{ $t('proHome.projects.eyebrow') }}</span>
          <h3>{{ $t('proHome.projects.title') }}</h3>
        </div>
        <p v-if="!recentProjects.length" class="small muted">{{ $t('proHome.projects.empty') }}</p>
        <ul v-else class="layout-flex layout-columns layout-gap-medium">
          <li v-for="p in recentProjects" :key="p.id" class="event-row">
            <div style="flex: 1">
              <div style="font-weight: 600">{{ p.name }}</div>
              <div class="tiny muted">{{ (p.description || '').slice(0, 60) }}</div>
            </div>
            <RouterLink to="/pro/projects" class="ghost small">{{ $t('proHome.projects.manage') }}</RouterLink>
          </li>
        </ul>
        <RouterLink to="/pro/projects" class="ghost small" style="align-self: flex-start">
          {{ $t('proHome.projects.manageAll') }}
        </RouterLink>
      </article>
    </div>
  </ProDashboardLayout>
</template>
