<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import StaffDashboardLayout from '@/components/StaffDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'

type TrainingStatus = 'brouillon' | 'en_attente' | 'validee' | 'refusee'
type TrainingType = 'formation' | 'atelier'

interface Training {
  id: number
  title: string
  type: TrainingType
  date: string
  capacity: number
  location: string
  description: string
  status: TrainingStatus
  createdAt: string
}

const filter = ref<'all' | TrainingStatus>('all')

const trainings = ref<Training[]>([
  {
    id: 1,
    title: 'Restaurer un meuble en bois',
    type: 'formation',
    date: '2026-07-10T09:00',
    capacity: 12,
    location: 'Atelier Paris 11',
    description: 'Techniques complètes de restauration : ponçage, traitement, finitions.',
    status: 'validee',
    createdAt: '2026-06-01',
  },
  {
    id: 2,
    title: 'Upcycling textile débutant',
    type: 'atelier',
    date: '2026-07-15T14:00',
    capacity: 8,
    location: 'Salle B',
    description: 'Initiation aux techniques de couture pour transformer des vêtements usagés.',
    status: 'en_attente',
    createdAt: '2026-06-20',
  },
  {
    id: 3,
    title: 'Repair Café électronique',
    type: 'atelier',
    date: '2026-07-22T10:00',
    capacity: 15,
    location: 'Atelier Paris 11',
    description: 'Réparer soi-même ses appareils électroniques du quotidien.',
    status: 'en_attente',
    createdAt: '2026-06-22',
  },
  {
    id: 4,
    title: 'Peindre ses meubles',
    type: 'atelier',
    date: '2026-06-05T14:00',
    capacity: 10,
    location: 'En ligne',
    description: 'Choisir et appliquer la bonne peinture pour différents matériaux.',
    status: 'refusee',
    createdAt: '2026-05-15',
  },
  {
    id: 5,
    title: "Introduction au réemploi",
    type: 'formation',
    date: '',
    capacity: 20,
    location: 'À définir',
    description: "Sensibilisation aux enjeux du réemploi et de l'économie circulaire.",
    status: 'brouillon',
    createdAt: '2026-06-28',
  },
])

const statusMeta: Record<TrainingStatus, { label: string; badge: string }> = {
  brouillon: { label: 'Brouillon', badge: 'badge--muted' },
  en_attente: { label: 'En attente de validation', badge: 'badge--accent' },
  validee: { label: 'Validée', badge: 'badge--success' },
  refusee: { label: 'Refusée', badge: 'badge--danger' },
}

const filtered = computed(() =>
  filter.value === 'all'
    ? trainings.value
    : trainings.value.filter((t) => t.status === filter.value),
)

// Modal
const showModal = ref(false)
const editingId = ref<number | null>(null)

const form = reactive<{
  title: string
  type: TrainingType
  date: string
  capacity: number
  location: string
  description: string
}>({
  title: '',
  type: 'formation',
  date: '',
  capacity: 10,
  location: '',
  description: '',
})

function openCreate() {
  editingId.value = null
  Object.assign(form, {
    title: '',
    type: 'formation',
    date: '',
    capacity: 10,
    location: '',
    description: '',
  })
  showModal.value = true
}

function openEdit(t: Training) {
  editingId.value = t.id
  Object.assign(form, {
    title: t.title,
    type: t.type,
    date: t.date,
    capacity: t.capacity,
    location: t.location,
    description: t.description,
  })
  showModal.value = true
}

function duplicate(t: Training) {
  trainings.value.unshift({
    ...t,
    id: Date.now(),
    title: `${t.title} (copie)`,
    status: 'brouillon',
    createdAt: new Date().toISOString().slice(0, 10),
  })
}

function close() {
  showModal.value = false
  editingId.value = null
}

function submit() {
  if (editingId.value !== null) {
    const idx = trainings.value.findIndex((t) => t.id === editingId.value)
    const existing = trainings.value[idx]
    if (idx >= 0 && existing) {
      trainings.value[idx] = { ...existing, ...form }
    }
  } else {
    trainings.value.unshift({
      id: Date.now(),
      title: form.title,
      type: form.type,
      date: form.date,
      capacity: form.capacity,
      location: form.location,
      description: form.description,
      status: 'en_attente',
      createdAt: new Date().toISOString().slice(0, 10),
    })
  }
  close()
}

function displayDate(date: string): string {
  if (!date) return '—'
  return date.replace('T', ' ')
}
</script>

<template>
  <StaffDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Formations & ateliers</span>
        <h1>Mes formations</h1>
        <p class="muted measure">
          Créez vos formations et ateliers. Chaque création est soumise à la validation d'un
          responsable avant mise en ligne.
        </p>
      </div>
      <button class="primary medium" @click="openCreate">+ Créer une formation</button>
    </header>

    <!-- Filters -->
    <div class="layout-flex layout-gap-small" style="flex-wrap: wrap">
      <button class="forum-tab" :class="{ active: filter === 'all' }" @click="filter = 'all'">
        Tout · {{ trainings.length }}
      </button>
      <button
        v-for="(meta, key) in statusMeta"
        :key="key"
        class="forum-tab"
        :class="{ active: filter === key }"
        @click="filter = key as TrainingStatus"
      >
        {{ meta.label }}
      </button>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Type</th>
            <th>Date</th>
            <th>Lieu</th>
            <th>Capacité</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in filtered" :key="t.id">
            <td style="font-weight: 600">{{ t.title }}</td>
            <td>
              <span class="badge">{{ t.type === 'formation' ? 'Formation' : 'Atelier' }}</span>
            </td>
            <td class="mono small">{{ displayDate(t.date) }}</td>
            <td class="small muted">{{ t.location }}</td>
            <td class="small">{{ t.capacity }} pers.</td>
            <td>
              <span class="badge" :class="statusMeta[t.status].badge">
                {{ statusMeta[t.status].label }}
              </span>
            </td>
            <td>
              <div class="layout-flex layout-gap-small">
                <button class="ghost small" @click="openEdit(t)">Modifier</button>
                <button class="ghost small" @click="duplicate(t)">Dupliquer</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="filtered.length === 0" class="empty-state">
      <p>Aucune formation dans cette catégorie.</p>
      <button class="primary medium" @click="openCreate">+ Créer une formation</button>
    </div>

    <!-- Create / Edit modal -->
    <AppModal :open="showModal" size="medium" @close="close">
      <template #header>
        <h3>{{ editingId !== null ? 'Modifier la formation' : 'Créer une formation' }}</h3>
      </template>

      <form class="layout-flex layout-columns layout-gap-medium" @submit.prevent="submit">
        <div class="form-group">
          <label class="uppercase">Titre</label>
          <input
            v-model="form.title"
            type="text"
            class="primary medium full-width"
            placeholder="Ex: Atelier upcycling débutant"
            required
          />
        </div>

        <div class="layout-flex layout-gap-medium">
          <div class="form-group" style="flex: 1">
            <label class="uppercase">Type</label>
            <select v-model="form.type" class="primary medium full-width">
              <option value="formation">Formation</option>
              <option value="atelier">Atelier</option>
            </select>
          </div>
          <div class="form-group" style="width: 140px">
            <label class="uppercase">Capacité</label>
            <input
              v-model.number="form.capacity"
              type="number"
              min="1"
              class="primary medium full-width"
            />
          </div>
        </div>

        <div class="layout-flex layout-gap-medium">
          <div class="form-group" style="flex: 1">
            <label class="uppercase">Date & heure</label>
            <input v-model="form.date" type="datetime-local" class="primary medium full-width" />
          </div>
          <div class="form-group" style="flex: 1">
            <label class="uppercase">Lieu</label>
            <input
              v-model="form.location"
              type="text"
              class="primary medium full-width"
              placeholder="Ex: Atelier Paris 11"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="uppercase">Description</label>
          <textarea
            v-model="form.description"
            class="primary full-width"
            rows="4"
            placeholder="Décrivez le contenu, les objectifs et le public cible…"
          ></textarea>
        </div>

        <p v-if="editingId === null" class="small muted">
          Après création, la formation sera soumise en attente de validation par un responsable
          avant d'être mise en ligne.
        </p>
      </form>

      <template #footer>
        <button class="ghost medium" @click="close">Annuler</button>
        <button class="primary medium" :disabled="!form.title" @click="submit">
          {{ editingId !== null ? 'Enregistrer' : 'Soumettre pour validation' }}
        </button>
      </template>
    </AppModal>
  </StaffDashboardLayout>
</template>
