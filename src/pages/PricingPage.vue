<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const plans = [
  {
    name: 'Basic',
    price: '0',
    description: 'For individuals getting started.',
    features: ['1 project', 'Community forum', 'Public marketplace', 'Email support', 'Standard analytics', 'Basic training'],
    featured: false,
    cta: 'Start for free',
  },
  {
    name: 'Pro',
    price: '15',
    description: 'For makers and small teams.',
    features: [
      'Unlimited projects', 'Private forum spaces', 'Priority marketplace',
      'Priority support', 'Advanced analytics', 'All trainings', 'Custom branding', 'API access', 'Webhooks',
    ],
    featured: true,
    cta: 'Start Pro trial',
  },
  {
    name: 'Business',
    price: '30',
    description: 'For organisations that scale.',
    features: ['Everything in Pro', 'Dedicated manager', 'SSO', 'Audit logs', 'Custom integrations', 'SLA 99.9%'],
    featured: false,
    cta: 'Contact sales',
  },
]
</script>

<template>
  <AppHeader />

  <main>
    <!-- Hero -->
    <section class="loose">
      <div class="container layout-flex layout-columns layout-items-center layout-gap-large">
        <span class="eyebrow">Pricing</span>
        <hgroup class="center">
          <h1 class="center">Simple pricing,<br />powerful platform</h1>
          <p class="lead center measure" style="margin-inline: auto;">
            Choose a plan that fits your ambition. No hidden fees. Cancel anytime.
          </p>
        </hgroup>
      </div>
    </section>

    <!-- Pricing plans -->
    <section>
      <div class="container layout-flex layout-columns layout-gap-extra-large">
        <div class="pricing-grid">
          <div v-for="plan in plans" :key="plan.name" class="pricing-card" :class="{ featured: plan.featured }">
            <div class="plan-header">
              <span class="plan-name">{{ plan.name }} plan</span>
              <div class="plan-price-row">
                <span class="plan-price">{{ plan.price }}€</span>
                <span class="plan-price-unit">/mois</span>
              </div>
              <p class="small muted">{{ plan.description }}</p>
            </div>

            <ul class="plan-features">
              <li v-for="(f, i) in plan.features" :key="i" class="plan-feature">
                <svg class="plan-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m5 12 5 5L20 7" />
                </svg>
                {{ f }}
              </li>
            </ul>

            <button :class="plan.featured ? 'primary medium full-width' : 'secondary medium full-width'">
              {{ plan.cta }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Other pricing -->
    <section>
      <div class="container layout-flex layout-columns layout-items-center layout-gap-extra-large">
        <hgroup class="center">
          <span class="eyebrow">Beyond subscriptions</span>
          <h2 class="center">Other Pricing plan</h2>
          <p class="center measure" style="margin-inline: auto;">
            Additional revenue streams for creators, sellers, and training providers.
          </p>
        </hgroup>

        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-label">Ads</span>
            <div class="stat-value-row">
              <span class="stat-value">100-500€</span>
              <span class="stat-value-unit">/ month · company</span>
            </div>
            <p class="small muted">Showcase your brand to our engaged community.</p>
          </div>
          <div class="stat-box">
            <span class="stat-label">Commission</span>
            <div class="stat-value-row">
              <span class="stat-value">5-10%</span>
              <span class="stat-value-unit">/ sales</span>
            </div>
            <p class="small muted">Transparent fees on each marketplace transaction.</p>
          </div>
          <div class="stat-box">
            <span class="stat-label">Training</span>
            <div class="stat-value-row">
              <span class="stat-value">20-100</span>
              <span class="stat-value-unit">/ people</span>
            </div>
            <p class="small muted">Per-seat pricing for in-house training sessions.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section>
      <div class="container">
        <div class="card layout-flex layout-columns layout-items-center layout-gap-large" style="padding: var(--space-16); text-align: center;">
          <span class="eyebrow">Ready ?</span>
          <h2 class="center">Get started in minutes</h2>
          <p class="lead center measure" style="margin-inline: auto;">
            Create your account, list your first project, and join the circular economy.
          </p>
          <div class="layout-flex layout-gap-medium">
            <button class="primary large">Create account</button>
            <button class="secondary large">Talk to sales</button>
          </div>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>
