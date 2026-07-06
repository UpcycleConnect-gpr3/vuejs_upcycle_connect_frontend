<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'
import QrCode from '@/components/QrCode.vue'
import { getPackages, createPackage } from '@/services/upcycle'
import { useToastsStore } from '@/stores/toasts'

const toasts = useToastsStore()

type Status = 'pending' | 'approved' | 'deposited' | 'collected' | 'rejected'

interface Deposit {
  id: number
  reference: string
  object: string
  category: string
  intent: 'don' | 'vente'
  status: Status
  code: string | null
  barcode: string | null
  createdAt: string
}

const deposits = ref<Deposit[]>([
  {
    id: 1,
    reference: 'DEP-204',
    object: 'Lot vaisselle vintage',
    category: 'Vaisselle',
    intent: 'don',
    status: 'approved',
    code: '482917',
    barcode: 'UC-DEP-204-X9K2',
    createdAt: '2026-04-26',
  },
  {
    id: 2,
    reference: 'DEP-203',
    object: 'Mixeur cassé',
    category: 'Électroménager',
    intent: 'don',
    status: 'pending',
    code: null,
    barcode: null,
    createdAt: '2026-04-25',
  },
  {
    id: 3,
    reference: 'DEP-198',
    object: 'Bibliothèque IKEA',
    category: 'Mobilier',
    intent: 'vente',
    status: 'collected',
    code: '208451',
    barcode: 'UC-DEP-198-B3M9',
    createdAt: '2026-04-12',
  },
  {
    id: 4,
    reference: 'DEP-189',
    object: 'Sèche-cheveux HS',
    category: 'Électroménager',
    intent: 'don',
    status: 'rejected',
    code: null,
    barcode: null,
    createdAt: '2026-04-05',
  },
])

const statusMeta: Record<Status, { label: string; badge: string }> = {
  pending: { label: 'Vérification Check', badge: 'badge--accent' },
  approved: { label: 'Code disponible', badge: 'badge--success' },
  deposited: { label: 'Déposé', badge: 'badge--muted' },
  collected: { label: 'Collecté', badge: 'badge--muted' },
  rejected: { label: 'Refusé', badge: 'badge--danger' },
}

onMounted(async () => {
  try {
    const data = await getPackages()
    if (Array.isArray(data) && data.length) {
      deposits.value = data.map(
        (p): Deposit => ({
          id: Number(p.id),
          reference: p.reference ?? `DEP-${p.id}`,
          object: (p.object as string) ?? (p.name as string) ?? 'Objet',
          category: (p.category as string) ?? 'Autre',
          intent: ((p.intent as string) === 'vente' ? 'vente' : 'don') as 'don' | 'vente',
          status: ((p.status as Status) ?? 'pending') as Status,
          code: (p.code as string) ?? null,
          barcode: (p.barcode as string) ?? null,
          createdAt: (p.created_at as string)?.slice(0, 10) ?? '',
        }),
      )
    }
  } catch {
    toasts.error('Impossible de charger vos dépôts, affichage des données de démonstration.')
  }
})

const filter = ref<'all' | 'active'>('active')
const filtered = computed(() =>
  filter.value === 'all'
    ? deposits.value
    : deposits.value.filter((d) => d.status === 'pending' || d.status === 'approved'),
)

const showNewModal = ref(false)
const form = reactive({
  object: '',
  description: '',
  category: '',
  intent: 'don' as 'don' | 'vente',
  photos: [] as { name: string }[],
})

async function submit() {
  try {
    await createPackage({
      object: form.object,
      category: form.category,
      intent: form.intent,
      description: form.description,
    })
    toasts.success('Demande de dépôt envoyée')
  } catch {
    toasts.error('Envoi impossible, demande enregistrée localement.')
  }
  deposits.value.unshift({
    id: Date.now(),
    reference: `DEP-${Math.floor(200 + Math.random() * 100)}`,
    object: form.object,
    category: form.category,
    intent: form.intent,
    status: 'pending',
    code: null,
    barcode: null,
    createdAt: new Date().toISOString().slice(0, 10),
  })
  Object.assign(form, { object: '', description: '', category: '', intent: 'don', photos: [] })
  showNewModal.value = false
}

const codeOpen = ref<Deposit | null>(null)
const qrRef = ref<InstanceType<typeof QrCode> | null>(null)
function downloadQr() {
  qrRef.value?.download()
}
</script>

<template>
  <DashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Dépôt en conteneur</span>
        <h1>Mes dépôts</h1>
        <p class="muted measure">
          Demandez un dépôt, l'équipe Check valide et vous reçevez un code conteneur + un QR pour le
          retrait artisan.
        </p>
      </div>
      <button class="primary medium" @click="showNewModal = true">+ Nouvelle demande</button>
    </header>

    <div class="layout-flex layout-gap-small">
      <button class="forum-tab" :class="{ active: filter === 'active' }" @click="filter = 'active'">
        Actifs
      </button>
      <button class="forum-tab" :class="{ active: filter === 'all' }" @click="filter = 'all'">
        Tout · {{ deposits.length }}
      </button>
    </div>

    <div class="layout-flex layout-columns layout-gap-medium">
      <article v-for="d in filtered" :key="d.id" class="deposit-card">
        <div
          class="layout-flex layout-justify-between layout-items-start"
          style="flex-wrap: wrap; gap: var(--space-3)"
        >
          <div class="layout-flex layout-columns" style="gap: 4px">
            <div class="layout-flex layout-gap-small layout-items-center">
              <span class="badge mono">{{ d.reference }}</span>
              <span class="badge">{{ d.intent }}</span>
              <span class="badge" :class="statusMeta[d.status].badge">{{
                statusMeta[d.status].label
              }}</span>
            </div>
            <h4>{{ d.object }}</h4>
            <span class="tiny muted">{{ d.category }} · créé le {{ d.createdAt }}</span>
          </div>
          <div v-if="d.status === 'approved'" class="layout-flex layout-gap-small">
            <button class="primary small" @click="codeOpen = d">Voir code conteneur</button>
          </div>
        </div>
      </article>
    </div>

    <AppModal :open="showNewModal" title="Nouvelle demande de dépôt" @close="showNewModal = false">
      <form class="layout-flex layout-columns layout-gap-medium" @submit.prevent="submit">
        <div class="form-group">
          <label class="uppercase">Objet à déposer</label>
          <input
            v-model="form.object"
            type="text"
            class="primary medium full-width"
            placeholder="Ex: Lot vaisselle vintage"
            required
          />
        </div>
        <div class="layout-flex layout-gap-medium">
          <div class="form-group" style="flex: 1">
            <label class="uppercase">Catégorie</label>
            <select v-model="form.category" class="primary medium full-width" required>
              <option value="" disabled>Choisir…</option>
              <option>Mobilier</option>
              <option>Outils</option>
              <option>Électronique</option>
              <option>Électroménager</option>
              <option>Textile</option>
              <option>Vaisselle</option>
              <option>Autre</option>
            </select>
          </div>
          <div class="form-group" style="flex: 1">
            <label class="uppercase">Intention</label>
            <select v-model="form.intent" class="primary medium full-width">
              <option value="don">Don</option>
              <option value="vente">Vente potentielle</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="uppercase">Description &amp; état</label>
          <textarea
            v-model="form.description"
            class="primary full-width"
            rows="4"
            placeholder="Décrivez l'objet, son état, ses dimensions…"
          ></textarea>
        </div>
        <p class="small muted">
          L'équipe Check vérifie sous 24h si l'objet peut être donné ou vendu, puis génère un code
          conteneur.
        </p>
      </form>
      <template #footer>
        <button class="ghost medium" @click="showNewModal = false">Annuler</button>
        <button class="primary medium" :disabled="!form.object || !form.category" @click="submit">
          Envoyer la demande
        </button>
      </template>
    </AppModal>

    <AppModal :open="!!codeOpen" size="small" @close="codeOpen = null">
      <template #header>
        <div class="layout-flex layout-columns" style="gap: 4px">
          <span class="eyebrow">Dépôt {{ codeOpen?.reference }}</span>
          <h3>{{ codeOpen?.object }}</h3>
        </div>
      </template>
      <div class="layout-flex layout-columns layout-items-center layout-gap-large">
        <div class="container-code">
          <span class="eyebrow">Code conteneur</span>
          <div class="container-code-digits">{{ codeOpen?.code }}</div>
          <p class="small muted">
            Tapez ce code sur le clavier du conteneur pour ouvrir le tiroir.
          </p>
        </div>

        <div class="qr-mock">
          <QrCode v-if="codeOpen?.barcode" ref="qrRef" :value="codeOpen.barcode" :size="160" />
          <span class="tiny mono muted">{{ codeOpen?.barcode }}</span>
        </div>
        <p class="small muted center">
          Le QR/code-barres est lu par l'artisan ou le professionnel pour récupérer l'objet.
        </p>
      </div>
      <template #footer>
        <button class="ghost medium" @click="codeOpen = null">Fermer</button>
        <button class="primary medium" @click="downloadQr">Imprimer / Télécharger</button>
      </template>
    </AppModal>
  </DashboardLayout>
</template>
