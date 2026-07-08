<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'
import { createSubscriptionCheckout } from '@/services/billing'
import { getMySubscription } from '@/api/clients/statsClient'
import { getMyInvoices, downloadInvoicePdf } from '@/api/clients/invoiceClient'
import { useToastsStore } from '@/stores/toasts'
import type { Invoice, Subscription } from '@/types'

const toasts = useToastsStore()
const { t } = useI18n()

const invoices = ref<Invoice[]>([])
const downloadingRef = ref<string | null>(null)

const loadInvoices = async () => {
  try {
    invoices.value = await getMyInvoices()
  } catch {
    invoices.value = []
  }
}

const downloadPdf = async (inv: Invoice) => {
  downloadingRef.value = inv.ref
  try {
    await downloadInvoicePdf(inv.ref)
  } catch {
    toasts.error(t('proSubscription.errors.downloadFailed'))
  } finally {
    downloadingRef.value = null
  }
}
const PRICE_BASIC = import.meta.env.VITE_STRIPE_PRICE_BASIC
const PRICE_BUSINESS = import.meta.env.VITE_STRIPE_PRICE_BUSINESS
const PRICE_IDS: Record<'starter' | 'premium', string> = {
  starter: PRICE_BASIC,
  premium: PRICE_BUSINESS,
}

const subscription = ref<Subscription | null>(null)

const currentPlan = computed(() => {
  const sub = subscription.value
  if (!sub) return null
  if (sub.price_id === PRICE_BUSINESS) return { name: 'Business', price: 30 }
  if (sub.price_id === PRICE_BASIC) return { name: 'Basic', price: 15 }
  return { name: t('proSubscription.genericPlanName'), price: 0 }
})

const isActive = computed(() => subscription.value?.status === 'active')

onMounted(async () => {
  try {
    subscription.value = await getMySubscription()
  } catch {

  }
  await loadInvoices()
})

const showChangeModal = ref(false)
const showCancelModal = ref(false)
const selectedPlan = ref<'starter' | 'premium'>('premium')

const plans = computed(() => [
  {
    key: 'starter' as const,
    name: 'Starter',
    price: 15,
    features: [
      t('proSubscription.plans.starterFeatures.listings'),
      t('proSubscription.plans.starterFeatures.alerts'),
      t('proSubscription.plans.starterFeatures.featured'),
    ],
  },
  {
    key: 'premium' as const,
    name: 'Premium',
    price: 29,
    features: [
      t('proSubscription.plans.premiumFeatures.listings'),
      t('proSubscription.plans.premiumFeatures.alerts'),
      t('proSubscription.plans.premiumFeatures.stats'),
      t('proSubscription.plans.premiumFeatures.featured'),
      t('proSubscription.plans.premiumFeatures.support'),
    ],
  },
])

async function confirmPlanChange() {
  const priceId = PRICE_IDS[selectedPlan.value]
  if (!priceId) {
    toasts.error(t('proSubscription.errors.planNotConfigured'))
    return
  }
  try {
    const { url } = await createSubscriptionCheckout(priceId)
    window.location.href = url
  } catch {
    toasts.error(t('proSubscription.errors.checkoutFailed'))
  }
}

function confirmCancel() {
  showCancelModal.value = false
}
</script>

<template>
  <ProDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">{{ $t('proSubscription.eyebrow') }}</span>
        <h1>{{ $t('proSubscription.title') }}</h1>
        <p class="muted measure">
          {{ $t('proSubscription.subtitle') }}
        </p>
      </div>
    </header>

    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>{{ $t('proSubscription.currentPlan.title') }}</h3>
      <div class="dashboard-card">
        <div v-if="currentPlan">
          <div
            class="layout-flex layout-gap-small"
            style="align-items: center; margin-bottom: var(--space-2)"
          >
            <h2 style="margin: 0">{{ currentPlan.name }}</h2>
            <span class="badge" :class="isActive ? 'badge--success' : 'badge--muted'">
              {{ isActive ? $t('proSubscription.currentPlan.active') : $t('proSubscription.currentPlan.pending') }}
            </span>
          </div>
          <div class="mono" style="font-size: var(--font-size-xlarge); font-weight: 700">
            {{ $t('proSubscription.currentPlan.priceMonthly', { price: currentPlan.price }) }}
          </div>
        </div>
        <p v-else class="muted">
          {{ $t('proSubscription.currentPlan.none') }}
        </p>

        <div class="layout-flex layout-gap-small" style="margin-top: var(--space-4)">
          <button class="primary medium" @click="showChangeModal = true">
            {{ currentPlan ? $t('proSubscription.currentPlan.change') : $t('proSubscription.currentPlan.choose') }}
          </button>
          <button
            v-if="currentPlan"
            class="ghost medium"
            style="color: var(--destructive-color)"
            @click="showCancelModal = true"
          >
            {{ $t('proSubscription.currentPlan.cancelSubscription') }}
          </button>
        </div>
      </div>
    </section>

    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>{{ $t('proSubscription.billing.title') }}</h3>
      <p v-if="!invoices.length" class="muted small">{{ $t('proSubscription.billing.empty') }}</p>
      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>{{ $t('proSubscription.billing.date') }}</th>
              <th>{{ $t('proSubscription.billing.reference') }}</th>
              <th>{{ $t('proSubscription.billing.label') }}</th>
              <th>{{ $t('proSubscription.billing.amount') }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in invoices" :key="inv.ref">
              <td class="mono small">{{ inv.issued_at.slice(0, 10) }}</td>
              <td class="mono small">{{ inv.ref.replace(/_/g, '-').toUpperCase() }}</td>
              <td>{{ inv.label }}</td>
              <td class="mono" style="font-weight: 700">
                {{ (inv.amount_cents / 100).toFixed(2) }}€
              </td>
              <td>
                <button
                  class="ghost small"
                  :disabled="downloadingRef === inv.ref"
                  @click="downloadPdf(inv)"
                >
                  {{ downloadingRef === inv.ref ? '…' : $t('proSubscription.billing.pdf') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <AppModal :open="showChangeModal" size="medium" @close="showChangeModal = false">
      <template #header>
        <h3>{{ $t('proSubscription.changeModal.title') }}</h3>
      </template>

      <div class="layout-flex layout-columns layout-gap-medium">
        <p class="muted">{{ $t('proSubscription.changeModal.description') }}</p>
        <div class="layout-flex layout-gap-medium" style="flex-wrap: wrap">
          <div
            v-for="plan in plans"
            :key="plan.key"
            class="dashboard-card"
            style="flex: 1; min-width: 200px; cursor: pointer; border: 2px solid transparent"
            :style="selectedPlan === plan.key ? { borderColor: 'var(--lime-500)' } : {}"
            @click="selectedPlan = plan.key"
          >
            <div
              class="layout-flex layout-gap-small"
              style="align-items: center; margin-bottom: var(--space-2)"
            >
              <h4 style="margin: 0">{{ plan.name }}</h4>
              <span v-if="plan.key === 'premium'" class="badge badge--accent">{{ $t('proSubscription.changeModal.recommended') }}</span>
            </div>
            <div
              class="mono"
              style="
                font-size: var(--font-size-large);
                font-weight: 700;
                margin-bottom: var(--space-2);
              "
            >
              {{ $t('proSubscription.changeModal.priceMonthly', { price: plan.price }) }}
            </div>
            <ul class="layout-flex layout-columns layout-gap-small">
              <li
                v-for="f in plan.features"
                :key="f"
                class="small"
                style="display: flex; gap: var(--space-1)"
              >
                <span style="color: var(--lime-500)"></span>
                {{ f }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="ghost medium" @click="showChangeModal = false">{{ $t('common.cancel') }}</button>
        <button class="primary medium" @click="confirmPlanChange">{{ $t('proSubscription.changeModal.confirm') }}</button>
      </template>
    </AppModal>

    <AppModal
      :open="showCancelModal"
      size="small"
      :title="$t('proSubscription.cancelModal.title')"
      @close="showCancelModal = false"
    >
      <div class="layout-flex layout-columns layout-gap-medium">
        <div class="alert alert--danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <span>
            {{ $t('proSubscription.cancelModal.warning') }}
          </span>
        </div>
        <p class="muted small">
          {{ $t('proSubscription.cancelModal.note') }}
        </p>
      </div>
      <template #footer>
        <button class="ghost medium" @click="showCancelModal = false">
          {{ $t('proSubscription.cancelModal.keep') }}
        </button>
        <button class="ghost medium" style="color: var(--destructive-color)" @click="confirmCancel">
          {{ $t('proSubscription.cancelModal.confirm') }}
        </button>
      </template>
    </AppModal>
  </ProDashboardLayout>
</template>
