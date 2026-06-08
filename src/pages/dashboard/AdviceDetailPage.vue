<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { getTrainingContent } from '@/services/training'
import { useToastsStore } from '@/stores/toasts'

const route = useRoute()
const toasts = useToastsStore()
const id = computed(() => Number(route.params.id))

const article = ref({
  id: 1,
  title: '5 conseils pour bien démarrer votre premier projet',
  category: 'Débutant',
  author: 'Marie L.',
  publishedAt: '22 avril 2026',
  readTime: 5,
  bookmarked: true,
  content: [
    {
      type: 'p',
      text: "Lancer son premier projet d'upcycling peut sembler intimidant. Voici les conseils essentiels pour partir sur de bonnes bases et éviter les erreurs classiques.",
    },
    { type: 'h2', text: '1. Commencez petit' },
    {
      type: 'p',
      text: "N'attaquez pas une armoire normande pour votre premier projet. Choisissez plutôt un objet simple : une chaise, une caisse en bois, un petit cadre. Vous gagnerez en confiance et en compétence avant de vous lancer dans des projets plus ambitieux.",
    },
    { type: 'h2', text: '2. Investissez dans les bons outils' },
    {
      type: 'p',
      text: 'Quelques outils essentiels suffisent pour bien démarrer : ponceuse électrique, tournevis, marteau, mètre, papier de verre (grains 80, 120, 220), pinceaux. Évitez les outils trop bas de gamme qui vous décourageront rapidement.',
    },
    { type: 'h2', text: '3. Préparez votre espace' },
    {
      type: 'p',
      text: 'Travaillez dans un endroit ventilé, avec un bon éclairage. Posez une bâche. Portez les EPI (équipement de protection individuelle) adaptés : lunettes, masque, gants.',
    },
    { type: 'h2', text: '4. Documentez votre projet' },
    {
      type: 'p',
      text: "Prenez des photos avant/pendant/après. C'est gratifiant, ça vous aide à progresser, et c'est parfait pour partager votre travail sur le forum UpcycleConnect.",
    },
    { type: 'h2', text: "5. Demandez de l'aide" },
    {
      type: 'p',
      text: "Notre communauté est là pour vous. N'hésitez pas à poster vos questions sur le forum — la plupart des questions reçoivent une réponse en moins de 24h.",
    },
  ],
})

const related = [
  { id: 2, title: "Outils essentiels pour l'upcycling de meubles", category: 'Outils' },
  { id: 6, title: 'Sécurité : les EPI à avoir absolument', category: 'Débutant' },
  { id: 3, title: 'Comment poncer correctement', category: 'Technique' },
]

onMounted(async () => {
  try {
    const c = await getTrainingContent(id.value)
    if (c) {
      // Go TrainingContent model: id, name, content (string), type.
      // No author/publishedAt/readTime — keep mock defaults for those.
      article.value = {
        ...article.value,
        id: c.id,
        title: (c.name as string) ?? article.value.title,
        category: (c.type as string) ?? article.value.category,
        content:
          typeof c.content === 'string'
            ? c.content.split('\n\n').map((text) => ({ type: 'p', text }))
            : article.value.content,
      }
    }
  } catch {
    toasts.error('Article indisponible, affichage des données de démonstration.')
  }
})

function toggleBookmark() {
  article.value.bookmarked = !article.value.bookmarked
}
</script>

<template>
  <DashboardLayout>
    <RouterLink to="/dashboard/advice" class="ghost" style="align-self: flex-start"
      >← Retour aux conseils</RouterLink
    >

    <article class="advice-article">
      <header class="advice-article-header">
        <div class="layout-flex layout-gap-small layout-items-center">
          <span class="badge">{{ article.category }}</span>
          <span class="tiny muted">{{ article.readTime }} min de lecture</span>
        </div>
        <h1>{{ article.title }}</h1>
        <div class="layout-flex layout-justify-between layout-items-center">
          <div class="layout-flex layout-gap-medium layout-items-center">
            <div class="avatar">
              {{
                article.author
                  .split(' ')
                  .map((s) => s[0])
                  .join('')
              }}
            </div>
            <div>
              <div style="font-weight: 600">{{ article.author }}</div>
              <div class="tiny muted">Publié le {{ article.publishedAt }}</div>
            </div>
          </div>
          <button
            class="bookmark-btn"
            :class="{ active: article.bookmarked }"
            @click="toggleBookmark"
          >
            <svg
              viewBox="0 0 24 24"
              :fill="article.bookmarked ? 'var(--lime-500)' : 'none'"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
            <span class="tiny">{{ article.bookmarked ? 'Sauvé' : 'Sauvegarder' }}</span>
          </button>
        </div>
      </header>

      <div class="advice-article-hero"></div>

      <div class="advice-article-body">
        <template v-for="(b, i) in article.content" :key="i">
          <h2 v-if="b.type === 'h2'">{{ b.text }}</h2>
          <p v-else-if="b.type === 'p'">{{ b.text }}</p>
        </template>
      </div>
    </article>

    <section
      class="layout-flex layout-columns layout-gap-medium"
      style="margin-top: var(--space-10)"
    >
      <h3>Articles liés</h3>
      <div class="advice-related">
        <RouterLink
          v-for="r in related"
          :key="r.id"
          :to="`/dashboard/advice/${r.id}`"
          class="advice-related-card"
        >
          <span class="badge">{{ r.category }}</span>
          <h5>{{ r.title }}</h5>
        </RouterLink>
      </div>
    </section>
  </DashboardLayout>
</template>
