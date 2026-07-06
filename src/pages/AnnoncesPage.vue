<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useObjectStore } from '@/stores/objectStore'
import type { UpcycleObject } from '@/types'

const router = useRouter()
const objectStore = useObjectStore()
const { objects, isLoading, error } = storeToRefs(objectStore)

const UPCYCLE_URL = import.meta.env.VITE_UPCYCLE_URL ?? 'http://localhost:4343'

const search = ref('')
const typeFilter = ref<'all' | 'vente' | 'don'>('all')

const isDon = (o: UpcycleObject) => !o.price

const imageUrl = (o: UpcycleObject) => {
  if (!o.image_path) return ''
  if (o.image_path.startsWith('http')) return o.image_path
  return `${UPCYCLE_URL}/${o.image_path.replace(/^\//, '')}`
}

const filteredObjects = computed(() =>
  objects.value.filter((o) => {
    const q = search.value.trim().toLowerCase()
    if (q && !`${o.name} ${o.description}`.toLowerCase().includes(q)) return false
    if (typeFilter.value === 'vente' && isDon(o)) return false
    if (typeFilter.value === 'don' && !isDon(o)) return false
    return true
  }),
)

onMounted(() => {
  objectStore.fetchObjects()
})
</script>

<template>
  <AppHeader />

  <main>
    <section>
      <div class="container layout-flex layout-columns layout-gap-extra-large">
        <hgroup>
          <span class="eyebrow">Marketplace</span>
          <h2>Les annonces</h2>
        </hgroup>

        <div class="annonces-toolbar">
          <input
            v-model="search"
            type="search"
            class="primary medium"
            placeholder="Rechercher un objet…"
            style="flex: 1"
          />
          <div class="layout-flex layout-gap-small">
            <button
              class="medium"
              :class="typeFilter === 'all' ? 'primary' : 'secondary'"
              @click="typeFilter = 'all'"
            >
              Tout
            </button>
            <button
              class="medium"
              :class="typeFilter === 'don' ? 'primary' : 'secondary'"
              @click="typeFilter = 'don'"
            >
              Dons
            </button>
            <button
              class="medium"
              :class="typeFilter === 'vente' ? 'primary' : 'secondary'"
              @click="typeFilter = 'vente'"
            >
              Ventes
            </button>
          </div>
        </div>

        <p v-if="error" class="small" style="color: var(--destructive-color)">{{ error }}</p>
        <p v-else-if="isLoading && !objects.length" class="muted">Chargement des annonces…</p>
        <p v-else-if="!filteredObjects.length" class="muted center" style="padding: var(--space-8)">
          Aucune annonce ne correspond à votre recherche.
        </p>

        <div v-else class="annonces-grid layout-items-stretch">
          <article
            v-for="o in filteredObjects"
            :key="o.id"
            class="card layout-flex layout-columns layout-gap-medium annonce-card"
            @click="router.push(`/annonces/${o.id}`)"
          >
            <img v-if="imageUrl(o)" :src="imageUrl(o)" :alt="o.name" class="annonce-image" />
            <div v-else class="image-placeholder annonce-placeholder"></div>
            <span class="eyebrow"
              >{{ isDon(o) ? 'Don' : `Vente · ${o.price}€` }} · {{ o.quantity }}
              disponible(s)</span
            >
            <hgroup>
              <h3>{{ o.name }}</h3>
              <p class="measure annonce-description">{{ o.description }}</p>
            </hgroup>
          </article>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>

<style scoped>
.annonces-toolbar {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  align-items: center;
}

.annonces-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-4);
}

.annonce-card {
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.annonce-card:hover {
  border-color: var(--primary-color);
}

.annonce-placeholder {
  --image-placeholder-min-height: 160px;
}

.annonce-image {
  height: 160px;
  width: 100%;
  object-fit: cover;
}

.annonce-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
