<script setup lang="ts">
import { ref, computed } from 'vue'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'

type ListingType = 'don' | 'vente'
type Category = 'Bois' | 'Métal' | 'Textile' | 'Électronique' | 'Verre' | 'Autre'

interface MarketplaceListing {
  id: number
  title: string
  type: ListingType
  category: Category
  price: number | null
  location: string
  description: string
  postedAt: string
  seller: string
}

const listings: MarketplaceListing[] = [
  {
    id: 1,
    title: 'Lot de planches de palette',
    type: 'don',
    category: 'Bois',
    price: null,
    location: 'Paris 11e',
    description: 'Environ 15 planches de palette récupérées, décloutées, prêtes à transformer.',
    postedAt: '2026-06-28',
    seller: 'Marie L.',
  },
  {
    id: 2,
    title: 'Cadre vélo acier vintage',
    type: 'vente',
    category: 'Métal',
    price: 25,
    location: 'Paris 18e',
    description: 'Cadre acier des années 80, légèrement rouillé, idéal upcycling/déco industrielle.',
    postedAt: '2026-06-27',
    seller: 'Thomas R.',
  },
  {
    id: 3,
    title: 'Bobines de fil textile colorées',
    type: 'don',
    category: 'Textile',
    price: null,
    location: 'Montreuil',
    description: "Surplus d'atelier couture, différentes couleurs et matières.",
    postedAt: '2026-06-26',
    seller: 'Atelier Couture 93',
  },
  {
    id: 4,
    title: 'Vieux téléphone Bakelite',
    type: 'vente',
    category: 'Électronique',
    price: 12,
    location: 'Vincennes',
    description: 'Téléphone années 60 décoratif, non fonctionnel, excellent matériau créatif.',
    postedAt: '2026-06-25',
    seller: 'Paul M.',
  },
  {
    id: 5,
    title: 'Bouteilles et bocaux en verre',
    type: 'don',
    category: 'Verre',
    price: null,
    location: 'Paris 5e',
    description: "Bocaux Le Parfait, bouteilles diverses, nettoyés et prêts à l'emploi.",
    postedAt: '2026-06-24',
    seller: 'Camille B.',
  },
  {
    id: 6,
    title: 'Chutes de cuir naturel',
    type: 'vente',
    category: 'Autre',
    price: 18,
    location: 'Saint-Denis',
    description: 'Chutes de maroquinerie haut de gamme, couleurs variées, belles dimensions.',
    postedAt: '2026-06-23',
    seller: 'Maroquinerie Dupont',
  },
]

const filterType = ref<'all' | ListingType>('all')
const filterCategory = ref<'all' | Category>('all')
const filterLocation = ref('')

const categories: Category[] = ['Bois', 'Métal', 'Textile', 'Électronique', 'Verre', 'Autre']

const filtered = computed(() =>
  listings.filter((l) => {
    if (filterType.value !== 'all' && l.type !== filterType.value) return false
    if (filterCategory.value !== 'all' && l.category !== filterCategory.value) return false
    if (filterLocation.value && !l.location.toLowerCase().includes(filterLocation.value.toLowerCase())) return false
    return true
  }),
)

const selectedListing = ref<MarketplaceListing | null>(null)
const showConfirmModal = ref(false)

function openPurchase(listing: MarketplaceListing) {
  selectedListing.value = listing
  showConfirmModal.value = true
}

function confirmPurchase() {
  showConfirmModal.value = false
  selectedListing.value = null
}
</script>

<template>
  <ProDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Marketplace</span>
        <h1>Annonces particuliers</h1>
        <p class="muted measure">
          Parcourez les objets mis en don ou en vente par les particuliers. Achetez ou réservez pour
          vos projets d'upcycling.
        </p>
      </div>
    </header>

    <!-- Filters -->
    <div class="layout-flex layout-gap-small" style="flex-wrap: wrap; align-items: center">
      <button
        class="forum-tab"
        :class="{ active: filterType === 'all' }"
        @click="filterType = 'all'"
      >
        Tout
      </button>
      <button
        class="forum-tab"
        :class="{ active: filterType === 'don' }"
        @click="filterType = 'don'"
      >
        Dons
      </button>
      <button
        class="forum-tab"
        :class="{ active: filterType === 'vente' }"
        @click="filterType = 'vente'"
      >
        Ventes
      </button>

      <select
        v-model="filterCategory"
        class="ghost medium"
        style="margin-left: var(--space-2)"
      >
        <option value="all">Toutes catégories</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>

      <input
        v-model="filterLocation"
        type="text"
        placeholder="Localisation…"
        class="ghost medium"
        style="max-width: 180px"
      />
    </div>

    <!-- Grid -->
    <div class="catalog-grid">
      <article v-for="l in filtered" :key="l.id" class="catalog-card">
        <div class="listing-photo">
          <span class="tiny muted">Photo</span>
        </div>
        <div style="padding: var(--space-3)">
          <div class="layout-flex layout-gap-small" style="flex-wrap: wrap; margin-bottom: var(--space-2)">
            <span class="badge" :class="l.type === 'don' ? 'badge--success' : 'badge--accent'">
              {{ l.type === 'don' ? 'Don' : 'Vente' }}
            </span>
            <span class="badge">{{ l.category }}</span>
          </div>
          <h4 style="margin: 0 0 var(--space-1)">{{ l.title }}</h4>
          <p class="small muted" style="margin: 0 0 var(--space-2)">{{ l.description }}</p>
          <div class="layout-flex layout-justify-between" style="align-items: flex-end">
            <div>
              <div
                v-if="l.price"
                class="mono"
                style="font-size: var(--font-size-large); font-weight: 700"
              >
                {{ l.price }}€
              </div>
              <div v-else style="font-weight: 700; color: var(--lime-500)">Gratuit</div>
              <div class="tiny muted">{{ l.location }} · {{ l.seller }}</div>
            </div>
            <button class="primary small" @click="openPurchase(l)">
              {{ l.type === 'don' ? 'Réserver' : 'Acheter' }}
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Empty state -->
    <div v-if="filtered.length === 0" class="empty-state">
      <p>Aucune annonce ne correspond à vos critères.</p>
      <button class="ghost medium" @click="filterType = 'all'; filterCategory = 'all'; filterLocation = ''">
        Réinitialiser les filtres
      </button>
    </div>

    <!-- Confirmation modal -->
    <AppModal :open="showConfirmModal" size="small" @close="showConfirmModal = false">
      <template #header>
        <h3>{{ selectedListing?.type === 'don' ? 'Réserver le don' : 'Confirmer l\'achat' }}</h3>
      </template>

      <div v-if="selectedListing" class="layout-flex layout-columns layout-gap-medium">
        <div class="recap-row">
          <span class="tiny uppercase muted">Objet</span>
          <span>{{ selectedListing.title }}</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">Vendeur</span>
          <span>{{ selectedListing.seller }}</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">{{ selectedListing.type === 'don' ? 'Prix' : 'Montant' }}</span>
          <span>{{ selectedListing.price ? `${selectedListing.price}€` : 'Gratuit' }}</span>
        </div>
        <div class="alert alert--accent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <span>
            Une commission UpcycleConnect de 5% est appliquée sur les transactions payantes.
            Les dons sont totalement gratuits.
          </span>
        </div>
      </div>

      <template #footer>
        <button class="ghost medium" @click="showConfirmModal = false">Annuler</button>
        <button class="primary medium" @click="confirmPurchase">
          {{ selectedListing?.type === 'don' ? 'Confirmer la réservation' : 'Confirmer l\'achat' }}
        </button>
      </template>
    </AppModal>
  </ProDashboardLayout>
</template>
