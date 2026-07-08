<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'
import { getMyStats } from '@/api/clients/statsClient'
import { useToastsStore } from '@/stores/toasts'
import type { UserStats } from '@/types'

const toasts = useToastsStore()
const { t } = useI18n()

const CATEGORY_LABELS = computed<Record<string, string>>(() => ({
  clothing: t('proStats.categories.clothing'),
  electronics: t('proStats.categories.electronics'),
  furniture: t('proStats.categories.furniture'),
  books: t('proStats.categories.books'),
  toys: t('proStats.categories.toys'),
  appliances: t('proStats.categories.appliances'),
  sports: t('proStats.categories.sports'),
  other: t('proStats.categories.other'),
}))
const categoryLabel = (c: string) => CATEGORY_LABELS.value[c] ?? c

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
    toasts.error(t('proStats.errors.loadFailed'))
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <ProDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">{{ $t('proStats.eyebrow') }}</span>
        <h1>{{ $t('proStats.title') }}</h1>
        <p class="muted measure">
          {{ $t('proStats.subtitle') }}
        </p>
      </div>
    </header>

    <p v-if="isLoading && !stats" class="muted">{{ $t('common.loading') }}</p>

    <template v-else-if="stats">
      <div class="stats-row">
        <div class="stat-tile">
          <span class="stat-tile-label">{{ $t('proStats.co2Saved') }}</span>
          <span class="stat-tile-value"> {{ $t('proStats.co2Value', { value: stats.co2_total }) }}</span>
          <p class="small muted">{{ $t('proStats.co2Hint') }}</p>
        </div>
        <div class="stat-tile">
          <span class="stat-tile-label">{{ $t('proStats.listingsPublished') }}</span>
          <span class="stat-tile-value">{{ stats.objects_count }}</span>
        </div>
        <div class="stat-tile">
          <span class="stat-tile-label">{{ $t('proStats.projects') }}</span>
          <span class="stat-tile-value">{{ stats.projects_count }}</span>
        </div>
      </div>

      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">{{ $t('proStats.breakdown.eyebrow') }}</span>
          <h3>{{ $t('proStats.breakdown.title') }}</h3>
        </div>
        <p v-if="!stats.by_category.length" class="small muted">
          {{ $t('proStats.breakdown.empty') }}
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
