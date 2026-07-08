<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/components/DashboardLayout.vue'

const { t } = useI18n()

const score = 482
const max = 1000
const percent = (score / max) * 100

const dashOffset = computed(() => {
  const c = 2 * Math.PI * 80
  return c - (percent / 100) * c
})

const breakdown = [
  { label: t('dashScore.breakdown.donatedItems'), value: 120, count: 12 },
  { label: t('dashScore.breakdown.ecoSales'), value: 96, count: 8 },
  { label: t('dashScore.breakdown.trainingsAttended'), value: 140, count: 4 },
  { label: t('dashScore.breakdown.forumContributions'), value: 86, count: 23 },
  { label: t('dashScore.breakdown.events'), value: 40, count: 2 },
]

const badges = [
  { id: 1, name: t('dashScore.badges.firstDonation'), icon: '', earnedAt: '2025-12-12' },
  { id: 2, name: t('dashScore.badges.tenTransactions'), icon: '', earnedAt: '2026-02-01' },
  { id: 3, name: t('dashScore.badges.apprentice'), icon: '', earnedAt: '2026-03-15' },
  { id: 4, name: t('dashScore.badges.communityPlusOne'), icon: '', earnedAt: '2026-04-08' },
  { id: 5, name: t('dashScore.badges.top12'), icon: '', earnedAt: '2026-04-22' },
]

const locked = [
  {
    id: 6,
    name: t('dashScore.badges.thousandPoints'),
    icon: '',
    requirement: t('dashScore.badges.pointsRemaining', { count: 518 }),
  },
  {
    id: 7,
    name: t('dashScore.badges.fiftyContributions'),
    icon: '',
    requirement: t('dashScore.badges.contributionsRemaining', { count: 27 }),
  },
]

const history = [
  { week: 'S15', value: 412 },
  { week: 'S16', value: 428 },
  { week: 'S17', value: 445 },
  { week: 'S18', value: 458 },
  { week: 'S19', value: 482 },
]

const maxHist = Math.max(...history.map((h) => h.value))
</script>

<template>
  <DashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">{{ $t('dashScore.eyebrow') }}</span>
        <h1>{{ $t('dashScore.title') }}</h1>
        <p class="muted measure">
          {{ $t('dashScore.subtitle') }}
        </p>
      </div>
    </header>

    <div class="score-hero">
      <div class="score-gauge">
        <svg viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="var(--green-700)"
            stroke-width="14"
          />
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="var(--lime-500)"
            stroke-width="14"
            stroke-linecap="round"
            :stroke-dasharray="2 * Math.PI * 80"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90 100 100)"
            style="transition: stroke-dashoffset 0.6s ease"
          />
        </svg>
        <div class="score-gauge-text">
          <span class="score-value">{{ score }}</span>
          <span class="tiny muted">{{ $t('dashScore.outOfPoints', { max }) }}</span>
        </div>
      </div>
      <div class="score-summary">
        <span class="badge badge--success">{{ $t('dashScore.deltaThisMonth', { delta: '+24' }) }}</span>
        <h2>{{ $t('dashScore.topCommunity') }}</h2>
        <p class="muted measure">
          {{ $t('dashScore.progressNotice') }}
        </p>
      </div>
    </div>

    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>{{ $t('dashScore.pointsBreakdown') }}</h3>
      <div class="dashboard-card">
        <ul class="layout-flex layout-columns layout-gap-medium">
          <li v-for="b in breakdown" :key="b.label" class="breakdown-row">
            <div class="layout-flex layout-justify-between layout-items-center">
              <span style="font-weight: 600">{{ b.label }}</span>
              <span class="mono"
                ><strong>{{ b.value }}</strong> {{ $t('dashScore.ptsActions', { count: b.count }) }}</span
              >
            </div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: `${(b.value / 200) * 100}%` }"></div>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>{{ $t('dashScore.evolutionOverWeeks') }}</h3>
      <div class="dashboard-card history-chart">
        <div v-for="h in history" :key="h.week" class="history-bar">
          <div class="history-bar-fill" :style="{ height: `${(h.value / maxHist) * 100}%` }">
            <span class="tiny mono">{{ h.value }}</span>
          </div>
          <span class="tiny muted">{{ h.week }}</span>
        </div>
      </div>
    </section>

    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>{{ $t('dashScore.unlockedBadges') }}</h3>
      <div class="badges-grid">
        <div v-for="b in badges" :key="b.id" class="badge-tile">
          <span class="badge-tile-icon">{{ b.icon }}</span>
          <span style="font-weight: 600">{{ b.name }}</span>
          <span class="tiny muted">{{ b.earnedAt }}</span>
        </div>
        <div v-for="b in locked" :key="b.id" class="badge-tile badge-tile--locked">
          <span class="badge-tile-icon">{{ b.icon }}</span>
          <span style="font-weight: 600">{{ b.name }}</span>
          <span class="tiny muted">{{ b.requirement }}</span>
        </div>
      </div>
    </section>
  </DashboardLayout>
</template>
