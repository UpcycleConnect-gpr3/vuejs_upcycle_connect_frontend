<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'
import { useObjectStore } from '@/stores/objectStore'
import type { UpcycleObject } from '@/types'

const router = useRouter()
const objectStore = useObjectStore()
const { objects, isLoading, error } = storeToRefs(objectStore)

const UPCYCLE_URL = import.meta.env.VITE_UPCYCLE_URL ?? 'http://localhost:4343'

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

const filterType = ref<'all' | 'don' | 'vente'>('all')
const filterCategory = ref('all')
const search = ref('')

const isDon = (o: UpcycleObject) => !o.price

const imageUrl = (o: UpcycleObject) => {
  const first = (o.image_path ?? '').split(',')[0]?.trim()
  if (!first) return ''
  return first.startsWith('http') ? first : `${UPCYCLE_URL}/${first.replace(/^\//, '')}`
}

const filtered = computed(() =>
  objects.value.filter((o) => {
    const q = search.value.trim().toLowerCase()
    if (q && !`${o.name} ${o.description}`.toLowerCase().includes(q)) return false
    if (filterType.value === 'don' && !isDon(o)) return false
    if (filterType.value === 'vente' && isDon(o)) return false
    if (filterCategory.value !== 'all' && o.category !== filterCategory.value) return false
    return true
  }),
)

const resetFilters = () => {
  filterType.value = 'all'
  filterCategory.value = 'all'
  search.value = ''
}

onMounted(() => {
  objectStore.fetchObjects()
})
</script>

<template>
  <ProDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Marketplace</span>
        <h1>Annonces particuliers</h1>
        <p class="muted measure">
          Parcourez les objets mis en don ou en vente par les particuliers. Achetez ou réservez pour
          vos projets d'upcycling.
        </p>
      </div>
    </header>

    <div class="layout-flex layout-gap-small" style="flex-wrap: wrap; align-items: center">
      <button class="forum-tab" :class="{ active: filterType === 'all' }" @click="filterType = 'all'">
        Tout
      </button>
      <button class="forum-tab" :class="{ active: filterType === 'don' }" @click="filterType = 'don'">
        Dons
      </button>
      <button
        class="forum-tab"
        :class="{ active: filterType === 'vente' }"
        @click="filterType = 'vente'"
      >
        Ventes
      </button>

      <select v-model="filterCategory" class="ghost medium" style="margin-left: var(--space-2)">
        <option value="all">Toutes catégories</option>
        <option v-for="(label, key) in CATEGORY_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>

      <input
        v-model="search"
        type="search"
        placeholder="Rechercher…"
        class="ghost medium"
        style="max-width: 200px"
      />
    </div>

    <p v-if="error" class="small" style="color: var(--destructive-color)">{{ error }}</p>
    <p v-else-if="isLoading && !objects.length" class="muted">Chargement des annonces…</p>

    <div v-else class="catalog-grid">
      <article
        v-for="o in filtered"
        :key="o.id"
        class="catalog-card"
        style="cursor: pointer"
        @click="router.push(`/annonces/${o.id}`)"
      >
        <div class="listing-photo">
          <img v-if="imageUrl(o)" :src="imageUrl(o)" :alt="o.name" class="listing-img" />
          <span v-else class="tiny muted">Photo</span>
        </div>
        <div style="padding: var(--space-3)">
          <div
            class="layout-flex layout-gap-small"
            style="flex-wrap: wrap; margin-bottom: var(--space-2)"
          >
            <span class="badge" :class="isDon(o) ? 'badge--success' : 'badge--accent'">
              {{ isDon(o) ? 'Don' : 'Vente' }}
            </span>
            <span class="badge">{{ categoryLabel(o.category) }}</span>
          </div>
          <h4 style="margin: 0 0 var(--space-1)">{{ o.name }}</h4>
          <p class="small muted" style="margin: 0 0 var(--space-2)">{{ o.description }}</p>
          <div class="layout-flex layout-justify-between" style="align-items: flex-end">
            <div>
              <div v-if="o.price" class="mono" style="font-size: var(--font-size-large); font-weight: 700">
                {{ o.price }}€
              </div>
              <div v-else style="font-weight: 700; color: var(--lime-500)">Gratuit</div>
              <div v-if="o.score > 0" class="tiny muted"> {{ o.score }} kg CO₂</div>
            </div>
            <button class="primary small" @click.stop="router.push(`/annonces/${o.id}`)">
              Voir
            </button>
          </div>
        </div>
      </article>
    </div>

    <div v-if="!isLoading && filtered.length === 0" class="empty-state">
      <p>Aucune annonce ne correspond à vos critères.</p>
      <button class="ghost medium" @click="resetFilters">Réinitialiser les filtres</button>
    </div>
  </ProDashboardLayout>
</template>

<style scoped>
.listing-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
