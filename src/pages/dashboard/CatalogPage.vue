<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { getTrainings } from '@/services/training'
import { useToastsStore } from '@/stores/toasts'

const toasts = useToastsStore()

type ItemKind = 'service' | 'training' | 'event'

interface CatalogItem {
  id: number
  kind: ItemKind
  title: string
  description: string
  category: string
  price: number
  date: string
  spotsLeft: number
  capacity: number
  duration: string
  location: string
}

const search = ref('')
const activeKind = ref<'all' | ItemKind>('all')
const sortBy = ref<'date' | 'price'>('date')

const items = ref<CatalogItem[]>([
  {
    id: 1,
    kind: 'training',
    title: "Initiation à l'upcycling — Niveau 1",
    description: "Workshop d'introduction sur 3h pour découvrir les bases.",
    category: 'Débutant',
    price: 35,
    date: '2026-05-12 14:00',
    spotsLeft: 4,
    capacity: 12,
    duration: '3h',
    location: 'Atelier Paris 11',
  },
  {
    id: 2,
    kind: 'training',
    title: 'Restaurer un meuble en bois',
    description: 'Formation complète : ponçage, traitement, finition huilée.',
    category: 'Technique',
    price: 85,
    date: '2026-05-20 10:00',
    spotsLeft: 7,
    capacity: 10,
    duration: '6h',
    location: 'Atelier Paris 11',
  },
  {
    id: 3,
    kind: 'event',
    title: "Salon de l'économie circulaire",
    description: 'Conférences et stands toute la journée.',
    category: 'Événement',
    price: 0,
    date: '2026-05-25 09:00',
    spotsLeft: 200,
    capacity: 300,
    duration: 'Journée',
    location: 'Cité des Sciences',
  },
  {
    id: 4,
    kind: 'service',
    title: 'Diagnostic mobilier à domicile',
    description: 'Un expert vient évaluer vos meubles à restaurer.',
    category: 'Service',
    price: 60,
    date: 'Sur RDV',
    spotsLeft: 99,
    capacity: 99,
    duration: '1h',
    location: 'Île-de-France',
  },
  {
    id: 5,
    kind: 'training',
    title: 'Workshop textile — couture upcycling',
    description: 'Transformez vos vieux vêtements en pièces uniques.',
    category: 'Textile',
    price: 45,
    date: '2026-06-02 14:00',
    spotsLeft: 12,
    capacity: 15,
    duration: '4h',
    location: 'En ligne',
  },
  {
    id: 6,
    kind: 'event',
    title: "Repair Café d'avril",
    description: 'Apportez vos objets à réparer, on vous aide.',
    category: 'Événement',
    price: 0,
    date: '2026-04-30 10:00',
    spotsLeft: 30,
    capacity: 40,
    duration: '4h',
    location: 'Atelier Paris 11',
  },
])

const kindLabels: Record<ItemKind, string> = {
  service: 'Service',
  training: 'Formation',
  event: 'Événement',
}

onMounted(async () => {
  try {
    const trainings = await getTrainings()
    // Seules les formations validées par un responsable sont réservables.
    const validated = trainings.filter((t) => (t.status as string) === 'validated')
    if (Array.isArray(validated) && validated.length) {
      items.value = validated.map(
        (t): CatalogItem => ({
          id: t.id,
          kind: 'training',
          title: (t.name as string) ?? 'Formation',
          description: '',
          category: (t.type as string) ?? 'Formation',
          price: 0,
          date: '',
          spotsLeft: 0,
          capacity: 0,
          duration: (t.duration as string) ?? '',
          location: (t.location as string) ?? '',
        }),
      )
    }
  } catch {
    toasts.error('Impossible de charger le catalogue, affichage des données de démonstration.')
  }
})

const filtered = computed(() => {
  let list = items.value
  if (activeKind.value !== 'all') list = list.filter((i) => i.kind === activeKind.value)
  if (search.value)
    list = list.filter((i) => i.title.toLowerCase().includes(search.value.toLowerCase()))
  list = [...list].sort((a, b) => {
    if (sortBy.value === 'price') return a.price - b.price
    return a.date.localeCompare(b.date)
  })
  return list
})
</script>

<template>
  <DashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Catalogue</span>
        <h1>Services, formations &amp; événements</h1>
        <p class="muted measure">
          Réservez, achetez, participez — tout ce que propose UpcycleConnect au même endroit.
        </p>
      </div>
    </header>

    <div class="catalog-toolbar">
      <input
        v-model="search"
        type="search"
        class="primary medium"
        placeholder="Rechercher…"
        style="flex: 1"
      />
      <div class="layout-flex layout-gap-small" style="flex-wrap: wrap">
        <button
          class="forum-tab"
          :class="{ active: activeKind === 'all' }"
          @click="activeKind = 'all'"
        >
          Tout
        </button>
        <button
          class="forum-tab"
          :class="{ active: activeKind === 'service' }"
          @click="activeKind = 'service'"
        >
          Services
        </button>
        <button
          class="forum-tab"
          :class="{ active: activeKind === 'training' }"
          @click="activeKind = 'training'"
        >
          Formations
        </button>
        <button
          class="forum-tab"
          :class="{ active: activeKind === 'event' }"
          @click="activeKind = 'event'"
        >
          Événements
        </button>
      </div>
      <select v-model="sortBy" class="primary medium" style="width: 180px">
        <option value="date">Trier : date</option>
        <option value="price">Trier : prix</option>
      </select>
    </div>

    <div class="catalog-grid">
      <RouterLink
        v-for="i in filtered"
        :key="i.id"
        :to="`/dashboard/catalog/${i.id}`"
        class="catalog-card"
      >
        <div class="catalog-card-image"></div>
        <div class="catalog-card-body">
          <div class="layout-flex layout-gap-small layout-items-center">
            <span class="badge">{{ kindLabels[i.kind] }}</span>
            <span class="badge">{{ i.category }}</span>
          </div>
          <h4>{{ i.title }}</h4>
          <p class="small muted">{{ i.description }}</p>
          <div class="catalog-meta">
            <div class="tiny muted"> {{ i.date }}</div>
            <div class="tiny muted"> {{ i.location }} · {{ i.duration }}</div>
            <div class="tiny muted"> {{ i.spotsLeft }} places restantes</div>
          </div>
          <div
            class="layout-flex layout-justify-between layout-items-center"
            style="padding-top: var(--space-3); border-top: 1px solid var(--green-700)"
          >
            <div v-if="i.price === 0" class="text-secondary" style="font-weight: 700">Gratuit</div>
            <div v-else class="mono" style="font-size: var(--font-size-large); font-weight: 700">
              {{ i.price }}€
            </div>
            <span
              class="primary small"
              style="
                display: inline-flex;
                align-items: center;
                height: 32px;
                padding: 0 12px;
                background: var(--lime-500);
                color: var(--black);
                font-weight: 600;
              "
              >Réserver </span
            >
          </div>
        </div>
      </RouterLink>
    </div>
  </DashboardLayout>
</template>
