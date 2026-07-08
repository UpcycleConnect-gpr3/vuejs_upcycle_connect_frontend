<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/components/DashboardLayout.vue'

const { t } = useI18n()

const stats = {
  score: 482,
  scoreDelta: '+24',
  listingsActive: 3,
  upcomingEvents: 2,
  pendingDeposits: 1,
}

const upcoming = [
  {
    id: 1,
    title: t('dashHome.upcoming.item1.title'),
    date: t('dashHome.upcoming.item1.date'),
    location: t('dashHome.upcoming.item1.location'),
    kind: t('dashHome.upcoming.item1.kind'),
  },
  {
    id: 2,
    title: t('dashHome.upcoming.item2.title'),
    date: t('dashHome.upcoming.item2.date'),
    location: t('dashHome.upcoming.item2.location'),
    kind: t('dashHome.upcoming.item2.kind'),
  },
]

const alerts = [
  { type: 'success', text: t('dashHome.alerts.listingApproved', { title: 'Table basse palette' }) },
  { type: 'accent', text: t('dashHome.alerts.depositCodeReceived', { code: '#DEP-204' }) },
]
</script>

<template>
  <DashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">{{ $t('dashHome.eyebrow') }}</span>
        <h1>{{ $t('dashHome.greeting', { name: 'Jean' }) }}</h1>
        <p class="muted measure">{{ $t('dashHome.subtitle') }}</p>
      </div>
      <div class="layout-flex layout-gap-medium">
        <RouterLink to="/dashboard/deposits/new" class="ghost medium">{{
          $t('dashHome.ctaDeposit')
        }}</RouterLink>
        <RouterLink to="/dashboard/listings/new" class="primary medium" data-tour="new-listing"
          >{{ $t('dashHome.ctaNewListing') }}</RouterLink
        >
      </div>
    </header>

    <div class="stats-row">
      <RouterLink to="/dashboard/score" class="stat-tile" data-tour="score">
        <span class="stat-tile-label">{{ $t('dashHome.stats.scoreLabel') }}</span>
        <div class="stat-tile-value-row">
          <span class="stat-tile-value">{{ stats.score }}</span>
          <span class="badge badge--success">{{
            $t('dashHome.stats.scoreDelta', { delta: stats.scoreDelta })
          }}</span>
        </div>
        <p class="small muted">{{ $t('dashHome.stats.scoreRank') }}</p>
      </RouterLink>

      <RouterLink to="/dashboard/listings" class="stat-tile">
        <span class="stat-tile-label">{{ $t('dashHome.stats.listingsLabel') }}</span>
        <span class="stat-tile-value">{{ stats.listingsActive }}</span>
        <p class="small muted">{{ $t('dashHome.stats.listingsPending', { count: 2 }) }}</p>
      </RouterLink>

      <RouterLink to="/dashboard/planning" class="stat-tile">
        <span class="stat-tile-label">{{ $t('dashHome.stats.sessionsLabel') }}</span>
        <span class="stat-tile-value">{{ stats.upcomingEvents }}</span>
        <p class="small muted">{{ $t('dashHome.stats.sessionsThisWeek') }}</p>
      </RouterLink>

      <RouterLink to="/dashboard/deposits" class="stat-tile">
        <span class="stat-tile-label">{{ $t('dashHome.stats.depositsLabel') }}</span>
        <div class="stat-tile-value-row">
          <span class="stat-tile-value">{{ stats.pendingDeposits }}</span>
          <span class="badge badge--accent">{{ $t('dashHome.stats.action') }}</span>
        </div>
        <p class="small muted">{{ $t('dashHome.stats.depositsAvailable', { count: 1 }) }}</p>
      </RouterLink>
    </div>

    <section v-if="alerts.length" class="layout-flex layout-columns layout-gap-small">
      <div v-for="(a, i) in alerts" :key="i" class="alert" :class="`alert--${a.type}`">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <span>{{ a.text }}</span>
      </div>
    </section>

    <div class="dashboard-grid">
      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">{{ $t('dashHome.thisWeek') }}</span>
          <h3>{{ $t('dashHome.upcomingAppointments') }}</h3>
        </div>
        <ul class="layout-flex layout-columns layout-gap-medium">
          <li v-for="e in upcoming" :key="e.id" class="event-row">
            <div class="event-row-date">
              <span class="tiny uppercase muted">{{ e.kind }}</span>
              <span style="font-weight: 700">{{ e.date }}</span>
            </div>
            <div style="flex: 1">
              <div style="font-weight: 600">{{ e.title }}</div>
              <div class="tiny muted">{{ e.location }}</div>
            </div>
            <RouterLink to="/dashboard/planning" class="ghost small">{{
              $t('dashHome.detail')
            }}</RouterLink>
          </li>
        </ul>
        <RouterLink to="/dashboard/planning" class="ghost small" style="align-self: flex-start"
          >{{ $t('dashHome.seeAllAppointments') }} </RouterLink
        >
      </article>

      <article class="dashboard-card">
        <div class="card-header">
          <span class="eyebrow">{{ $t('dashHome.adviceEyebrow') }}</span>
          <h3>{{ $t('dashHome.readThisWeek') }}</h3>
        </div>
        <ul class="layout-flex layout-columns layout-gap-medium">
          <li class="advice-mini">
            <span class="badge">{{ $t('dashHome.adviceMini.item1.badge') }}</span>
            <span style="font-weight: 600">{{ $t('dashHome.adviceMini.item1.title') }}</span>
            <span class="tiny muted">{{
              $t('dashHome.adviceMini.readTime', { min: 5 })
            }}</span>
          </li>
          <li class="advice-mini">
            <span class="badge">{{ $t('dashHome.adviceMini.item2.badge') }}</span>
            <span style="font-weight: 600">{{ $t('dashHome.adviceMini.item2.title') }}</span>
            <span class="tiny muted">{{
              $t('dashHome.adviceMini.readTime', { min: 8 })
            }}</span>
          </li>
        </ul>
        <RouterLink to="/dashboard/advice" class="ghost small" style="align-self: flex-start"
          >{{ $t('dashHome.seeAllAdvice') }} </RouterLink
        >
      </article>
    </div>
  </DashboardLayout>
</template>
