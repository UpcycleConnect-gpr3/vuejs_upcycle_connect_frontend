<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'
import { useProjectStore } from '@/stores/projectStore'
import { useToastsStore } from '@/stores/toasts'
import type { Project } from '@/types'

const projectStore = useProjectStore()
const toasts = useToastsStore()
const { projects, currentProjectSteps, isLoading, error } = storeToRefs(projectStore)

const showNewModal = ref(false)
const showDetailModal = ref(false)
const isSaving = ref(false)
const selectedProject = ref<Project | null>(null)

const newForm = reactive({ name: '', description: '' })
const stepForm = reactive({ name: '', description: '' })

const openDetail = async (project: Project) => {
  selectedProject.value = project
  showDetailModal.value = true
  await projectStore.fetchProjectSteps(project.id)
}

const createProject = async () => {
  if (!newForm.name.trim()) return
  isSaving.value = true
  const created = await projectStore.addProject({
    name: newForm.name.trim(),
    description: newForm.description.trim(),
    image_path: '',
    user_id: '',
  })
  isSaving.value = false
  if (created) {
    toasts.success('Projet créé')
    showNewModal.value = false
    Object.assign(newForm, { name: '', description: '' })
  }
}

const removeProject = async (project: Project) => {
  const ok = await projectStore.removeProject(project.id)
  if (ok !== null) toasts.success('Projet supprimé')
}

const toggleFeatured = async (project: Project) => {
  const ok = await projectStore.setFeatured(project.id, !project.featured)
  if (ok) toasts.success(project.featured ? 'Retiré de la vitrine' : 'Projet mis en avant')
}

const addStep = async () => {
  if (!selectedProject.value || !stepForm.name.trim()) return
  isSaving.value = true
  const created = await projectStore.addProjectStep(selectedProject.value.id, {
    name: stepForm.name.trim(),
    description: stepForm.description.trim(),
    image_path: '',
    user_id: '',
    project_id: selectedProject.value.id,
    scheduled_at: '',
  })
  isSaving.value = false
  if (created) {
    toasts.success('Étape ajoutée')
    Object.assign(stepForm, { name: '', description: '' })
    await projectStore.fetchProjectSteps(selectedProject.value.id)
  }
}

onMounted(() => {
  projectStore.fetchProjects()
})
</script>

<template>
  <ProDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Upcycling</span>
        <h1>Mes projets</h1>
        <p class="muted measure">
          Suivez vos créations et documentez les étapes de transformation.
        </p>
      </div>
      <button class="primary medium" @click="showNewModal = true">+ Nouveau projet</button>
    </header>

    <p v-if="error" class="small" style="color: var(--destructive-color)">{{ error }}</p>
    <p v-else-if="isLoading && !projects.length" class="muted">Chargement des projets…</p>

    <div v-else-if="projects.length" class="dashboard-grid">
      <article v-for="project in projects" :key="project.id" class="dashboard-card">
        <div class="card-header">
          <div class="layout-flex layout-gap-small" style="flex-wrap: wrap">
            <span v-if="project.featured" class="badge badge--success">⭐ Mis en avant</span>
          </div>
          <h4 style="margin-top: var(--space-1)">{{ project.name }}</h4>
        </div>
        <p class="small muted">{{ project.description || 'Sans description' }}</p>
        <div class="tiny muted" style="margin-top: var(--space-2)">
          Créé le {{ (project.created_at ?? '').slice(0, 10) }}
        </div>
        <div class="layout-flex layout-gap-small" style="margin-top: var(--space-3); flex-wrap: wrap">
          <button class="ghost small" @click="openDetail(project)">Voir les étapes</button>
          <button class="ghost small" @click="toggleFeatured(project)">
            {{ project.featured ? '✕ Retirer de la vitrine' : '⭐ Mettre en avant' }}
          </button>
          <button class="ghost small" @click="removeProject(project)">Supprimer</button>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <p>Vous n'avez encore aucun projet. Commencez dès maintenant !</p>
      <button class="primary medium" @click="showNewModal = true">
        + Créer mon premier projet
      </button>
    </div>

    <AppModal :open="showNewModal" size="medium" title="Nouveau projet" @close="showNewModal = false">
      <form
        id="new-project-form"
        class="layout-flex layout-columns layout-gap-medium"
        @submit.prevent="createProject"
      >
        <div class="form-group">
          <label class="uppercase">Nom du projet</label>
          <input
            v-model="newForm.name"
            type="text"
            class="primary medium full-width"
            placeholder="Ex : Lampe vintage bocaux"
            required
          />
        </div>
        <div class="form-group">
          <label class="uppercase">Description</label>
          <textarea
            v-model="newForm.description"
            class="primary full-width"
            rows="4"
            placeholder="Décrivez votre projet, ses objectifs, l'histoire des matériaux…"
          ></textarea>
        </div>
      </form>
      <template #footer>
        <button class="ghost medium" @click="showNewModal = false">Annuler</button>
        <button
          type="submit"
          form="new-project-form"
          class="primary medium"
          :disabled="isSaving || !newForm.name.trim()"
        >
          {{ isSaving ? 'Création…' : 'Créer le projet' }}
        </button>
      </template>
    </AppModal>

    <AppModal
      :open="showDetailModal"
      size="medium"
      :title="selectedProject?.name"
      @close="showDetailModal = false"
    >
      <div v-if="selectedProject" class="layout-flex layout-columns layout-gap-large">
        <p class="muted">{{ selectedProject.description || 'Sans description' }}</p>

        <div>
          <h4 style="margin-bottom: var(--space-2)">Étapes ({{ currentProjectSteps.length }})</h4>
          <p v-if="!currentProjectSteps.length" class="small muted">Aucune étape pour l'instant.</p>
          <ul v-else class="layout-flex layout-columns layout-gap-small">
            <li v-for="(step, i) in currentProjectSteps" :key="step.id" class="event-row">
              <span class="step-num">{{ i + 1 }}</span>
              <div class="layout-flex layout-columns">
                <span style="font-weight: 700">{{ step.name }}</span>
                <span v-if="step.description" class="tiny muted">{{ step.description }}</span>
              </div>
            </li>
          </ul>
        </div>

        <form class="layout-flex layout-columns layout-gap-small" @submit.prevent="addStep">
          <span class="tiny uppercase muted">Ajouter une étape</span>
          <input
            v-model="stepForm.name"
            type="text"
            class="primary medium full-width"
            placeholder="Nom de l'étape"
          />
          <input
            v-model="stepForm.description"
            type="text"
            class="primary medium full-width"
            placeholder="Description (optionnel)"
          />
          <button type="submit" class="secondary medium" :disabled="isSaving || !stepForm.name.trim()">
            + Ajouter l'étape
          </button>
        </form>
      </div>
      <template #footer>
        <button class="ghost medium" @click="showDetailModal = false">Fermer</button>
      </template>
    </AppModal>
  </ProDashboardLayout>
</template>

<style scoped>
.step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  background: var(--surface-3, rgba(127, 127, 127, 0.15));
}
</style>
