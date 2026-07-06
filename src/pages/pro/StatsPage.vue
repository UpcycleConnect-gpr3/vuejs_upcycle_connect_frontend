<script setup lang="ts">
import { computed } from 'vue'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'

const impact = {
  wasteAvoided: 284,
  co2Saved: 142,
  materialsCollected: 37,
  projectsCompleted: 12,
}

interface CategoryStat {
  label: string
  count: number
  color: string
}

const byCategory: CategoryStat[] = [
  { label: 'Bois', count: 14, color: 'var(--lime-500)' },
  { label: 'Métal', count: 9, color: 'var(--lime-300)' },
  { label: 'Textile', count: 6, color: 'var(--purple-500)' },
  { label: 'Verre', count: 4, color: 'var(--text-secondary)' },
  { label: 'Cuir', count: 3, color: 'var(--lime-700)' },
  { label: 'Autre', count: 1, color: 'var(--text-tertiary)' },
]

const maxCategory = Math.max(...byCategory.map((c) => c.count))

interface MonthlyTrend {
  month: string
  collected: number
  projects: number
}

const monthlyTrend: MonthlyTrend[] = [
  { month: 'Jan', collected: 2, projects: 1 },
  { month: 'Fév', collected: 4, projects: 1 },
  { month: 'Mar', collected: 5, projects: 2 },
  { month: 'Avr', collected: 7, projects: 2 },
  { month: 'Mai', collected: 9, projects: 3 },
  { month: 'Jun', collected: 10, projects: 3 },
]

const maxTrend = Math.max(...monthlyTrend.map((m) => m.collected))

const conversionRate = computed(() =>
  impact.materialsCollected > 0
    ? Math.round((impact.projectsCompleted / impact.materialsCollected) * 100)
    : 0,
)
</script>

<template>
  <ProDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Analytics Premium</span>
        <h1>Statistiques avancées</h1>
        <p class="muted measure">
          Suivez votre impact environnemental et l'évolution de votre activité d'upcycling.
        </p>
      </div>
      <span class="badge badge--success">Premium</span>
    </header>

    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>Impact écologique</h3>
      <div class="stats-row">
        <div class="stat-tile">
          <span class="stat-tile-label">Déchets évités</span>
          <div class="stat-tile-value-row">
            <span class="stat-tile-value">{{ impact.wasteAvoided }}</span>
            <span class="badge badge--success">kg</span>
          </div>
          <p class="small muted">Grâce à vos collectes et projets</p>
        </div>

        <div class="stat-tile">
          <span class="stat-tile-label">CO₂ économisé</span>
          <div class="stat-tile-value-row">
            <span class="stat-tile-value">{{ impact.co2Saved }}</span>
            <span class="badge badge--success">kg</span>
          </div>
          <p class="small muted">
            Équivalent à {{ Math.round(impact.co2Saved / 2.3) }} trajets Paris → Lyon
          </p>
        </div>

        <div class="stat-tile">
          <span class="stat-tile-label">Matériaux collectés</span>
          <span class="stat-tile-value">{{ impact.materialsCollected }}</span>
          <p class="small muted">Objets récupérés et valorisés</p>
        </div>

        <div class="stat-tile">
          <span class="stat-tile-label">Taux de transformation</span>
          <div class="stat-tile-value-row">
            <span class="stat-tile-value">{{ conversionRate }}%</span>
            <span class="badge badge--accent">+8% vs mois dernier</span>
          </div>
          <p class="small muted">Collectes → projets terminés</p>
        </div>
      </div>
    </section>

    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>Matériaux collectés par catégorie</h3>
      <div class="dashboard-card">
        <ul class="layout-flex layout-columns layout-gap-medium">
          <li v-for="cat in byCategory" :key="cat.label" class="breakdown-row">
            <div class="layout-flex layout-justify-between layout-items-center">
              <span style="font-weight: 600">{{ cat.label }}</span>
              <span class="mono">
                <strong>{{ cat.count }}</strong> objets
              </span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{
                  width: `${(cat.count / maxCategory) * 100}%`,
                  background: cat.color,
                }"
              ></div>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>Évolution mensuelle — Collectes 2026</h3>
      <div class="dashboard-card history-chart">
        <div v-for="m in monthlyTrend" :key="m.month" class="history-bar">
          <div class="history-bar-fill" :style="{ height: `${(m.collected / maxTrend) * 100}%` }">
            <span class="tiny mono">{{ m.collected }}</span>
          </div>
          <span class="tiny muted">{{ m.month }}</span>
        </div>
      </div>
    </section>

    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>Projets lancés par mois</h3>
      <div class="dashboard-card history-chart">
        <div v-for="m in monthlyTrend" :key="m.month" class="history-bar">
          <div
            class="history-bar-fill"
            :style="{
              height: `${(m.projects / Math.max(...monthlyTrend.map((x) => x.projects))) * 100}%`,
              background: 'var(--purple-500)',
            }"
          >
            <span class="tiny mono">{{ m.projects }}</span>
          </div>
          <span class="tiny muted">{{ m.month }}</span>
        </div>
      </div>
    </section>

    <div class="alert alert--accent">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <span>
        Ces statistiques sont disponibles dans le cadre de votre abonnement
        <strong>Premium</strong>. Les données sont mises à jour quotidiennement.
      </span>
    </div>
  </ProDashboardLayout>
</template>
