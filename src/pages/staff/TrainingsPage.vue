<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import StaffDashboardLayout from '@/components/StaffDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'
import { useTrainingStore } from '@/stores/trainingStore'
import { useToastsStore } from '@/stores/toasts'
import type { Training } from '@/types'

const { t } = useI18n()
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
    toasts.success(editingId.value !== null ? t('staffTrainings.toasts.updated') : t('staffTrainings.toasts.created'))
    showModal.value = false
    editingId.value = null
    await trainingStore.fetchTrainings()
  }
}

const remove = async (tr: Training) => {
  await trainingStore.removeTraining(tr.id)
  toasts.success(t('staffTrainings.toasts.deleted'))
}

const statusMeta = (status?: string): { label: string; badge: string } => {
  if (status === 'validated') return { label: t('staffTrainings.status.validated'), badge: 'badge--success' }
  if (status === 'rejected') return { label: t('staffTrainings.status.rejected'), badge: 'badge--danger' }
  return { label: t('staffTrainings.status.pending'), badge: 'badge--accent' }
}

onMounted(() => {
  trainingStore.fetchTrainings()
})
</script>

<template>
  <StaffDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">{{ t('staffTrainings.eyebrow') }}</span>
        <h1>{{ t('staffTrainings.title') }}</h1>
        <p class="muted measure">{{ t('staffTrainings.subtitle') }}</p>
      </div>
      <button class="primary medium" @click="openCreate">{{ t('staffTrainings.newTraining') }}</button>
    </header>

    <p v-if="error" class="small" style="color: var(--destructive-color)">{{ error }}</p>
    <p v-else-if="isLoading && !trainings.length" class="muted">{{ t('staffTrainings.loading') }}</p>

    <div v-else-if="trainings.length" class="dashboard-grid">
      <article v-for="tr in trainings" :key="tr.id" class="dashboard-card">
        <div class="card-header">
          <div class="layout-flex layout-gap-small" style="flex-wrap: wrap">
            <span class="badge">{{ tr.type || 'formation' }}</span>
            <span v-if="tr.mode_of_delivery" class="badge badge--muted">{{ tr.mode_of_delivery }}</span>
            <span class="badge" :class="statusMeta(tr.status).badge">{{ statusMeta(tr.status).label }}</span>
          </div>
          <h4 style="margin-top: var(--space-1)">{{ tr.name }}</h4>
        </div>
        <div class="tiny muted" style="margin-top: var(--space-2)">
          <span v-if="tr.duration"> {{ tr.duration }}</span>
          <span v-if="tr.location"> ·  {{ tr.location }}</span>
          <span v-if="tr.maximum_number_of_participants">
            ·  {{ t('staffTrainings.card.maxParticipants', { count: tr.maximum_number_of_participants }) }}</span
          >
          <span> ·  {{ tr.price ? `${tr.price}€` : t('common.free') }}</span>
        </div>
        <div class="layout-flex layout-gap-small" style="margin-top: var(--space-3); flex-wrap: wrap">
          <button class="ghost small" @click="openEdit(tr)">{{ t('common.edit') }}</button>
          <button class="ghost small" @click="remove(tr)">{{ t('common.delete') }}</button>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <p>{{ t('staffTrainings.empty.text') }}</p>
      <button class="primary medium" @click="openCreate">{{ t('staffTrainings.empty.cta') }}</button>
    </div>

    <AppModal
      :open="showModal"
      size="medium"
      :title="editingId !== null ? t('staffTrainings.modal.editTitle') : t('staffTrainings.modal.createTitle')"
      @close="showModal = false"
    >
      <form
        id="training-form"
        class="layout-flex layout-columns layout-gap-medium"
        @submit.prevent="submit"
      >
        <div class="form-group">
          <label class="uppercase">{{ t('staffTrainings.form.name') }}</label>
          <input
            v-model="form.name"
            type="text"
            class="primary medium full-width"
            :placeholder="t('staffTrainings.form.namePlaceholder')"
            required
          />
        </div>
        <div class="layout-flex layout-gap-medium">
          <div class="form-group" style="flex: 1">
            <label class="uppercase">{{ t('staffTrainings.form.type') }}</label>
            <select v-model="form.type" class="primary medium full-width">
              <option value="formation">{{ t('staffTrainings.form.typeFormation') }}</option>
              <option value="atelier">{{ t('staffTrainings.form.typeAtelier') }}</option>
            </select>
          </div>
          <div class="form-group" style="flex: 1">
            <label class="uppercase">{{ t('staffTrainings.form.mode') }}</label>
            <select v-model="form.mode_of_delivery" class="primary medium full-width">
              <option value="présentiel">{{ t('staffTrainings.form.modeOnsite') }}</option>
              <option value="en ligne">{{ t('staffTrainings.form.modeOnline') }}</option>
            </select>
          </div>
        </div>
        <div class="layout-flex layout-gap-medium">
          <div class="form-group" style="flex: 1">
            <label class="uppercase">{{ t('staffTrainings.form.duration') }}</label>
            <input
              v-model="form.duration"
              type="text"
              class="primary medium full-width"
              :placeholder="t('staffTrainings.form.durationPlaceholder')"
            />
          </div>
          <div class="form-group" style="flex: 1">
            <label class="uppercase">{{ t('staffTrainings.form.maxParticipants') }}</label>
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
            <label class="uppercase">{{ t('staffTrainings.form.location') }}</label>
            <input
              v-model="form.location"
              type="text"
              class="primary medium full-width"
              :placeholder="t('staffTrainings.form.locationPlaceholder')"
            />
          </div>
          <div class="form-group" style="flex: 1">
            <label class="uppercase">{{ t('staffTrainings.form.price') }}</label>
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              step="1"
              class="primary medium full-width"
              :placeholder="t('staffTrainings.form.pricePlaceholder')"
            />
          </div>
        </div>
      </form>
      <template #footer>
        <button class="ghost medium" @click="showModal = false">{{ t('common.cancel') }}</button>
        <button
          type="submit"
          form="training-form"
          class="primary medium"
          :disabled="isSaving || !form.name.trim()"
        >
          {{ isSaving ? t('staffTrainings.form.saving') : editingId !== null ? t('common.save') : t('common.create') }}
        </button>
      </template>
    </AppModal>
  </StaffDashboardLayout>
</template>
