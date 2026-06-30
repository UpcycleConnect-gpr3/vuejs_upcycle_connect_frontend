<script setup lang="ts">
import { ref } from 'vue'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'
import QrCode from '@/components/QrCode.vue'

type PickupStatus = 'a-recuperer' | 'recupere'

interface Pickup {
  id: number
  objectTitle: string
  containerName: string
  containerAddress: string
  barcode: string
  reservedAt: string
  status: PickupStatus
  deadline: string
}

const pickups = ref<Pickup[]>([
  {
    id: 1,
    objectTitle: 'Lot de planches de palette',
    containerName: 'Conteneur Bastille',
    containerAddress: '12 Bd de la Bastille, 75012 Paris',
    barcode: 'PICK-2026-001-BAST',
    reservedAt: '2026-06-28',
    status: 'a-recuperer',
    deadline: '2026-07-01',
  },
  {
    id: 2,
    objectTitle: 'Cadre vélo acier vintage',
    containerName: 'Box Nation',
    containerAddress: '55 Av. de la Nation, 75011 Paris',
    barcode: 'PICK-2026-002-NATI',
    reservedAt: '2026-06-27',
    status: 'a-recuperer',
    deadline: '2026-06-30',
  },
  {
    id: 3,
    objectTitle: 'Bobines de fil textile',
    containerName: 'Conteneur Montreuil Est',
    containerAddress: '8 Rue du Sergent Bobillot, 93100 Montreuil',
    barcode: 'PICK-2026-003-MONT',
    reservedAt: '2026-06-20',
    status: 'recupere',
    deadline: '2026-06-23',
  },
  {
    id: 4,
    objectTitle: 'Bouteilles et bocaux en verre',
    containerName: 'Box Jussieu',
    containerAddress: '4 Pl. Jussieu, 75005 Paris',
    barcode: 'PICK-2026-004-JUSS',
    reservedAt: '2026-06-25',
    status: 'recupere',
    deadline: '2026-06-28',
  },
])

const statusMeta: Record<PickupStatus, { label: string; badge: string }> = {
  'a-recuperer': { label: 'À récupérer', badge: 'badge--accent' },
  'recupere': { label: 'Récupéré', badge: 'badge--success' },
}

const filterStatus = ref<'all' | PickupStatus>('all')
const filteredPickups = ref(pickups)

const showScanModal = ref(false)
const selectedPickup = ref<Pickup | null>(null)
const manualCode = ref('')

function openScanner(pickup: Pickup) {
  selectedPickup.value = pickup
  manualCode.value = ''
  showScanModal.value = true
}

function confirmPickup() {
  if (selectedPickup.value) {
    const idx = pickups.value.findIndex((p) => p.id === selectedPickup.value!.id)
    if (idx >= 0) {
      const existing = pickups.value[idx]
      if (existing) {
        pickups.value[idx] = { ...existing, status: 'recupere' }
      }
    }
  }
  showScanModal.value = false
  selectedPickup.value = null
  manualCode.value = ''
}

function getFiltered() {
  return filterStatus.value === 'all'
    ? pickups.value
    : pickups.value.filter((p) => p.status === filterStatus.value)
}
</script>

<template>
  <ProDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Conteneurs & boîtes</span>
        <h1>Récupérations</h1>
        <p class="muted measure">
          Gérez vos objets réservés en attente de récupération dans les conteneurs et boîtes
          partenaires.
        </p>
      </div>
    </header>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-tile">
        <span class="stat-tile-label">À récupérer</span>
        <span class="stat-tile-value">{{ pickups.filter((p) => p.status === 'a-recuperer').length }}</span>
        <p class="small muted">Dans les 72h</p>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">Récupérés ce mois</span>
        <span class="stat-tile-value">{{ pickups.filter((p) => p.status === 'recupere').length }}</span>
        <p class="small muted">Objets collectés</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="layout-flex layout-gap-small">
      <button
        class="forum-tab"
        :class="{ active: filterStatus === 'all' }"
        @click="filterStatus = 'all'"
      >
        Tous · {{ pickups.length }}
      </button>
      <button
        class="forum-tab"
        :class="{ active: filterStatus === 'a-recuperer' }"
        @click="filterStatus = 'a-recuperer'"
      >
        À récupérer
      </button>
      <button
        class="forum-tab"
        :class="{ active: filterStatus === 'recupere' }"
        @click="filterStatus = 'recupere'"
      >
        Récupérés
      </button>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Objet</th>
            <th>Conteneur / boîte</th>
            <th>Adresse</th>
            <th>Réservé le</th>
            <th>Délai</th>
            <th>Statut</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in getFiltered()"
            :key="p.id"
          >
            <td style="font-weight: 600">{{ p.objectTitle }}</td>
            <td>{{ p.containerName }}</td>
            <td class="small muted">{{ p.containerAddress }}</td>
            <td class="mono small">{{ p.reservedAt }}</td>
            <td class="mono small" :style="p.status === 'a-recuperer' ? 'color: var(--destructive-color)' : ''">
              {{ p.deadline }}
            </td>
            <td>
              <span class="badge" :class="statusMeta[p.status].badge">
                {{ statusMeta[p.status].label }}
              </span>
            </td>
            <td>
              <button
                v-if="p.status === 'a-recuperer'"
                class="primary small"
                @click="openScanner(p)"
              >
                Scanner le code-barres
              </button>
              <span v-else class="tiny muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="getFiltered().length === 0" class="empty-state">
      <p>Aucune récupération dans cette catégorie.</p>
    </div>

    <!-- Scanner modal -->
    <AppModal :open="showScanModal" size="medium" @close="showScanModal = false">
      <template #header>
        <h3>Scanner le code-barres</h3>
      </template>

      <div v-if="selectedPickup" class="layout-flex layout-columns layout-gap-medium">
        <div class="recap-row">
          <span class="tiny uppercase muted">Objet</span>
          <span>{{ selectedPickup.objectTitle }}</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">Conteneur</span>
          <span>{{ selectedPickup.containerName }}</span>
        </div>

        <div style="text-align: center; padding: var(--space-4) 0">
          <p class="small muted" style="margin-bottom: var(--space-3)">
            Scannez ce QR code avec votre application ou l'appareil photo du conteneur.
          </p>
          <div style="display: flex; justify-content: center">
            <QrCode :value="selectedPickup.barcode" :size="180" />
          </div>
          <p class="tiny mono" style="margin-top: var(--space-2); color: var(--text-secondary)">
            {{ selectedPickup.barcode }}
          </p>
        </div>

        <div class="form-group">
          <label class="uppercase tiny">Ou saisir le code manuellement</label>
          <input
            v-model="manualCode"
            type="text"
            class="primary medium full-width"
            :placeholder="selectedPickup.barcode"
          />
        </div>
      </div>

      <template #footer>
        <button class="ghost medium" @click="showScanModal = false">Annuler</button>
        <button
          class="primary medium"
          :disabled="manualCode !== '' && manualCode !== selectedPickup?.barcode"
          @click="confirmPickup"
        >
          Confirmer la récupération
        </button>
      </template>
    </AppModal>
  </ProDashboardLayout>
</template>
