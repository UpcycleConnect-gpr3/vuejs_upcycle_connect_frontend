<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
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
    toasts.error('Impossible de charger les conseils.')
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
      toasts.success('Conseil modifié')
    } else {
      await createTrainingContent(payload)
      toasts.success('Conseil publié')
    }
    showModal.value = false
    editingId.value = null
    await load()
  } catch {
    toasts.error('Enregistrement impossible.')
  } finally {
    isSaving.value = false
  }
}

const remove = async (a: TrainingContent) => {
  try {
    await deleteTrainingContent(a.id)
    toasts.success('Conseil supprimé')
    await load()
  } catch {
    toasts.error('Suppression impossible.')
  }
}

onMounted(load)
</script>

<template>
  <StaffDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Conseils & ressources</span>
        <h1>Conseils</h1>
        <p class="muted measure">
          Rédigez et publiez les conseils et ressources pédagogiques de la communauté.
        </p>
      </div>
      <button class="primary medium" @click="openCreate">+ Nouveau conseil</button>
    </header>

    <input
      v-model="search"
      type="search"
      class="primary medium"
      placeholder="Rechercher un conseil…"
      style="max-width: 300px"
    />

    <p v-if="isLoading && !articles.length" class="muted">Chargement…</p>
    <p v-else-if="!filtered.length" class="muted center" style="padding: var(--space-8)">
      Aucun conseil ne correspond.
    </p>

    <div v-else class="dashboard-grid">
      <article v-for="a in filtered" :key="a.id" class="dashboard-card">
        <div class="card-header">
          <span class="badge">{{ a.type || 'conseil' }}</span>
          <h4 style="margin-top: var(--space-1)">{{ a.name }}</h4>
        </div>
        <p class="small muted annonce-description">{{ a.content }}</p>
        <div class="layout-flex layout-gap-small" style="margin-top: var(--space-3)">
          <button class="ghost small" @click="openEdit(a)">Modifier</button>
          <button class="ghost small" @click="remove(a)">Supprimer</button>
        </div>
      </article>
    </div>

    <AppModal
      :open="showModal"
      size="medium"
      :title="editingId !== null ? 'Modifier le conseil' : 'Nouveau conseil'"
      @close="showModal = false"
    >
      <form
        id="advice-form"
        class="layout-flex layout-columns layout-gap-medium"
        @submit.prevent="submit"
      >
        <div class="form-group">
          <label class="uppercase">Titre</label>
          <input
            v-model="form.name"
            type="text"
            class="primary medium full-width"
            placeholder="Ex : Bien poncer le bois"
            required
          />
        </div>
        <div class="form-group">
          <label class="uppercase">Type</label>
          <select v-model="form.type" class="primary medium full-width">
            <option value="conseil">Conseil</option>
            <option value="news">News</option>
            <option value="ressource">Ressource</option>
          </select>
        </div>
        <div class="form-group">
          <label class="uppercase">Contenu</label>
          <textarea
            v-model="form.content"
            class="primary full-width"
            rows="6"
            placeholder="Rédigez le conseil…"
          ></textarea>
        </div>
      </form>
      <template #footer>
        <button class="ghost medium" @click="showModal = false">Annuler</button>
        <button
          type="submit"
          form="advice-form"
          class="primary medium"
          :disabled="isSaving || !form.name.trim()"
        >
          {{ isSaving ? 'Enregistrement…' : editingId !== null ? 'Enregistrer' : 'Publier' }}
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
