<script setup lang="ts">
import { ref } from 'vue'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'

type InvoiceStatus = 'payée' | 'en attente' | 'échouée'

interface Invoice {
  id: string
  date: string
  number: string
  amount: number
  status: InvoiceStatus
}

const currentPlan = {
  name: 'Premium',
  price: 29,
  billingCycle: 'mensuel',
  nextRenewal: '2026-07-15',
  features: [
    'Accès prioritaire aux annonces',
    'Alertes de collecte en temps réel',
    'Statistiques avancées',
    'Mise en avant de 3 projets / mois',
    'Support prioritaire',
  ],
}

const invoices = ref<Invoice[]>([
  { id: '1', date: '2026-06-15', number: 'FAC-2026-0142', amount: 29, status: 'payée' },
  { id: '2', date: '2026-05-15', number: 'FAC-2026-0118', amount: 29, status: 'payée' },
  { id: '3', date: '2026-04-15', number: 'FAC-2026-0091', amount: 29, status: 'payée' },
  { id: '4', date: '2026-03-15', number: 'FAC-2026-0064', amount: 15, status: 'payée' },
  { id: '5', date: '2026-02-15', number: 'FAC-2026-0037', amount: 15, status: 'payée' },
])

const invoiceStatusMeta: Record<InvoiceStatus, { badge: string }> = {
  payée: { badge: 'badge--success' },
  'en attente': { badge: 'badge--accent' },
  échouée: { badge: 'badge--danger' },
}

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

function confirmPlanChange() {
  showChangeModal.value = false
}

function confirmCancel() {
  showCancelModal.value = false
}

function downloadPdf(invoice: Invoice) {
  // Demo only — no real PDF
  console.info('Téléchargement simulé :', invoice.number)
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

    <!-- Current plan -->
    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>Formule actuelle</h3>
      <div class="dashboard-card">
        <div class="layout-flex layout-justify-between" style="flex-wrap: wrap; gap: var(--space-4)">
          <div>
            <div class="layout-flex layout-gap-small" style="align-items: center; margin-bottom: var(--space-2)">
              <h2 style="margin: 0">{{ currentPlan.name }}</h2>
              <span class="badge badge--success">Actif</span>
            </div>
            <div class="mono" style="font-size: var(--font-size-xlarge); font-weight: 700; margin-bottom: var(--space-2)">
              {{ currentPlan.price }}€ / mois
            </div>
            <div class="small muted">Prochain renouvellement : <span class="mono">{{ currentPlan.nextRenewal }}</span></div>
          </div>
          <ul class="layout-flex layout-columns layout-gap-small">
            <li v-for="f in currentPlan.features" :key="f" class="small" style="display: flex; gap: var(--space-2)">
              <span style="color: var(--lime-500)">✓</span>
              {{ f }}
            </li>
          </ul>
        </div>

        <div class="layout-flex layout-gap-small" style="margin-top: var(--space-4)">
          <button class="primary medium" @click="showChangeModal = true">Changer de formule</button>
          <button class="ghost medium" style="color: var(--destructive-color)" @click="showCancelModal = true">
            Résilier l'abonnement
          </button>
        </div>
      </div>
    </section>

    <!-- Invoices -->
    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>Historique de facturation</h3>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Numéro</th>
              <th>Montant</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in invoices" :key="inv.id">
              <td class="mono small">{{ inv.date }}</td>
              <td class="mono small">{{ inv.number }}</td>
              <td class="mono" style="font-weight: 700">{{ inv.amount }}€</td>
              <td>
                <span class="badge" :class="invoiceStatusMeta[inv.status].badge">{{ inv.status }}</span>
              </td>
              <td>
                <button class="ghost small" @click="downloadPdf(inv)">Télécharger PDF</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Change plan modal -->
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
            <div class="layout-flex layout-gap-small" style="align-items: center; margin-bottom: var(--space-2)">
              <h4 style="margin: 0">{{ plan.name }}</h4>
              <span v-if="plan.key === 'premium'" class="badge badge--accent">Recommandé</span>
            </div>
            <div class="mono" style="font-size: var(--font-size-large); font-weight: 700; margin-bottom: var(--space-2)">
              {{ plan.price }}€ / mois
            </div>
            <ul class="layout-flex layout-columns layout-gap-small">
              <li v-for="f in plan.features" :key="f" class="small" style="display: flex; gap: var(--space-1)">
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

    <!-- Cancel modal -->
    <AppModal :open="showCancelModal" size="small" title="Résilier l'abonnement" @close="showCancelModal = false">
      <div class="layout-flex layout-columns layout-gap-medium">
        <div class="alert alert--danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <span>
            En résiliant, vous perdrez l'accès aux fonctionnalités Premium à la fin de la période en cours
            ({{ currentPlan.nextRenewal }}).
          </span>
        </div>
        <p class="muted small">Vous pouvez vous réabonner à tout moment. Votre historique de projets sera conservé.</p>
      </div>
      <template #footer>
        <button class="ghost medium" @click="showCancelModal = false">Conserver mon abonnement</button>
        <button class="ghost medium" style="color: var(--destructive-color)" @click="confirmCancel">
          Confirmer la résiliation
        </button>
      </template>
    </AppModal>
  </ProDashboardLayout>
</template>
