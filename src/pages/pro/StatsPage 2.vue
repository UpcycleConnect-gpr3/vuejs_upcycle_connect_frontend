<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'
import { getMyStats } from '@/api/clients/statsClient'
import { useToastsStore } from '@/stores/toasts'
import type { UserStats } from '@/types'

const toasts = useToastsStore()

const CATEGORY_LABELS: Record<string, string> = {
  clothing: 'Vêtements',
  electronics: 'Électronique',
  furniture: 'Mobilier',
  books: 'Livres',
  toys: 'Jouets',
  appliances: 'Électroménager',
  sports: 'Sport',
  other: 'Autre',
}
const categoryLabel = (c: string) => CATEGORY_LABELS[c] ?? c

const stats = ref<UserStats | null>(null)
const isLoading = ref(false)

const maxCategory = computed(() =>
  Math.max(1, ...(stats.value?.by_category ?? []).map((c) => c.count)),
)

onMounted(async () => {
  isLoading.value = true
  try {
    stats.value = await getMyStats()
  } catch {
    toasts.error('Impossible de charger les statistiques.')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <ProDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Statistiques</span>
        <h1>Mon impact</h1>
        <p class="muted measure">
          Suivez votre activité et votre impact écologique sur UpcycleConnect.
        </p>
      </div>
    </header>

    <p v-if="isLoading && !stats" class="muted">Chargement…</p>

    <template v-else-if="stats">
      <div class="stats-row">
        <div class="stat-tile">
          <span class="stat-tile-label">CO₂ économisé</span>
          <span class="stat-tile-value"> {{ stats.co2_total }} kg</span>
          <p class="small muted">Cumul de vos annonces</p>
        </div>
        <div class="stat-tile">
          <span class="stat-tile-label">Annonces publiées</span>
          <span class="stat-tile-value">{{ stats.objects_count }}</span>
        </div>
        <div class="stat-tile">
          <span class="stat-tile-label">Projets</span>
          <span class="stat-tile-value">{{ stats.projects_count }}</span>
        </div>
      </div>

      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">Répartition</span>
          <h3>Vos annonces par catégorie</h3>
        </div>
        <p v-if="!stats.by_category.length" class="small muted">
          Aucune annonce publiée pour l'instant.
        </p>
        <ul v-else class="layout-flex layout-columns layout-gap-medium">
          <li v-for="c in stats.by_category" :key="c.category">
            <div class="layout-flex layout-justify-between" style="margin-bottom: var(--space-1)">
              <span>{{ categoryLabel(c.category) }}</span>
              <span class="mono">{{ c.count }}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: `${(c.count / maxCategory) * 100}%` }"></div>
            </div>
          </li>
        </ul>
      </article>
    </template>
  </ProDashboardLayout>
</template>
