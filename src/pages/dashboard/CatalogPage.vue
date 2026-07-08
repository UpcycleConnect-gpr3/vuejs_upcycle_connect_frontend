<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { getTrainings } from '@/services/training'
import { useToastsStore } from '@/stores/toasts'

const toasts = useToastsStore()
const { t } = useI18n()

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
    title: t('dashCatalog.items.1.title'),
    description: t('dashCatalog.items.1.description'),
    category: t('dashCatalog.items.1.category'),
    price: 35,
    date: '2026-05-12 14:00',
    spotsLeft: 4,
    capacity: 12,
    duration: t('dashCatalog.items.1.duration'),
    location: t('dashCatalog.items.1.location'),
  },
  {
    id: 2,
    kind: 'training',
    title: t('dashCatalog.items.2.title'),
    description: t('dashCatalog.items.2.description'),
    category: t('dashCatalog.items.2.category'),
    price: 85,
    date: '2026-05-20 10:00',
    spotsLeft: 7,
    capacity: 10,
    duration: t('dashCatalog.items.2.duration'),
    location: t('dashCatalog.items.2.location'),
  },
  {
    id: 3,
    kind: 'event',
    title: t('dashCatalog.items.3.title'),
    description: t('dashCatalog.items.3.description'),
    category: t('dashCatalog.items.3.category'),
    price: 0,
    date: '2026-05-25 09:00',
    spotsLeft: 200,
    capacity: 300,
    duration: t('dashCatalog.items.3.duration'),
    location: t('dashCatalog.items.3.location'),
  },
  {
    id: 4,
    kind: 'service',
    title: t('dashCatalog.items.4.title'),
    description: t('dashCatalog.items.4.description'),
    category: t('dashCatalog.items.4.category'),
    price: 60,
    date: t('dashCatalog.items.4.date'),
    spotsLeft: 99,
    capacity: 99,
    duration: t('dashCatalog.items.4.duration'),
    location: t('dashCatalog.items.4.location'),
  },
  {
    id: 5,
    kind: 'training',
    title: t('dashCatalog.items.5.title'),
    description: t('dashCatalog.items.5.description'),
    category: t('dashCatalog.items.5.category'),
    price: 45,
    date: '2026-06-02 14:00',
    spotsLeft: 12,
    capacity: 15,
    duration: t('dashCatalog.items.5.duration'),
    location: t('dashCatalog.items.5.location'),
  },
  {
    id: 6,
    kind: 'event',
    title: t('dashCatalog.items.6.title'),
    description: t('dashCatalog.items.6.description'),
    category: t('dashCatalog.items.6.category'),
    price: 0,
    date: '2026-04-30 10:00',
    spotsLeft: 30,
    capacity: 40,
    duration: t('dashCatalog.items.6.duration'),
    location: t('dashCatalog.items.6.location'),
  },
])

const kindLabels: Record<ItemKind, string> = {
  service: t('dashCatalog.kinds.service'),
  training: t('dashCatalog.kinds.training'),
  event: t('dashCatalog.kinds.event'),
}

onMounted(async () => {
  try {
    const trainings = await getTrainings()

    const validated = trainings.filter((tr) => (tr.status as string) === 'validated')
    if (Array.isArray(validated) && validated.length) {
      items.value = validated.map(
        (tr): CatalogItem => ({
          id: tr.id,
          kind: 'training',
          title: (tr.name as string) ?? t('dashCatalog.kinds.training'),
          description: '',
          category: (tr.type as string) ?? t('dashCatalog.kinds.training'),
          price: 0,
          date: '',
          spotsLeft: 0,
          capacity: 0,
          duration: (tr.duration as string) ?? '',
          location: (tr.location as string) ?? '',
        }),
      )
    }
  } catch {
    toasts.error(t('dashCatalog.toastLoadError'))
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
        <span class="eyebrow">{{ $t('dashCatalog.eyebrow') }}</span>
        <h1>{{ $t('dashCatalog.title') }}</h1>
        <p class="muted measure">
          {{ $t('dashCatalog.subtitle') }}
        </p>
      </div>
    </header>

    <div class="catalog-toolbar">
      <input
        v-model="search"
        type="search"
        class="primary medium"
        :placeholder="$t('dashCatalog.searchPlaceholder')"
        style="flex: 1"
      />
      <div class="layout-flex layout-gap-small" style="flex-wrap: wrap">
        <button
          class="forum-tab"
          :class="{ active: activeKind === 'all' }"
          @click="activeKind = 'all'"
        >
          {{ $t('dashCatalog.filters.all') }}
        </button>
        <button
          class="forum-tab"
          :class="{ active: activeKind === 'service' }"
          @click="activeKind = 'service'"
        >
          {{ $t('dashCatalog.filters.services') }}
        </button>
        <button
          class="forum-tab"
          :class="{ active: activeKind === 'training' }"
          @click="activeKind = 'training'"
        >
          {{ $t('dashCatalog.filters.trainings') }}
        </button>
        <button
          class="forum-tab"
          :class="{ active: activeKind === 'event' }"
          @click="activeKind = 'event'"
        >
          {{ $t('dashCatalog.filters.events') }}
        </button>
      </div>
      <select v-model="sortBy" class="primary medium" style="width: 180px">
        <option value="date">{{ $t('dashCatalog.sort.date') }}</option>
        <option value="price">{{ $t('dashCatalog.sort.price') }}</option>
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
            <div class="tiny muted"> {{ $t('dashCatalog.spotsLeft', { count: i.spotsLeft }) }}</div>
          </div>
          <div
            class="layout-flex layout-justify-between layout-items-center"
            style="padding-top: var(--space-3); border-top: 1px solid var(--green-700)"
          >
            <div v-if="i.price === 0" class="text-secondary" style="font-weight: 700">{{ $t('common.free') }}</div>
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
              >{{ $t('dashCatalog.book') }} </span
            >
          </div>
        </div>
      </RouterLink>
    </div>
  </DashboardLayout>
</template>
