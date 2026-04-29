<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'

interface Advice {
  id: number
  title: string
  excerpt: string
  category: string
  readTime: number
  publishedAt: string
  author: string
  bookmarked: boolean
}

const search = ref('')
const activeCategory = ref<string | null>(null)

const categories = [
  { id: 'debutant', name: 'Débutant', count: 12 },
  { id: 'outils', name: 'Outils', count: 8 },
  { id: 'technique', name: 'Technique', count: 24 },
  { id: 'tendances', name: 'Tendances', count: 6 },
  { id: 'inspiration', name: 'Inspiration', count: 14 },
]

const articles = ref<Advice[]>([
  { id: 1, title: '5 conseils pour bien démarrer votre premier projet', excerpt: 'Avant de vous lancer dans votre premier projet d\'upcycling, voici les 5 erreurs à éviter et les bonnes pratiques à adopter.', category: 'debutant', readTime: 5, publishedAt: '2026-04-22', author: 'Marie L.', bookmarked: true },
  { id: 2, title: 'Outils essentiels pour l\'upcycling de meubles', excerpt: 'Liste exhaustive des outils indispensables pour démarrer la rénovation de meubles en bois, métal ou textile.', category: 'outils', readTime: 8, publishedAt: '2026-04-18', author: 'Thomas M.', bookmarked: false },
  { id: 3, title: 'Comment poncer correctement', excerpt: 'Grain 80 → 120 → 220 : la méthode pas-à-pas pour un fini parfait sur tous types de bois.', category: 'technique', readTime: 6, publishedAt: '2026-04-15', author: 'Julie B.', bookmarked: false },
  { id: 4, title: 'Tendances 2026 : matériaux à privilégier', excerpt: 'Le retour du laiton brossé, le textile recyclé technique, et les finitions huilées naturelles.', category: 'tendances', readTime: 4, publishedAt: '2026-04-10', author: 'Marie L.', bookmarked: true },
  { id: 5, title: 'Galerie : 10 transformations spectaculaires', excerpt: 'Sélection de la rédaction des projets les plus inspirants partagés par la communauté ce mois-ci.', category: 'inspiration', readTime: 3, publishedAt: '2026-04-05', author: 'Alex D.', bookmarked: false },
  { id: 6, title: 'Sécurité : les EPI à avoir absolument', excerpt: 'Lunettes, gants, masques : la liste minimale pour travailler en toute sécurité dans votre atelier.', category: 'debutant', readTime: 4, publishedAt: '2026-03-28', author: 'Thomas M.', bookmarked: false },
])

const filtered = computed(() =>
  articles.value.filter((a) => {
    if (activeCategory.value && a.category !== activeCategory.value) return false
    if (search.value && !a.title.toLowerCase().includes(search.value.toLowerCase()) && !a.excerpt.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  }),
)

const featured = computed(() => articles.value[0])
const others = computed(() => filtered.value.filter((a) => a.id !== featured.value.id))

function toggleBookmark(id: number) {
  const a = articles.value.find((x) => x.id === id)
  if (a) a.bookmarked = !a.bookmarked
}
</script>

<template>
  <DashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Conseils &amp; News</span>
        <h1>Espace Conseils</h1>
        <p class="muted measure">Guides, techniques et inspirations rédigés par notre équipe pour vous aider à progresser.</p>
      </div>
    </header>

    <!-- Toolbar -->
    <div class="advice-toolbar">
      <input v-model="search" type="search" class="primary medium" placeholder="Rechercher un article…" style="flex: 1;" />
      <div class="layout-flex layout-gap-small" style="flex-wrap: wrap;">
        <button class="forum-tab" :class="{ active: activeCategory === null }" @click="activeCategory = null">Tout</button>
        <button v-for="c in categories" :key="c.id" class="forum-tab" :class="{ active: activeCategory === c.id }" @click="activeCategory = c.id">
          {{ c.name }} <span class="forum-tab-count">{{ c.count }}</span>
        </button>
      </div>
    </div>

    <!-- Featured -->
    <RouterLink v-if="featured && !search && !activeCategory" :to="`/dashboard/advice/${featured.id}`" class="advice-featured">
      <div class="advice-featured-image"></div>
      <div class="advice-featured-body">
        <span class="eyebrow">À la une</span>
        <h2>{{ featured.title }}</h2>
        <p class="muted measure">{{ featured.excerpt }}</p>
        <div class="layout-flex layout-gap-small layout-items-center">
          <span class="badge">{{ categories.find((c) => c.id === featured.category)?.name }}</span>
          <span class="tiny muted">{{ featured.readTime }} min · {{ featured.author }} · {{ featured.publishedAt }}</span>
        </div>
      </div>
    </RouterLink>

    <!-- Grid -->
    <div class="advice-grid">
      <article v-for="a in others" :key="a.id" class="advice-card">
        <RouterLink :to="`/dashboard/advice/${a.id}`" class="advice-card-image"></RouterLink>
        <div class="advice-card-body">
          <div class="layout-flex layout-justify-between layout-items-center">
            <span class="badge">{{ categories.find((c) => c.id === a.category)?.name }}</span>
            <button class="bookmark-btn" :class="{ active: a.bookmarked }" @click.stop="toggleBookmark(a.id)" :aria-label="a.bookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'">
              <svg viewBox="0 0 24 24" :fill="a.bookmarked ? 'var(--lime-500)' : 'none'" stroke="currentColor" stroke-width="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
            </button>
          </div>
          <RouterLink :to="`/dashboard/advice/${a.id}`" class="advice-card-link">
            <h4>{{ a.title }}</h4>
          </RouterLink>
          <p class="small muted">{{ a.excerpt }}</p>
          <div class="layout-flex layout-justify-between layout-items-center">
            <span class="tiny muted">{{ a.readTime }} min · {{ a.author }}</span>
            <span class="tiny muted">{{ a.publishedAt }}</span>
          </div>
        </div>
      </article>
    </div>

    <p v-if="others.length === 0" class="muted center" style="padding: var(--space-10);">Aucun article ne correspond à votre recherche.</p>
  </DashboardLayout>
</template>
