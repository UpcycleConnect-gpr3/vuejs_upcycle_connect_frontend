<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'
import { getObjects, createObject } from '@/services/upcycle'
import { useToastsStore } from '@/stores/toasts'

const toasts = useToastsStore()

type Status = 'pending' | 'approved' | 'rejected' | 'sold'

interface Listing {
  id: number
  title: string
  type: 'don' | 'vente'
  category: string
  price: number | null
  status: Status
  views: number
  createdAt: string
  photoCount: number
}

const route = useRoute()
const router = useRouter()
const filter = ref<'all' | Status>('all')

const listings = ref<Listing[]>([
  {
    id: 1,
    title: 'Table basse palette',
    type: 'don',
    category: 'Mobilier',
    price: null,
    status: 'approved',
    views: 142,
    createdAt: '2026-04-22',
    photoCount: 4,
  },
  {
    id: 2,
    title: "Lot d'outils main",
    type: 'vente',
    category: 'Outils',
    price: 35,
    status: 'pending',
    views: 0,
    createdAt: '2026-04-26',
    photoCount: 6,
  },
  {
    id: 3,
    title: 'Vélo enfant 16"',
    type: 'vente',
    category: 'Sport',
    price: 80,
    status: 'approved',
    views: 87,
    createdAt: '2026-04-20',
    photoCount: 3,
  },
  {
    id: 4,
    title: 'Vieille télé tube',
    type: 'don',
    category: 'Électronique',
    price: null,
    status: 'rejected',
    views: 0,
    createdAt: '2026-04-18',
    photoCount: 1,
  },
  {
    id: 5,
    title: 'Étagère bois massif',
    type: 'vente',
    category: 'Mobilier',
    price: 60,
    status: 'sold',
    views: 234,
    createdAt: '2026-04-10',
    photoCount: 5,
  },
])

const statusMeta: Record<Status, { label: string; badge: string }> = {
  pending: { label: 'En validation', badge: 'badge--accent' },
  approved: { label: 'En ligne', badge: 'badge--success' },
  rejected: { label: 'Refusée', badge: 'badge--danger' },
  sold: { label: 'Vendue', badge: 'badge--muted' },
}

onMounted(async () => {
  try {
    const objects = await getObjects()
    if (Array.isArray(objects) && objects.length) {
      listings.value = objects.map(
        (o): Listing => ({
          id: Number(o.id),
          title: o.title ?? o.name ?? 'Objet',
          type: (o.price ?? null) ? 'vente' : 'don',
          category: o.category ?? 'Autre',
          price: typeof o.price === 'number' ? o.price : null,
          status: ((o.status as Status) ?? 'pending') as Status,
          views: (o.views as number) ?? 0,
          createdAt: (o.created_at as string)?.slice(0, 10) ?? '',
          photoCount: (o.photo_count as number) ?? 0,
        }),
      )
    }
  } catch {
    toasts.error('Impossible de charger vos annonces, affichage des données de démonstration.')
  }
})

const filtered = computed(() =>
  filter.value === 'all' ? listings.value : listings.value.filter((l) => l.status === filter.value),
)

const showModal = ref(route.path.endsWith('/new'))
const step = ref(1)
const editingId = ref<number | null>(null)

const form = reactive({
  type: 'don' as 'don' | 'vente',
  title: '',
  description: '',
  category: '',
  condition: 'good',
  price: 0,
  photos: [] as { name: string; size: number }[],
})

function openEdit(l: Listing) {
  editingId.value = l.id
  form.type = l.type
  form.title = l.title
  form.category = l.category
  form.price = l.price ?? 0
  form.description = ''
  form.condition = 'good'
  form.photos = Array.from({ length: l.photoCount }, (_, i) => ({
    name: `photo-${i + 1}.jpg`,
    size: 0,
  }))
  step.value = 1
  showModal.value = true
}

function close() {
  showModal.value = false
  step.value = 1
  editingId.value = null
  if (route.path.endsWith('/new')) router.push('/dashboard/listings')
}

function addPhotos(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const f of Array.from(files)) {
    form.photos.push({ name: f.name, size: f.size })
  }
}

function removePhoto(i: number) {
  form.photos.splice(i, 1)
}

async function submitListing() {
  if (editingId.value === null) {
    try {
      await createObject({
        title: form.title,
        category: form.category,
        condition: form.condition,
        description: form.description,
        price: form.type === 'vente' ? form.price : null,
      })
      toasts.success('Annonce envoyée pour validation')
    } catch {
      toasts.error('Envoi impossible, annonce enregistrée localement.')
    }
  }
  if (editingId.value !== null) {
    const idx = listings.value.findIndex((l) => l.id === editingId.value)
    const existing = listings.value[idx]
    if (idx >= 0 && existing) {
      listings.value[idx] = {
        ...existing,
        title: form.title,
        type: form.type,
        category: form.category,
        price: form.type === 'vente' ? form.price : null,
        photoCount: form.photos.length,
      }
    }
  } else {
    listings.value.unshift({
      id: Date.now(),
      title: form.title,
      type: form.type,
      category: form.category,
      price: form.type === 'vente' ? form.price : null,
      status: 'pending',
      views: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      photoCount: form.photos.length,
    })
  }
  Object.assign(form, {
    type: 'don',
    title: '',
    description: '',
    category: '',
    condition: 'good',
    price: 0,
    photos: [],
  })
  step.value = 1
  close()
}
</script>

<template>
  <DashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Annonces</span>
        <h1>Mes annonces</h1>
        <p class="muted measure">
          Déposez vos objets en don ou en vente. Validation par l'équipe sous 24-48h.
        </p>
      </div>
      <button class="primary medium" @click="showModal = true">+ Nouvelle annonce</button>
    </header>

    <div class="layout-flex layout-gap-small" style="flex-wrap: wrap">
      <button class="forum-tab" :class="{ active: filter === 'all' }" @click="filter = 'all'">
        Tout · {{ listings.length }}
      </button>
      <button
        v-for="(meta, key) in statusMeta"
        :key="key"
        class="forum-tab"
        :class="{ active: filter === key }"
        @click="filter = key as Status"
      >
        {{ meta.label }}
      </button>
    </div>

    <div class="listings-grid">
      <article v-for="l in filtered" :key="l.id" class="listing-card">
        <div class="listing-photo">
          <span class="tiny muted">{{ l.photoCount }} photo{{ l.photoCount > 1 ? 's' : '' }}</span>
        </div>
        <div class="listing-body">
          <div class="layout-flex layout-gap-small layout-items-center" style="flex-wrap: wrap">
            <span class="badge" :class="statusMeta[l.status].badge">{{
              statusMeta[l.status].label
            }}</span>
            <span class="badge">{{ l.type }}</span>
            <span class="badge">{{ l.category }}</span>
          </div>
          <h4>{{ l.title }}</h4>
          <div class="layout-flex layout-justify-between layout-items-end">
            <div>
              <div
                v-if="l.price"
                class="mono"
                style="font-size: var(--font-size-large); font-weight: 700"
              >
                {{ l.price }}€
              </div>
              <div v-else class="text-secondary" style="font-weight: 700">Gratuit</div>
              <div class="tiny muted">{{ l.views }} vues · {{ l.createdAt }}</div>
            </div>
            <div class="layout-flex layout-gap-small">
              <button class="secondary small" @click="openEdit(l)">Modifier</button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div v-if="filtered.length === 0" class="empty-state">
      <p>Aucune annonce dans cette catégorie.</p>
      <button class="primary medium" @click="showModal = true">
        + Déposer ma première annonce
      </button>
    </div>

    <AppModal :open="showModal" size="medium" @close="close">
      <template #header>
        <div class="layout-flex layout-columns" style="gap: 4px">
          <span class="eyebrow">Étape {{ step }} / 3</span>
          <h3>Déposer une annonce</h3>
        </div>
      </template>

      <form
        v-if="step === 1"
        class="layout-flex layout-columns layout-gap-medium"
        @submit.prevent="step = 2"
      >
        <div class="form-group">
          <label class="uppercase">Type d'annonce</label>
          <div class="layout-flex layout-gap-small">
            <button
              type="button"
              class="forum-tab"
              :class="{ active: form.type === 'don' }"
              @click="form.type = 'don'"
            >
              Don gratuit
            </button>
            <button
              type="button"
              class="forum-tab"
              :class="{ active: form.type === 'vente' }"
              @click="form.type = 'vente'"
            >
              Vente
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="uppercase">Titre</label>
          <input
            v-model="form.title"
            type="text"
            class="primary medium full-width"
            placeholder="Ex: Table basse en palette restaurée"
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
              <option>Textile</option>
              <option>Vaisselle</option>
              <option>Autre</option>
            </select>
          </div>
          <div class="form-group" style="flex: 1">
            <label class="uppercase">État</label>
            <select v-model="form.condition" class="primary medium full-width">
              <option value="new">Comme neuf</option>
              <option value="good">Bon état</option>
              <option value="fair">Moyen</option>
              <option value="repair">À réparer</option>
            </select>
          </div>
          <div v-if="form.type === 'vente'" class="form-group" style="width: 140px">
            <label class="uppercase">Prix (€)</label>
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              class="primary medium full-width"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="uppercase">Description</label>
          <textarea
            v-model="form.description"
            class="primary full-width"
            rows="5"
            placeholder="Détaillez l'objet, son histoire, ses dimensions…"
            required
          ></textarea>
        </div>
      </form>

      <div v-else-if="step === 2" class="layout-flex layout-columns layout-gap-medium">
        <p class="muted">
          Ajoutez au moins une photo. Les annonces avec photos sont 5× plus consultées.
        </p>
        <label class="dropzone">
          <input type="file" multiple accept="image/*" @change="addPhotos" hidden />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <span>Glissez-déposez ou cliquez pour choisir</span>
          <span class="tiny muted">JPG, PNG · 5 Mo max par photo</span>
        </label>
        <div v-if="form.photos.length" class="photo-list">
          <div v-for="(p, i) in form.photos" :key="i" class="photo-chip">
            <span class="tiny mono">{{ p.name }}</span>
            <button class="ghost small" @click="removePhoto(i)">✕</button>
          </div>
        </div>
      </div>

      <div v-else-if="step === 3" class="layout-flex layout-columns layout-gap-medium">
        <div class="recap-row">
          <span class="tiny uppercase muted">Type</span
          ><span>{{ form.type === 'don' ? 'Don gratuit' : `Vente · ${form.price}€` }}</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">Titre</span><span>{{ form.title }}</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">Catégorie</span><span>{{ form.category }}</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">Photos</span><span>{{ form.photos.length }}</span>
        </div>
        <p class="small muted">
          Votre annonce sera examinée par l'équipe. Vous serez notifié dès validation.
        </p>
      </div>

      <template #footer>
        <button class="ghost medium" @click="close">Annuler</button>
        <div class="layout-flex layout-gap-small">
          <button v-if="step > 1" class="ghost medium" @click="step--">← Précédent</button>
          <button
            v-if="step < 3"
            class="primary medium"
            @click="step++"
            :disabled="step === 1 && !form.title"
          >
            Suivant →
          </button>
          <button v-else class="primary medium" @click="submitListing">Publier</button>
        </div>
      </template>
    </AppModal>
  </DashboardLayout>
</template>
