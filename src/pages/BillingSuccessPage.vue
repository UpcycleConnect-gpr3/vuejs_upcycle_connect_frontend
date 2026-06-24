<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { getCheckoutStatus } from '@/services/billing'

const route = useRoute()

// loading → waiting for the webhook to persist the result
// paid     → confirmed in DB
// pending  → payment received, confirmation still propagating
// error    → no session / failed payment
const state = ref<'loading' | 'paid' | 'pending' | 'error'>('loading')

onMounted(async () => {
  const sessionId = route.query.session_id as string | undefined
  if (!sessionId) {
    state.value = 'error'
    return
  }

  // The webhook (checkout.session.completed) is the source of truth, and it
  // may land a moment after the redirect — poll a few times before giving up.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const { status } = await getCheckoutStatus(sessionId)
      if (status === 'paid') {
        state.value = 'paid'
        return
      }
      if (status === 'failed' || status === 'unpaid') {
        state.value = 'error'
        return
      }
    } catch {
      // Endpoint unavailable — assume the webhook will confirm shortly.
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
            <span class="eyebrow">Paiement</span>
            <h1 class="center">Confirmation en cours…</h1>
            <p class="muted measure center">
              Nous vérifions votre paiement auprès de Stripe. Merci de patienter quelques secondes.
            </p>
          </template>

          <template v-else-if="state === 'paid'">
            <span class="billing-result-icon billing-result-icon--ok">✓</span>
            <h1 class="center">Abonnement activé 🎉</h1>
            <p class="muted measure center">
              Votre paiement a bien été confirmé. Votre abonnement est actif.
            </p>
            <RouterLink to="/dashboard" class="primary large">Accéder au tableau de bord</RouterLink>
          </template>

          <template v-else-if="state === 'pending'">
            <span class="billing-result-icon">⏳</span>
            <h1 class="center">Paiement reçu</h1>
            <p class="muted measure center">
              Merci ! Votre paiement a été pris en compte. L'activation peut prendre un court
              instant le temps de la confirmation. Vous pouvez déjà accéder à votre espace.
            </p>
            <RouterLink to="/dashboard" class="primary large">Accéder au tableau de bord</RouterLink>
          </template>

          <template v-else>
            <span class="billing-result-icon billing-result-icon--error">✕</span>
            <h1 class="center">Paiement non confirmé</h1>
            <p class="muted measure center">
              Nous n'avons pas pu confirmer votre paiement. Si vous avez été débité, contactez le
              support — sinon réessayez.
            </p>
            <RouterLink to="/pricing" class="secondary large">Revenir aux tarifs</RouterLink>
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
