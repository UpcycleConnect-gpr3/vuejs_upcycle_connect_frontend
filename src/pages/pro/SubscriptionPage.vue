<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'
import { createSubscriptionCheckout } from '@/services/billing'
import { getMySubscription } from '@/api/clients/statsClient'
import { getMyInvoices, downloadInvoicePdf } from '@/api/clients/invoiceClient'
import { useToastsStore } from '@/stores/toasts'
import type { Invoice, Subscription } from '@/types'

const toasts = useToastsStore()

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
    toasts.error('Téléchargement du PDF impossible.')
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

// Formule deduite du price_id renvoye par l'API.
const currentPlan = computed(() => {
  const sub = subscription.value
  if (!sub) return null
  if (sub.price_id === PRICE_BUSINESS) return { name: 'Business', price: 30 }
  if (sub.price_id === PRICE_BASIC) return { name: 'Basic', price: 15 }
  return { name: 'Abonnement', price: 0 }
})

const isActive = computed(() => subscription.value?.status === 'active')

onMounted(async () => {
  try {
    subscription.value = await getMySubscription()
  } catch {
    // pas d'abonnement / non disponible
  }
  await loadInvoices()
})

const showChangeModal = ref(false)
const showCancelModal = ref(false)
const selectedPlan = ref<'starter' | 'premium'>('premium')

const plans = [
  {
    key: 'starter' as const,
    name: 'Starter',
    price: 15,
    features: ['Accès aux annonces', 'Alertes de collecte', '1 projet mis en avant / mois'],
  },
  {
    key: 'premium' as const,
    name: 'Premium',
    price: 29,
    features: [
      'Accès prioritaire aux annonces',
      'Alertes en temps réel',
      'Statistiques avancées',
      '3 projets mis en avant / mois',
      'Support prioritaire',
    ],
  },
]

async function confirmPlanChange() {
  const priceId = PRICE_IDS[selectedPlan.value]
  if (!priceId) {
    toasts.error('Cette formule n’est pas configurée.')
    return
  }
  try {
    const { url } = await createSubscriptionCheckout(priceId)
    window.location.href = url
  } catch {
    toasts.error('Impossible de démarrer le paiement. Réessayez.')
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
        <span class="eyebrow">Mon abonnement</span>
        <h1>Abonnement & facturation</h1>
        <p class="muted measure">
          Gérez votre formule, consultez vos factures et téléchargez vos justificatifs.
        </p>
      </div>
    </header>

    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>Formule actuelle</h3>
      <div class="dashboard-card">
        <div v-if="currentPlan">
          <div
            class="layout-flex layout-gap-small"
            style="align-items: center; margin-bottom: var(--space-2)"
          >
            <h2 style="margin: 0">{{ currentPlan.name }}</h2>
            <span class="badge" :class="isActive ? 'badge--success' : 'badge--muted'">
              {{ isActive ? 'Actif' : 'En attente' }}
            </span>
          </div>
          <div class="mono" style="font-size: var(--font-size-xlarge); font-weight: 700">
            {{ currentPlan.price }}€ / mois
          </div>
        </div>
        <p v-else class="muted">
          Vous n'avez pas d'abonnement actif. Choisissez une formule pour accéder aux outils Pro.
        </p>

        <div class="layout-flex layout-gap-small" style="margin-top: var(--space-4)">
          <button class="primary medium" @click="showChangeModal = true">
            {{ currentPlan ? 'Changer de formule' : 'Choisir une formule' }}
          </button>
          <button
            v-if="currentPlan"
            class="ghost medium"
            style="color: var(--destructive-color)"
            @click="showCancelModal = true"
          >
            Résilier l'abonnement
          </button>
        </div>
      </div>
    </section>

    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>Historique de facturation</h3>
      <p v-if="!invoices.length" class="muted small">Aucune facture pour le moment.</p>
      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Référence</th>
              <th>Désignation</th>
              <th>Montant</th>
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
                  {{ downloadingRef === inv.ref ? '…' : 'PDF' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <AppModal :open="showChangeModal" size="medium" @close="showChangeModal = false">
      <template #header>
        <h3>Changer de formule</h3>
      </template>

      <div class="layout-flex layout-columns layout-gap-medium">
        <p class="muted">Sélectionnez la formule qui correspond à votre activité.</p>
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
              <span v-if="plan.key === 'premium'" class="badge badge--accent">Recommandé</span>
            </div>
            <div
              class="mono"
              style="
                font-size: var(--font-size-large);
                font-weight: 700;
                margin-bottom: var(--space-2);
              "
            >
              {{ plan.price }}€ / mois
            </div>
            <ul class="layout-flex layout-columns layout-gap-small">
              <li
                v-for="f in plan.features"
                :key="f"
                class="small"
                style="display: flex; gap: var(--space-1)"
              >
                <span style="color: var(--lime-500)">✓</span>
                {{ f }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="ghost medium" @click="showChangeModal = false">Annuler</button>
        <button class="primary medium" @click="confirmPlanChange">Confirmer le changement</button>
      </template>
    </AppModal>

    <AppModal
      :open="showCancelModal"
      size="small"
      title="Résilier l'abonnement"
      @close="showCancelModal = false"
    >
      <div class="layout-flex layout-columns layout-gap-medium">
        <div class="alert alert--danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <span>
            En résiliant, vous perdrez l'accès aux fonctionnalités Pro à la fin de la période en
            cours.
          </span>
        </div>
        <p class="muted small">
          Vous pouvez vous réabonner à tout moment. Votre historique de projets sera conservé.
        </p>
      </div>
      <template #footer>
        <button class="ghost medium" @click="showCancelModal = false">
          Conserver mon abonnement
        </button>
        <button class="ghost medium" style="color: var(--destructive-color)" @click="confirmCancel">
          Confirmer la résiliation
        </button>
      </template>
    </AppModal>
  </ProDashboardLayout>
</template>
