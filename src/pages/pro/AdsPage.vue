<script setup lang="ts">
import { ref, reactive } from 'vue'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'

type CampaignStatus = 'active' | 'terminée' | 'en attente'

interface Campaign {
  id: number
  name: string
  sponsoredItem: string
  budget: number
  startDate: string
  endDate: string
  status: CampaignStatus
  impressions: number
}

const campaigns = ref<Campaign[]>([
  {
    id: 1,
    name: 'Promo Lampe Bocaux',
    sponsoredItem: 'Projet : Lampe upcyclée bocaux',
    budget: 150,
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    status: 'terminée',
    impressions: 3240,
  },
  {
    id: 2,
    name: 'Boost Étagère Acier',
    sponsoredItem: 'Projet : Étagère tuyaux acier',
    budget: 200,
    startDate: '2026-06-15',
    endDate: '2026-07-15',
    status: 'active',
    impressions: 1875,
  },
  {
    id: 3,
    name: 'Mise en avant annonce cuir',
    sponsoredItem: 'Annonce : Chutes de cuir naturel',
    budget: 100,
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    status: 'en attente',
    impressions: 0,
  },
])

const statusMeta: Record<CampaignStatus, { badge: string }> = {
  active: { badge: 'badge--success' },
  terminée: { badge: 'badge--muted' },
  'en attente': { badge: 'badge--accent' },
}

const showNewModal = ref(false)

const form = reactive({
  name: '',
  sponsoredItem: '',
  budget: 100,
  startDate: '',
  endDate: '',
})

function createCampaign() {
  if (!form.name || !form.sponsoredItem || !form.startDate || !form.endDate) return
  campaigns.value.unshift({
    id: Date.now(),
    name: form.name,
    sponsoredItem: form.sponsoredItem,
    budget: form.budget,
    startDate: form.startDate,
    endDate: form.endDate,
    status: 'en attente',
    impressions: 0,
  })
  Object.assign(form, { name: '', sponsoredItem: '', budget: 100, startDate: '', endDate: '' })
  showNewModal.value = false
}

const totalBudget = () => campaigns.value.reduce((sum, c) => sum + c.budget, 0)
const totalImpressions = () => campaigns.value.reduce((sum, c) => sum + c.impressions, 0)
</script>

<template>
  <ProDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Sponsoring</span>
        <h1>Publicité & campagnes</h1>
        <p class="muted measure">
          Boostez la visibilité de vos annonces et projets grâce aux campagnes sponsorisées
          UpcycleConnect.
        </p>
      </div>
      <button class="primary medium" @click="showNewModal = true">+ Nouvelle campagne</button>
    </header>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-tile">
        <span class="stat-tile-label">Campagnes actives</span>
        <span class="stat-tile-value">{{ campaigns.filter((c) => c.status === 'active').length }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">Budget total investi</span>
        <div class="stat-tile-value-row">
          <span class="stat-tile-value mono">{{ totalBudget() }}€</span>
        </div>
        <p class="small muted">Toutes campagnes</p>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">Impressions totales</span>
        <span class="stat-tile-value mono">{{ totalImpressions().toLocaleString('fr-FR') }}</span>
        <p class="small muted">Vues cumulées</p>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">En attente</span>
        <div class="stat-tile-value-row">
          <span class="stat-tile-value">{{ campaigns.filter((c) => c.status === 'en attente').length }}</span>
          <span v-if="campaigns.some((c) => c.status === 'en attente')" class="badge badge--accent">Action</span>
        </div>
      </div>
    </div>

    <!-- Info alert -->
    <div class="alert alert--accent">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <span>Les campagnes sponsorisées coûtent entre 100 et 500€ selon la durée et le type de mise en avant. Votre contenu est validé sous 48h avant diffusion.</span>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Campagne</th>
            <th>Objet / Projet sponsorisé</th>
            <th>Budget</th>
            <th>Période</th>
            <th>Impressions</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in campaigns" :key="c.id">
            <td style="font-weight: 600">{{ c.name }}</td>
            <td class="small muted">{{ c.sponsoredItem }}</td>
            <td class="mono" style="font-weight: 700">{{ c.budget }}€</td>
            <td class="small mono">{{ c.startDate }} → {{ c.endDate }}</td>
            <td class="mono">{{ c.impressions > 0 ? c.impressions.toLocaleString('fr-FR') : '—' }}</td>
            <td>
              <span class="badge" :class="statusMeta[c.status].badge">{{ c.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="campaigns.length === 0" class="empty-state">
      <p>Vous n'avez encore aucune campagne. Boostez votre visibilité dès maintenant !</p>
      <button class="primary medium" @click="showNewModal = true">+ Créer ma première campagne</button>
    </div>

    <!-- New campaign modal -->
    <AppModal :open="showNewModal" size="medium" @close="showNewModal = false">
      <template #header>
        <h3>Nouvelle campagne sponsorisée</h3>
      </template>

      <form class="layout-flex layout-columns layout-gap-medium" @submit.prevent="createCampaign">
        <div class="form-group">
          <label class="uppercase">Nom de la campagne</label>
          <input
            v-model="form.name"
            type="text"
            class="primary medium full-width"
            placeholder="Ex : Boost été 2026"
            required
          />
        </div>

        <div class="form-group">
          <label class="uppercase">Objet ou projet à sponsoriser</label>
          <input
            v-model="form.sponsoredItem"
            type="text"
            class="primary medium full-width"
            placeholder="Ex : Projet Lampe bocaux / Annonce cuir"
            required
          />
        </div>

        <div class="layout-flex layout-gap-medium">
          <div class="form-group" style="flex: 1">
            <label class="uppercase">Budget (€)</label>
            <input
              v-model.number="form.budget"
              type="number"
              min="100"
              max="500"
              step="50"
              class="primary medium full-width"
            />
            <span class="tiny muted">Entre 100€ et 500€</span>
          </div>
        </div>

        <div class="layout-flex layout-gap-medium">
          <div class="form-group" style="flex: 1">
            <label class="uppercase">Date de début</label>
            <input v-model="form.startDate" type="date" class="primary medium full-width" required />
          </div>
          <div class="form-group" style="flex: 1">
            <label class="uppercase">Date de fin</label>
            <input v-model="form.endDate" type="date" class="primary medium full-width" required />
          </div>
        </div>

        <div class="alert alert--accent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <span>Votre campagne sera examinée par l'équipe avant diffusion (48h). Le budget est débité à la validation.</span>
        </div>
      </form>

      <template #footer>
        <button class="ghost medium" @click="showNewModal = false">Annuler</button>
        <button
          class="primary medium"
          :disabled="!form.name || !form.sponsoredItem || !form.startDate || !form.endDate"
          @click="createCampaign"
        >
          Soumettre la campagne
        </button>
      </template>
    </AppModal>
  </ProDashboardLayout>
</template>
