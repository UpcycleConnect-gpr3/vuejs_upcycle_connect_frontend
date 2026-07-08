<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import StaffDashboardLayout from '@/components/StaffDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'
import { useTrainingStore } from '@/stores/trainingStore'
import { useToastsStore } from '@/stores/toasts'
import type { Training } from '@/types'

const trainingStore = useTrainingStore()
const toasts = useToastsStore()
const { trainings, isLoading, error } = storeToRefs(trainingStore)

const showModal = ref(false)
const editingId = ref<number | null>(null)
const isSaving = ref(false)

const form = reactive({
  name: '',
  type: 'formation',
  mode_of_delivery: 'présentiel',
  duration: '',
  location: '',
  maximum_number_of_participants: 12,
  price: 0,
})

const resetForm = () => {
  Object.assign(form, {
    name: '',
    type: 'formation',
    mode_of_delivery: 'présentiel',
    duration: '',
    location: '',
    maximum_number_of_participants: 12,
    price: 0,
  })
}

const openCreate = () => {
  editingId.value = null
  resetForm()
  showModal.value = true
}

const openEdit = (t: Training) => {
  editingId.value = t.id
  Object.assign(form, {
    name: t.name,
    type: t.type,
    mode_of_delivery: t.mode_of_delivery,
    duration: t.duration,
    location: t.location,
    maximum_number_of_participants: t.maximum_number_of_participants,
    price: t.price ?? 0,
  })
  showModal.value = true
}

const submit = async () => {
  if (!form.name.trim()) return
  isSaving.value = true
  const payload = {
    name: form.name.trim(),
    type: form.type,
    mode_of_delivery: form.mode_of_delivery,
    duration: form.duration.trim(),
    location: form.location.trim(),
    maximum_number_of_participants: form.maximum_number_of_participants,
    price: form.price,
  }
  const result =
    editingId.value !== null
      ? await trainingStore.editTraining(editingId.value, payload)
      : await trainingStore.addTraining(payload)
  isSaving.value = false
  if (result) {
    toasts.success(editingId.value !== null ? 'Formation modifiée' : 'Formation créée')
    showModal.value = false
    editingId.value = null
    await trainingStore.fetchTrainings()
  }
}

const remove = async (t: Training) => {
  await trainingStore.removeTraining(t.id)
  toasts.success('Formation supprimée')
}

const statusMeta = (status?: string): { label: string; badge: string } => {
  if (status === 'validated') return { label: 'Validée', badge: 'badge--success' }
  if (status === 'rejected') return { label: 'Refusée', badge: 'badge--danger' }
  return { label: 'En attente de validation', badge: 'badge--accent' }
}

onMounted(() => {
  trainingStore.fetchTrainings()
})
</script>

<template>
  <StaffDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Formations & ateliers</span>
        <h1>Mes formations</h1>
        <p class="muted measure">Créez et gérez les formations et ateliers UpcycleConnect.</p>
      </div>
      <button class="primary medium" @click="openCreate">+ Nouvelle formation</button>
    </header>

    <p v-if="error" class="small" style="color: var(--destructive-color)">{{ error }}</p>
    <p v-else-if="isLoading && !trainings.length" class="muted">Chargement des formations…</p>

    <div v-else-if="trainings.length" class="dashboard-grid">
      <article v-for="t in trainings" :key="t.id" class="dashboard-card">
        <div class="card-header">
          <div class="layout-flex layout-gap-small" style="flex-wrap: wrap">
            <span class="badge">{{ t.type || 'formation' }}</span>
            <span v-if="t.mode_of_delivery" class="badge badge--muted">{{ t.mode_of_delivery }}</span>
            <span class="badge" :class="statusMeta(t.status).badge">{{ statusMeta(t.status).label }}</span>
          </div>
          <h4 style="margin-top: var(--space-1)">{{ t.name }}</h4>
        </div>
        <div class="tiny muted" style="margin-top: var(--space-2)">
          <span v-if="t.duration"> {{ t.duration }}</span>
          <span v-if="t.location"> ·  {{ t.location }}</span>
          <span v-if="t.maximum_number_of_participants">
            ·  {{ t.maximum_number_of_participants }} max</span
          >
          <span> ·  {{ t.price ? `${t.price}€` : 'Gratuit' }}</span>
        </div>
        <div class="layout-flex layout-gap-small" style="margin-top: var(--space-3); flex-wrap: wrap">
          <button class="ghost small" @click="openEdit(t)">Modifier</button>
          <button class="ghost small" @click="remove(t)">Supprimer</button>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <p>Aucune formation pour l'instant.</p>
      <button class="primary medium" @click="openCreate">+ Créer ma première formation</button>
    </div>

    <AppModal
      :open="showModal"
      size="medium"
      :title="editingId !== null ? 'Modifier la formation' : 'Nouvelle formation'"
      @close="showModal = false"
    >
      <form
        id="training-form"
        class="layout-flex layout-columns layout-gap-medium"
        @submit.prevent="submit"
      >
        <div class="form-group">
          <label class="uppercase">Nom</label>
          <input
            v-model="form.name"
            type="text"
            class="primary medium full-width"
            placeholder="Ex : Restaurer un meuble en bois"
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
          <div class="form-group" style="flex: 1">
            <label class="uppercase">Modalité</label>
            <select v-model="form.mode_of_delivery" class="primary medium full-width">
              <option value="présentiel">Présentiel</option>
              <option value="en ligne">En ligne</option>
            </select>
          </div>
        </div>
        <div class="layout-flex layout-gap-medium">
          <div class="form-group" style="flex: 1">
            <label class="uppercase">Durée</label>
            <input
              v-model="form.duration"
              type="text"
              class="primary medium full-width"
              placeholder="Ex : 3h"
            />
          </div>
          <div class="form-group" style="flex: 1">
            <label class="uppercase">Participants max</label>
            <input
              v-model.number="form.maximum_number_of_participants"
              type="number"
              min="1"
              class="primary medium full-width"
            />
          </div>
        </div>
        <div class="layout-flex layout-gap-medium">
          <div class="form-group" style="flex: 1">
            <label class="uppercase">Lieu</label>
            <input
              v-model="form.location"
              type="text"
              class="primary medium full-width"
              placeholder="Ex : Atelier Paris 11"
            />
          </div>
          <div class="form-group" style="flex: 1">
            <label class="uppercase">Prix (€) — 0 = gratuit</label>
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              step="1"
              class="primary medium full-width"
              placeholder="Ex : 45"
            />
          </div>
        </div>
      </form>
      <template #footer>
        <button class="ghost medium" @click="showModal = false">Annuler</button>
        <button
          type="submit"
          form="training-form"
          class="primary medium"
          :disabled="isSaving || !form.name.trim()"
        >
          {{ isSaving ? 'Enregistrement…' : editingId !== null ? 'Enregistrer' : 'Créer' }}
        </button>
      </template>
    </AppModal>
  </StaffDashboardLayout>
</template>
