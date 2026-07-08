<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { getCheckoutStatus, getPaymentStatus } from '@/services/billing'

const route = useRoute()

const state = ref<'loading' | 'paid' | 'pending' | 'error'>('loading')
const isAnnonce = route.query.kind === 'annonce'

onMounted(async () => {
  const sessionId = route.query.session_id as string | undefined
  if (!sessionId) {
    state.value = 'error'
    return
  }

  const fetchStatus = isAnnonce ? getPaymentStatus : getCheckoutStatus

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const { status } = await fetchStatus(sessionId)
      if (status === 'paid') {
        state.value = 'paid'
        return
      }
      if (status === 'failed' || status === 'unpaid') {
        state.value = 'error'
        return
      }
    } catch {
      state.value = 'pending'
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }
  state.value = 'pending'
})
</script>

<template>
  <AppHeader />

  <main>
    <section class="loose">
      <div class="container layout-flex layout-columns layout-items-center layout-gap-large">
        <div class="billing-result">
          <template v-if="state === 'loading'">
            <span class="eyebrow">{{ $t('billingSuccess.eyebrow') }}</span>
            <h1 class="center">{{ $t('billingSuccess.loading.title') }}</h1>
            <p class="muted measure center">
              {{ $t('billingSuccess.loading.description') }}
            </p>
          </template>

          <template v-else-if="state === 'paid'">
            <span class="billing-result-icon billing-result-icon--ok"></span>
            <h1 class="center">{{ isAnnonce ? $t('billingSuccess.paid.titleAnnonce') : $t('billingSuccess.paid.titleSubscription') }}</h1>
            <p class="muted measure center">
              {{
                isAnnonce
                  ? $t('billingSuccess.paid.descriptionAnnonce')
                  : $t('billingSuccess.paid.descriptionSubscription')
              }}
            </p>
            <RouterLink :to="isAnnonce ? '/annonces' : '/dashboard'" class="primary large">{{
              isAnnonce ? $t('billingSuccess.paid.ctaAnnonce') : $t('billingSuccess.dashboardCta')
            }}</RouterLink>
          </template>

          <template v-else-if="state === 'pending'">
            <span class="billing-result-icon"></span>
            <h1 class="center">{{ $t('billingSuccess.pending.title') }}</h1>
            <p class="muted measure center">
              {{ $t('billingSuccess.pending.description') }}
            </p>
            <RouterLink to="/dashboard" class="primary large"
              >{{ $t('billingSuccess.dashboardCta') }}</RouterLink
            >
          </template>

          <template v-else>
            <span class="billing-result-icon billing-result-icon--error"></span>
            <h1 class="center">{{ $t('billingSuccess.error.title') }}</h1>
            <p class="muted measure center">
              {{ $t('billingSuccess.error.description') }}
            </p>
            <RouterLink to="/pricing" class="secondary large">{{ $t('billingSuccess.error.backToPricing') }}</RouterLink>
          </template>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>

<style scoped>
.billing-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
  max-width: 520px;
  padding: var(--space-12) var(--space-6);
  text-align: center;
}

.billing-result-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  font-size: 32px;
  border: 2px solid var(--border-strong-color);
  color: var(--text-secondary);
}

.billing-result-icon--ok {
  border-color: var(--lime-500);
  color: var(--lime-500);
}

.billing-result-icon--error {
  border-color: var(--destructive-color);
  color: var(--destructive-color);
}
</style>
