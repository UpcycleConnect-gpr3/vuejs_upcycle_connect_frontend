<script setup lang="ts">
import { computed } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'

const score = 482
const max = 1000
const percent = (score / max) * 100

const dashOffset = computed(() => {
  const c = 2 * Math.PI * 80
  return c - (percent / 100) * c
})

const breakdown = [
  { label: 'Objets donnés', value: 120, count: 12 },
  { label: 'Ventes éco-friendly', value: 96, count: 8 },
  { label: 'Formations suivies', value: 140, count: 4 },
  { label: 'Contributions forum', value: 86, count: 23 },
  { label: 'Évènements', value: 40, count: 2 },
]

const badges = [
  { id: 1, name: 'Premier don', icon: '🎁', earnedAt: '2025-12-12' },
  { id: 2, name: '10 transactions', icon: '⚡', earnedAt: '2026-02-01' },
  { id: 3, name: 'Apprenti', icon: '📚', earnedAt: '2026-03-15' },
  { id: 4, name: 'Communauté +1', icon: '💬', earnedAt: '2026-04-08' },
  { id: 5, name: 'Top 12%', icon: '🏆', earnedAt: '2026-04-22' },
]

const locked = [
  { id: 6, name: '1000 points', icon: '🌟', requirement: '518 points restants' },
  { id: 7, name: '50 contributions', icon: '🔥', requirement: '27 contributions restantes' },
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
        <span class="eyebrow">Mon impact</span>
        <h1>Upcycling Score</h1>
        <p class="muted measure">Suivez votre impact circulaire et débloquez des badges au fil de vos contributions.</p>
      </div>
    </header>

    <div class="score-hero">
      <div class="score-gauge">
        <svg viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="var(--green-700)" stroke-width="14" />
          <circle
            cx="100" cy="100" r="80" fill="none"
            stroke="var(--lime-500)" stroke-width="14"
            stroke-linecap="round"
            :stroke-dasharray="2 * Math.PI * 80"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90 100 100)"
            style="transition: stroke-dashoffset 0.6s ease;"
          />
        </svg>
        <div class="score-gauge-text">
          <span class="score-value">{{ score }}</span>
          <span class="tiny muted">/ {{ max }} points</span>
        </div>
      </div>
      <div class="score-summary">
        <span class="badge badge--success">+24 ce mois</span>
        <h2>Top 12% de la communauté</h2>
        <p class="muted measure">Vous avez progressé de 70 points depuis le début du mois. Continuez sur cette lancée pour débloquer le badge "1000 points".</p>
      </div>
    </div>

    <!-- Breakdown -->
    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>Répartition de vos points</h3>
      <div class="dashboard-card">
        <ul class="layout-flex layout-columns layout-gap-medium">
          <li v-for="b in breakdown" :key="b.label" class="breakdown-row">
            <div class="layout-flex layout-justify-between layout-items-center">
              <span style="font-weight: 600;">{{ b.label }}</span>
              <span class="mono"><strong>{{ b.value }}</strong> pts · {{ b.count }} actions</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: `${(b.value / 200) * 100}%` }"></div>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- History -->
    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>Évolution sur 5 semaines</h3>
      <div class="dashboard-card history-chart">
        <div v-for="h in history" :key="h.week" class="history-bar">
          <div class="history-bar-fill" :style="{ height: `${(h.value / maxHist) * 100}%` }">
            <span class="tiny mono">{{ h.value }}</span>
          </div>
          <span class="tiny muted">{{ h.week }}</span>
        </div>
      </div>
    </section>

    <!-- Badges -->
    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>Badges débloqués</h3>
      <div class="badges-grid">
        <div v-for="b in badges" :key="b.id" class="badge-tile">
          <span class="badge-tile-icon">{{ b.icon }}</span>
          <span style="font-weight: 600;">{{ b.name }}</span>
          <span class="tiny muted">{{ b.earnedAt }}</span>
        </div>
        <div v-for="b in locked" :key="b.id" class="badge-tile badge-tile--locked">
          <span class="badge-tile-icon">{{ b.icon }}</span>
          <span style="font-weight: 600;">{{ b.name }}</span>
          <span class="tiny muted">{{ b.requirement }}</span>
        </div>
      </div>
    </section>
  </DashboardLayout>
</template>
