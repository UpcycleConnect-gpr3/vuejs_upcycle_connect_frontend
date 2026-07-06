<script setup lang="ts">
import { ref, reactive } from 'vue'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'

type ProjectStatus = 'brouillon' | 'en cours' | 'terminé' | 'mis en avant'

interface ProjectStep {
  label: string
  done: boolean
}

interface Project {
  id: number
  title: string
  material: string
  description: string
  status: ProjectStatus
  steps: ProjectStep[]
  featured: boolean
  createdAt: string
}

const projects = ref<Project[]>([
  {
    id: 1,
    title: 'Lampe upcyclée bocaux',
    material: 'Verre',
    description: 'Transformer des bocaux en verre récupérés en luminaires design.',
    status: 'en cours',
    steps: [
      { label: 'Collecte des bocaux', done: true },
      { label: 'Câblage électrique', done: true },
      { label: 'Assemblage final', done: false },
      { label: 'Photos et mise en vente', done: false },
    ],
    featured: false,
    createdAt: '2026-05-15',
  },
  {
    id: 2,
    title: 'Étagère tuyaux acier',
    material: 'Métal',
    description: 'Étagère industrielle fabriquée à partir de tuyaux en acier récupérés.',
    status: 'en cours',
    steps: [
      { label: 'Découpe et dégraissage', done: true },
      { label: 'Assemblage tuyaux', done: true },
      { label: 'Planches de bois', done: false },
      { label: 'Finition et vernissage', done: false },
    ],
    featured: true,
    createdAt: '2026-05-20',
  },
  {
    id: 3,
    title: 'Tabouret palette bois',
    material: 'Bois',
    description: 'Tabouret rustique fabriqué à partir de palettes récupérées.',
    status: 'terminé',
    steps: [
      { label: 'Sélection palettes', done: true },
      { label: 'Ponçage et traitement', done: true },
      { label: 'Assemblage', done: true },
      { label: 'Peinture', done: true },
    ],
    featured: false,
    createdAt: '2026-04-10',
  },
  {
    id: 4,
    title: 'Sac en chutes de cuir',
    material: 'Cuir',
    description: 'Idée de sac artisanal à partir de chutes maroquinerie.',
    status: 'brouillon',
    steps: [
      { label: 'Collecte des chutes', done: false },
      { label: 'Patron et découpe', done: false },
      { label: 'Couture', done: false },
    ],
    featured: false,
    createdAt: '2026-06-25',
  },
])

const statusMeta: Record<ProjectStatus, { badge: string }> = {
  brouillon: { badge: 'badge--muted' },
  'en cours': { badge: 'badge--accent' },
  terminé: { badge: 'badge--success' },
  'mis en avant': { badge: 'badge--success' },
}

const showNewModal = ref(false)
const selectedProject = ref<Project | null>(null)
const showDetailModal = ref(false)

const newForm = reactive({
  title: '',
  material: '',
  description: '',
})

function openDetail(project: Project) {
  selectedProject.value = project
  showDetailModal.value = true
}

function toggleFeatured(project: Project) {
  const idx = projects.value.findIndex((p) => p.id === project.id)
  if (idx >= 0) {
    const current = projects.value[idx]!
    const newFeatured = !current.featured
    projects.value[idx] = {
      ...current,
      featured: newFeatured,
      status: newFeatured
        ? 'mis en avant'
        : current.status === 'mis en avant'
          ? 'en cours'
          : current.status,
    }
  }
}

function createProject() {
  if (!newForm.title || !newForm.material) return
  projects.value.unshift({
    id: Date.now(),
    title: newForm.title,
    material: newForm.material,
    description: newForm.description,
    status: 'brouillon',
    steps: [
      { label: 'Collecte des matériaux', done: false },
      { label: 'Conception', done: false },
      { label: 'Réalisation', done: false },
    ],
    featured: false,
    createdAt: new Date().toISOString().slice(0, 10),
  })
  Object.assign(newForm, { title: '', material: '', description: '' })
  showNewModal.value = false
}

function progressPercent(project: Project): number {
  const done = project.steps.filter((s) => s.done).length
  return project.steps.length ? Math.round((done / project.steps.length) * 100) : 0
}
</script>

<template>
  <ProDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Upcycling</span>
        <h1>Mes projets</h1>
        <p class="muted measure">
          Suivez vos créations et mettez en avant vos réalisations sur la marketplace.
        </p>
      </div>
      <button class="primary medium" @click="showNewModal = true">+ Nouveau projet</button>
    </header>

    <div class="stats-row">
      <div class="stat-tile">
        <span class="stat-tile-label">En cours</span>
        <span class="stat-tile-value">{{
          projects.filter((p) => p.status === 'en cours' || p.status === 'mis en avant').length
        }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">Terminés</span>
        <span class="stat-tile-value">{{
          projects.filter((p) => p.status === 'terminé').length
        }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">Mis en avant</span>
        <span class="stat-tile-value">{{ projects.filter((p) => p.featured).length }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">Brouillons</span>
        <span class="stat-tile-value">{{
          projects.filter((p) => p.status === 'brouillon').length
        }}</span>
      </div>
    </div>

    <div class="dashboard-grid">
      <article
        v-for="project in projects"
        :key="project.id"
        class="dashboard-card"
        style="cursor: pointer"
        @click="openDetail(project)"
      >
        <div class="card-header">
          <div class="layout-flex layout-gap-small" style="flex-wrap: wrap">
            <span class="badge" :class="statusMeta[project.status].badge">{{
              project.status
            }}</span>
            <span v-if="project.featured" class="badge badge--success">⭐ Mis en avant</span>
            <span class="badge">{{ project.material }}</span>
          </div>
          <h4 style="margin-top: var(--space-2)">{{ project.title }}</h4>
        </div>
        <p class="small muted">{{ project.description }}</p>

        <div style="margin-top: var(--space-2)">
          <div class="layout-flex layout-justify-between" style="margin-bottom: var(--space-1)">
            <span class="tiny muted">Avancement</span>
            <span class="tiny mono">{{ progressPercent(project) }}%</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: `${progressPercent(project)}%` }"></div>
          </div>
          <div class="tiny muted" style="margin-top: var(--space-1)">
            {{ project.steps.filter((s) => s.done).length }} / {{ project.steps.length }} étapes
          </div>
        </div>

        <div class="layout-flex layout-gap-small" style="margin-top: var(--space-3)" @click.stop>
          <button class="ghost small" @click="toggleFeatured(project)">
            {{ project.featured ? '✕ Retirer de la vitrine' : '⭐ Mettre en avant' }}
          </button>
        </div>
      </article>
    </div>

    <div v-if="projects.length === 0" class="empty-state">
      <p>Vous n'avez encore aucun projet. Commencez dès maintenant !</p>
      <button class="primary medium" @click="showNewModal = true">
        + Créer mon premier projet
      </button>
    </div>

    <AppModal :open="showNewModal" size="medium" @close="showNewModal = false">
      <template #header>
        <h3>Nouveau projet d'upcycling</h3>
      </template>

      <form class="layout-flex layout-columns layout-gap-medium" @submit.prevent="createProject">
        <div class="form-group">
          <label class="uppercase">Titre du projet</label>
          <input
            v-model="newForm.title"
            type="text"
            class="primary medium full-width"
            placeholder="Ex : Lampe vintage bocaux"
            required
          />
        </div>
        <div class="form-group">
          <label class="uppercase">Matériau principal</label>
          <select v-model="newForm.material" class="primary medium full-width" required>
            <option value="" disabled>Choisir…</option>
            <option>Bois</option>
            <option>Métal</option>
            <option>Textile</option>
            <option>Verre</option>
            <option>Cuir</option>
            <option>Plastique</option>
            <option>Autre</option>
          </select>
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
          class="primary medium"
          :disabled="!newForm.title || !newForm.material"
          @click="createProject"
        >
          Créer le projet
        </button>
      </template>
    </AppModal>

    <AppModal :open="showDetailModal" size="medium" @close="showDetailModal = false">
      <template #header>
        <h3>{{ selectedProject?.title }}</h3>
      </template>

      <div v-if="selectedProject" class="layout-flex layout-columns layout-gap-medium">
        <div class="layout-flex layout-gap-small">
          <span class="badge" :class="statusMeta[selectedProject.status].badge">{{
            selectedProject.status
          }}</span>
          <span class="badge">{{ selectedProject.material }}</span>
        </div>
        <p class="muted">{{ selectedProject.description }}</p>
        <div>
          <h4 style="margin-bottom: var(--space-2)">Étapes</h4>
          <ul class="layout-flex layout-columns layout-gap-small">
            <li v-for="(step, i) in selectedProject.steps" :key="i" class="event-row">
              <span
                style="
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 12px;
                  flex-shrink: 0;
                "
                :style="{
                  background: step.done ? 'var(--lime-500)' : 'var(--surface-3)',
                  color: step.done ? '#000' : 'var(--text-tertiary)',
                }"
                >{{ step.done ? '✓' : i + 1 }}</span
              >
              <span
                :style="{
                  textDecoration: step.done ? 'line-through' : 'none',
                  opacity: step.done ? 0.6 : 1,
                }"
              >
                {{ step.label }}
              </span>
            </li>
          </ul>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">Créé le</span>
          <span class="mono">{{ selectedProject.createdAt }}</span>
        </div>
      </div>

      <template #footer>
        <button class="ghost medium" @click="showDetailModal = false">Fermer</button>
      </template>
    </AppModal>
  </ProDashboardLayout>
</template>
