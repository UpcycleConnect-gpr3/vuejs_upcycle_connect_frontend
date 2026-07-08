<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import StaffDashboardLayout from '@/components/StaffDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'
import {
  getTrainingContents,
  createTrainingContent,
  updateTrainingContent,
  deleteTrainingContent,
  type TrainingContent,
} from '@/services/training'
import { useToastsStore } from '@/stores/toasts'

const { t } = useI18n()
const toasts = useToastsStore()

const articles = ref<TrainingContent[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const search = ref('')

const showModal = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({ name: '', type: 'conseil', content: '' })

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return articles.value
  return articles.value.filter((a) => `${a.name} ${a.content}`.toLowerCase().includes(q))
})

const load = async () => {
  isLoading.value = true
  try {
    articles.value = await getTrainingContents()
  } catch {
    toasts.error(t('staffAdvice.toasts.loadFailed'))
  } finally {
    isLoading.value = false
  }
}

const openCreate = () => {
  editingId.value = null
  Object.assign(form, { name: '', type: 'conseil', content: '' })
  showModal.value = true
}

const openEdit = (a: TrainingContent) => {
  editingId.value = a.id
  Object.assign(form, { name: a.name, type: a.type || 'conseil', content: a.content })
  showModal.value = true
}

const submit = async () => {
  if (!form.name.trim()) return
  isSaving.value = true
  const payload = { name: form.name.trim(), type: form.type, content: form.content.trim() }
  try {
    if (editingId.value !== null) {
      await updateTrainingContent(editingId.value, payload)
      toasts.success(t('staffAdvice.toasts.updated'))
    } else {
      await createTrainingContent(payload)
      toasts.success(t('staffAdvice.toasts.created'))
    }
    showModal.value = false
    editingId.value = null
    await load()
  } catch {
    toasts.error(t('staffAdvice.toasts.saveFailed'))
  } finally {
    isSaving.value = false
  }
}

const remove = async (a: TrainingContent) => {
  try {
    await deleteTrainingContent(a.id)
    toasts.success(t('staffAdvice.toasts.deleted'))
    await load()
  } catch {
    toasts.error(t('staffAdvice.toasts.deleteFailed'))
  }
}

onMounted(load)
</script>

<template>
  <StaffDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">{{ t('staffAdvice.eyebrow') }}</span>
        <h1>{{ t('staffAdvice.title') }}</h1>
        <p class="muted measure">
          {{ t('staffAdvice.subtitle') }}
        </p>
      </div>
      <button class="primary medium" @click="openCreate">{{ t('staffAdvice.newAdvice') }}</button>
    </header>

    <input
      v-model="search"
      type="search"
      class="primary medium"
      :placeholder="t('staffAdvice.searchPlaceholder')"
      style="max-width: 300px"
    />

    <p v-if="isLoading && !articles.length" class="muted">{{ t('common.loading') }}</p>
    <p v-else-if="!filtered.length" class="muted center" style="padding: var(--space-8)">
      {{ t('staffAdvice.empty') }}
    </p>

    <div v-else class="dashboard-grid">
      <article v-for="a in filtered" :key="a.id" class="dashboard-card">
        <div class="card-header">
          <span class="badge">{{ a.type || 'conseil' }}</span>
          <h4 style="margin-top: var(--space-1)">{{ a.name }}</h4>
        </div>
        <p class="small muted annonce-description">{{ a.content }}</p>
        <div class="layout-flex layout-gap-small" style="margin-top: var(--space-3)">
          <button class="ghost small" @click="openEdit(a)">{{ t('common.edit') }}</button>
          <button class="ghost small" @click="remove(a)">{{ t('common.delete') }}</button>
        </div>
      </article>
    </div>

    <AppModal
      :open="showModal"
      size="medium"
      :title="editingId !== null ? t('staffAdvice.modal.editTitle') : t('staffAdvice.modal.createTitle')"
      @close="showModal = false"
    >
      <form
        id="advice-form"
        class="layout-flex layout-columns layout-gap-medium"
        @submit.prevent="submit"
      >
        <div class="form-group">
          <label class="uppercase">{{ t('staffAdvice.form.title') }}</label>
          <input
            v-model="form.name"
            type="text"
            class="primary medium full-width"
            :placeholder="t('staffAdvice.form.titlePlaceholder')"
            required
          />
        </div>
        <div class="form-group">
          <label class="uppercase">{{ t('staffAdvice.form.type') }}</label>
          <select v-model="form.type" class="primary medium full-width">
            <option value="conseil">{{ t('staffAdvice.form.typeAdvice') }}</option>
            <option value="news">{{ t('staffAdvice.form.typeNews') }}</option>
            <option value="ressource">{{ t('staffAdvice.form.typeResource') }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="uppercase">{{ t('staffAdvice.form.content') }}</label>
          <textarea
            v-model="form.content"
            class="primary full-width"
            rows="6"
            :placeholder="t('staffAdvice.form.contentPlaceholder')"
          ></textarea>
        </div>
      </form>
      <template #footer>
        <button class="ghost medium" @click="showModal = false">{{ t('common.cancel') }}</button>
        <button
          type="submit"
          form="advice-form"
          class="primary medium"
          :disabled="isSaving || !form.name.trim()"
        >
          {{ isSaving ? t('staffAdvice.form.saving') : editingId !== null ? t('common.save') : t('staffAdvice.form.publish') }}
        </button>
      </template>
    </AppModal>
  </StaffDashboardLayout>
</template>

<style scoped>
.annonce-description {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
