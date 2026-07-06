<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import StaffDashboardLayout from '@/components/StaffDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'

type AdviceStatus = 'brouillon' | 'publie'

interface StaffAdvice {
  id: number
  title: string
  category: string
  readTime: number
  content: string
  status: AdviceStatus
  createdAt: string
  publishedAt: string
}

const search = ref('')
const activeCategory = ref<string | null>(null)
const filter = ref<'all' | AdviceStatus>('all')

const categories = [
  { id: 'debutant', name: 'Débutant' },
  { id: 'outils', name: 'Outils' },
  { id: 'technique', name: 'Technique' },
  { id: 'tendances', name: 'Tendances' },
  { id: 'inspiration', name: 'Inspiration' },
]

const articles = ref<StaffAdvice[]>([
  {
    id: 1,
    title: '5 conseils pour bien démarrer votre premier projet',
    category: 'debutant',
    readTime: 5,
    content:
      "Avant de vous lancer dans votre premier projet d'upcycling, voici les 5 erreurs à éviter et les bonnes pratiques à adopter dès le départ.",
    status: 'publie',
    createdAt: '2026-04-22',
    publishedAt: '2026-04-23',
  },
  {
    id: 2,
    title: "Outils essentiels pour l'upcycling de meubles",
    category: 'outils',
    readTime: 8,
    content:
      'Liste exhaustive des outils indispensables pour démarrer la rénovation de meubles en bois, métal ou textile.',
    status: 'publie',
    createdAt: '2026-04-18',
    publishedAt: '2026-04-19',
  },
  {
    id: 3,
    title: 'Peindre un meuble en bois en 6 étapes',
    category: 'technique',
    readTime: 6,
    content:
      'De la préparation de la surface à la finition : guide complet pour peindre un meuble en bois comme un pro.',
    status: 'brouillon',
    createdAt: '2026-06-20',
    publishedAt: '',
  },
  {
    id: 4,
    title: 'Tendances 2026 : matériaux à privilégier',
    category: 'tendances',
    readTime: 4,
    content:
      'Le retour du laiton brossé, le textile recyclé technique, et les finitions huilées naturelles.',
    status: 'publie',
    createdAt: '2026-04-10',
    publishedAt: '2026-04-11',
  },
  {
    id: 5,
    title: 'Entretenir ses outils de bricolage',
    category: 'outils',
    readTime: 5,
    content:
      'Un outil bien entretenu dure des années. Découvrez les gestes simples pour préserver vos outils.',
    status: 'brouillon',
    createdAt: '2026-06-25',
    publishedAt: '',
  },
  {
    id: 6,
    title: 'Galerie : 10 transformations spectaculaires',
    category: 'inspiration',
    readTime: 3,
    content: 'Sélection des projets les plus inspirants partagés par la communauté ce mois-ci.',
    status: 'brouillon',
    createdAt: '2026-06-28',
    publishedAt: '',
  },
  {
    id: 7,
    title: 'Sécurité : les EPI à avoir absolument',
    category: 'debutant',
    readTime: 4,
    content:
      'Lunettes, gants, masques : la liste minimale pour travailler en toute sécurité dans votre atelier.',
    status: 'publie',
    createdAt: '2026-03-28',
    publishedAt: '2026-03-29',
  },
])

const statusMeta: Record<AdviceStatus, { label: string; badge: string }> = {
  brouillon: { label: 'Brouillon', badge: 'badge--muted' },
  publie: { label: 'Publié', badge: 'badge--success' },
}

const filtered = computed(() =>
  articles.value.filter((a) => {
    if (filter.value !== 'all' && a.status !== filter.value) return false
    if (activeCategory.value && a.category !== activeCategory.value) return false
    if (
      search.value &&
      !a.title.toLowerCase().includes(search.value.toLowerCase()) &&
      !a.content.toLowerCase().includes(search.value.toLowerCase())
    )
      return false
    return true
  }),
)

const showModal = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({
  title: '',
  category: 'debutant',
  readTime: 5,
  content: '',
})

function openCreate() {
  editingId.value = null
  Object.assign(form, { title: '', category: 'debutant', readTime: 5, content: '' })
  showModal.value = true
}

function openEdit(a: StaffAdvice) {
  editingId.value = a.id
  Object.assign(form, {
    title: a.title,
    category: a.category,
    readTime: a.readTime,
    content: a.content,
  })
  showModal.value = true
}

function close() {
  showModal.value = false
  editingId.value = null
}

function submit() {
  if (editingId.value !== null) {
    const idx = articles.value.findIndex((a) => a.id === editingId.value)
    const existing = articles.value[idx]
    if (idx >= 0 && existing) {
      articles.value[idx] = { ...existing, ...form }
    }
  } else {
    articles.value.unshift({
      id: Date.now(),
      title: form.title,
      category: form.category,
      readTime: form.readTime,
      content: form.content,
      status: 'brouillon',
      createdAt: new Date().toISOString().slice(0, 10),
      publishedAt: '',
    })
  }
  close()
}

function togglePublish(a: StaffAdvice) {
  const idx = articles.value.findIndex((x) => x.id === a.id)
  const existing = articles.value[idx]
  if (idx >= 0 && existing) {
    if (existing.status === 'brouillon') {
      articles.value[idx] = {
        ...existing,
        status: 'publie',
        publishedAt: new Date().toISOString().slice(0, 10),
      }
    } else {
      articles.value[idx] = { ...existing, status: 'brouillon', publishedAt: '' }
    }
  }
}

function categoryName(id: string): string {
  return categories.find((c) => c.id === id)?.name ?? id
}
</script>

<template>
  <StaffDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Conseils & news</span>
        <h1>Mes articles</h1>
        <p class="muted measure">
          Rédigez et publiez des conseils et actualités à destination de la communauté.
        </p>
      </div>
      <button class="primary medium" @click="openCreate">+ Rédiger un conseil</button>
    </header>

    <div class="advice-toolbar">
      <input
        v-model="search"
        type="search"
        class="primary medium"
        placeholder="Rechercher un article…"
        style="flex: 1"
      />
      <div class="layout-flex layout-gap-small" style="flex-wrap: wrap">
        <button class="forum-tab" :class="{ active: filter === 'all' }" @click="filter = 'all'">
          Tout · {{ articles.length }}
        </button>
        <button
          v-for="(meta, key) in statusMeta"
          :key="key"
          class="forum-tab"
          :class="{ active: filter === key }"
          @click="filter = key as AdviceStatus"
        >
          {{ meta.label }}
          <span class="forum-tab-count">
            {{ articles.filter((a) => a.status === key).length }}
          </span>
        </button>
      </div>
      <div class="layout-flex layout-gap-small" style="flex-wrap: wrap">
        <button
          class="forum-tab"
          :class="{ active: activeCategory === null }"
          @click="activeCategory = null"
        >
          Toutes catégories
        </button>
        <button
          v-for="c in categories"
          :key="c.id"
          class="forum-tab"
          :class="{ active: activeCategory === c.id }"
          @click="activeCategory = c.id"
        >
          {{ c.name }}
        </button>
      </div>
    </div>

    <div class="advice-grid">
      <article v-for="a in filtered" :key="a.id" class="advice-card">
        <div class="advice-card-image"></div>
        <div class="advice-card-body">
          <div class="layout-flex layout-justify-between layout-items-center">
            <span class="badge">{{ categoryName(a.category) }}</span>
            <span class="badge" :class="statusMeta[a.status].badge">
              {{ statusMeta[a.status].label }}
            </span>
          </div>
          <h4 style="margin-top: var(--space-2)">{{ a.title }}</h4>
          <p class="small muted">
            {{ a.content.slice(0, 120) }}{{ a.content.length > 120 ? '…' : '' }}
          </p>
          <div class="layout-flex layout-justify-between layout-items-center">
            <span class="tiny muted">{{ a.readTime }} min · {{ a.createdAt }}</span>
            <span v-if="a.publishedAt" class="tiny muted">Publié le {{ a.publishedAt }}</span>
          </div>
          <div class="layout-flex layout-gap-small" style="margin-top: var(--space-3)">
            <button class="ghost small" @click="openEdit(a)">Modifier</button>
            <button
              class="ghost small"
              :style="{ color: a.status === 'publie' ? 'var(--destructive-color)' : undefined }"
              @click="togglePublish(a)"
            >
              {{ a.status === 'publie' ? 'Dépublier' : 'Publier' }}
            </button>
          </div>
        </div>
      </article>
    </div>

    <div v-if="filtered.length === 0" class="empty-state">
      <p>Aucun article ne correspond à vos critères.</p>
      <button class="primary medium" @click="openCreate">+ Rédiger un conseil</button>
    </div>

    <AppModal :open="showModal" size="medium" @close="close">
      <template #header>
        <h3>{{ editingId !== null ? "Modifier l'article" : 'Rédiger un conseil' }}</h3>
      </template>

      <form class="layout-flex layout-columns layout-gap-medium" @submit.prevent="submit">
        <div class="form-group">
          <label class="uppercase">Titre</label>
          <input
            v-model="form.title"
            type="text"
            class="primary medium full-width"
            placeholder="Ex: Comment poncer un meuble en bois"
            required
          />
        </div>

        <div class="layout-flex layout-gap-medium">
          <div class="form-group" style="flex: 1">
            <label class="uppercase">Catégorie</label>
            <select v-model="form.category" class="primary medium full-width">
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-group" style="width: 160px">
            <label class="uppercase">Temps de lecture (min)</label>
            <input
              v-model.number="form.readTime"
              type="number"
              min="1"
              max="60"
              class="primary medium full-width"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="uppercase">Contenu</label>
          <textarea
            v-model="form.content"
            class="primary full-width"
            rows="8"
            placeholder="Rédigez votre conseil ici…"
            required
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button class="ghost medium" @click="close">Annuler</button>
        <button class="primary medium" :disabled="!form.title || !form.content" @click="submit">
          {{ editingId !== null ? 'Enregistrer' : 'Enregistrer en brouillon' }}
        </button>
      </template>
    </AppModal>
  </StaffDashboardLayout>
</template>
