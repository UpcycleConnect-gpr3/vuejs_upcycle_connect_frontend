<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useUiAuthModalStore } from '@/stores/uiAuthModal'
import { useAuthStore } from '@/stores/authStore'
import { useToastsStore } from '@/stores/toasts'
import { createSubscriptionCheckout } from '@/services/billing'

const ui = useUiAuthModalStore()
const auth = useAuthStore()
const toasts = useToastsStore()
const route = useRoute()
const { t } = useI18n()

interface Plan {
  name: string
  price: string
  description: string
  features: string[]
  featured: boolean
  cta: string
  priceId?: string
}

const plans: Plan[] = [
  {
    name: 'Basic',
    price: '0',
    description: t('pricingPage.plans.basic.description'),
    features: [
      t('pricingPage.plans.basic.features.project'),
      t('pricingPage.plans.basic.features.forum'),
      t('pricingPage.plans.basic.features.marketplace'),
      t('pricingPage.plans.basic.features.support'),
      t('pricingPage.plans.basic.features.analytics'),
      t('pricingPage.plans.basic.features.training'),
    ],
    featured: false,
    cta: t('pricingPage.plans.basic.cta'),
  },
  {
    name: 'Pro',
    price: '15',
    description: t('pricingPage.plans.pro.description'),
    features: [
      t('pricingPage.plans.pro.features.projects'),
      t('pricingPage.plans.pro.features.forum'),
      t('pricingPage.plans.pro.features.marketplace'),
      t('pricingPage.plans.pro.features.support'),
      t('pricingPage.plans.pro.features.analytics'),
      t('pricingPage.plans.pro.features.training'),
      t('pricingPage.plans.pro.features.branding'),
      t('pricingPage.plans.pro.features.api'),
      t('pricingPage.plans.pro.features.webhooks'),
    ],
    featured: true,
    cta: t('pricingPage.plans.pro.cta'),
    priceId: import.meta.env.VITE_STRIPE_PRICE_BASIC,
  },
  {
    name: 'Business',
    price: '30',
    description: t('pricingPage.plans.business.description'),
    features: [
      t('pricingPage.plans.business.features.everything'),
      t('pricingPage.plans.business.features.manager'),
      t('pricingPage.plans.business.features.sso'),
      t('pricingPage.plans.business.features.auditLogs'),
      t('pricingPage.plans.business.features.integrations'),
      t('pricingPage.plans.business.features.sla'),
    ],
    featured: false,
    cta: t('pricingPage.plans.business.cta'),
    priceId: import.meta.env.VITE_STRIPE_PRICE_BUSINESS,
  },
]

const loadingPlan = ref<string | null>(null)

async function choosePlan(plan: Plan) {
  if (!plan.priceId) {
    ui.open('register')
    return
  }
  if (!auth.isAuthenticated) {
    ui.open('login')
    return
  }
  loadingPlan.value = plan.name
  try {
    const { url } = await createSubscriptionCheckout(plan.priceId)
    window.location.href = url
  } catch {
    toasts.error(t('pricingPage.toast.checkoutError'))
    loadingPlan.value = null
  }
}

onMounted(() => {
  if (route.query.checkout === 'canceled') {
    toasts.error(t('pricingPage.toast.checkoutCanceled'))
  }
})
</script>

<template>
  <AppHeader />

  <main>
    <section class="loose">
      <div class="container layout-flex layout-columns layout-items-center layout-gap-large">
        <span class="eyebrow">{{ $t('pricingPage.hero.eyebrow') }}</span>
        <hgroup class="center">
          <h1 class="center">{{ $t('pricingPage.hero.title_line1') }}<br />{{ $t('pricingPage.hero.title_line2') }}</h1>
          <p class="lead center measure" style="margin-inline: auto">
            {{ $t('pricingPage.hero.subtitle') }}
          </p>
        </hgroup>
      </div>
    </section>

    <section>
      <div class="container layout-flex layout-columns layout-gap-extra-large">
        <div class="pricing-grid">
          <div
            v-for="plan in plans"
            :key="plan.name"
            class="pricing-card"
            :class="{ featured: plan.featured }"
          >
            <div class="plan-header">
              <span class="plan-name">{{ $t('pricingPage.planLabel', { name: plan.name }) }}</span>
              <div class="plan-price-row">
                <span class="plan-price">{{ plan.price }}€</span>
                <span class="plan-price-unit">{{ $t('pricingPage.perMonth') }}</span>
              </div>
              <p class="small muted">{{ plan.description }}</p>
            </div>

            <ul class="plan-features">
              <li v-for="(f, i) in plan.features" :key="i" class="plan-feature">
                <svg
                  class="plan-feature-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="m5 12 5 5L20 7" />
                </svg>
                {{ f }}
              </li>
            </ul>

            <button
              :class="plan.featured ? 'primary medium full-width' : 'secondary medium full-width'"
              :disabled="loadingPlan === plan.name"
              @click="choosePlan(plan)"
            >
              {{ loadingPlan === plan.name ? $t('pricingPage.redirecting') : plan.cta }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="container layout-flex layout-columns layout-items-center layout-gap-extra-large">
        <hgroup class="center">
          <span class="eyebrow">{{ $t('pricingPage.beyond.eyebrow') }}</span>
          <h2 class="center">{{ $t('pricingPage.beyond.title') }}</h2>
          <p class="center measure" style="margin-inline: auto">
            {{ $t('pricingPage.beyond.subtitle') }}
          </p>
        </hgroup>

        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-label">{{ $t('pricingPage.beyond.ads.label') }}</span>
            <div class="stat-value-row">
              <span class="stat-value">{{ $t('pricingPage.beyond.ads.value') }}</span>
              <span class="stat-value-unit">{{ $t('pricingPage.beyond.ads.unit') }}</span>
            </div>
            <p class="small muted">{{ $t('pricingPage.beyond.ads.description') }}</p>
          </div>
          <div class="stat-box">
            <span class="stat-label">{{ $t('pricingPage.beyond.commission.label') }}</span>
            <div class="stat-value-row">
              <span class="stat-value">{{ $t('pricingPage.beyond.commission.value') }}</span>
              <span class="stat-value-unit">{{ $t('pricingPage.beyond.commission.unit') }}</span>
            </div>
            <p class="small muted">{{ $t('pricingPage.beyond.commission.description') }}</p>
          </div>
          <div class="stat-box">
            <span class="stat-label">{{ $t('pricingPage.beyond.training.label') }}</span>
            <div class="stat-value-row">
              <span class="stat-value">{{ $t('pricingPage.beyond.training.value') }}</span>
              <span class="stat-value-unit">{{ $t('pricingPage.beyond.training.unit') }}</span>
            </div>
            <p class="small muted">{{ $t('pricingPage.beyond.training.description') }}</p>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="container">
        <div
          class="card layout-flex layout-columns layout-items-center layout-gap-large"
          style="padding: var(--space-16); text-align: center"
        >
          <span class="eyebrow">{{ $t('pricingPage.cta.eyebrow') }}</span>
          <h2 class="center">{{ $t('pricingPage.cta.title') }}</h2>
          <p class="lead center measure" style="margin-inline: auto">
            {{ $t('pricingPage.cta.subtitle') }}
          </p>
          <div class="layout-flex layout-gap-medium">
            <button class="primary large" @click="ui.open('register')">
              {{ $t('pricingPage.cta.primary') }}
            </button>
            <button class="secondary large">{{ $t('pricingPage.cta.secondary') }}</button>
          </div>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>
