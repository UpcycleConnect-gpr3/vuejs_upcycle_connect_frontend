<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()
const talkId = computed(() => Number(route.params.id))

// Mock — TODO: GET /talks/:id
const talk = ref({
  id: 1,
  title: 'Comment transformer une vieille palette en table basse ?',
  category: 'questions',
  author: { name: 'Marie L.', initials: 'ML', joined: 'Mai 2025' },
  createdAt: 'il y a 5 heures',
  content: `J'ai récupéré 3 palettes de chantier en bon état et je voudrais en faire une table basse pour mon salon.\n\nQuestions :\n- Faut-il poncer les palettes avant assemblage ?\n- Quelle finition pour usage intérieur ?\n- Comment fixer les roulettes ?\n\nMerci d'avance !`,
  reactions: { like: 12, fire: 6, idea: 4, total: 22 },
  userReactions: { like: false, fire: false, idea: false } as Record<'like'|'fire'|'idea', boolean>,
})

const reactionTypes = [
  { key: 'like', icon: '👍', label: 'Like' },
  { key: 'fire', icon: '🔥', label: 'Fire' },
  { key: 'idea', icon: '💡', label: 'Idea' },
] as const

function toggleReaction(type: 'like' | 'fire' | 'idea') {
  const wasActive = talk.value.userReactions[type]
  talk.value.userReactions[type] = !wasActive
  talk.value.reactions[type] += wasActive ? -1 : 1
  talk.value.reactions.total += wasActive ? -1 : 1
  // TODO: API call POST /messages/:id/users (link/unlink)
}

const messages = ref([
  {
    id: 1,
    author: { name: 'Thomas M.', initials: 'TM' },
    createdAt: 'il y a 4h',
    content: `Salut Marie, super projet !\n\n1. Oui ponçage essentiel : grain 80 → 120 → 220.\n2. Pour intérieur, huile dure type Rubio Monocoat.\n3. Roulettes pivotantes 75mm avec tire-fond + écrous noyés.`,
    reactions: 8,
    isOp: false,
    userLiked: true,
  },
  {
    id: 2,
    author: { name: 'Julie B.', initials: 'JB' },
    createdAt: 'il y a 2h',
    content: 'Attention aux palettes traitées (marquage HT = OK, MB = à éviter pour intérieur).',
    reactions: 5,
    isOp: false,
    userLiked: false,
  },
  {
    id: 3,
    author: { name: 'Marie L.', initials: 'ML' },
    createdAt: 'il y a 1h',
    content: 'Merci à vous deux ! Mes palettes sont bien marquées HT 😅',
    reactions: 2,
    isOp: true,
    userLiked: false,
  },
])

const reply = reactive({ content: '' })
const isReplying = ref(false)

function toggleMessageLike(id: number) {
  const m = messages.value.find((x) => x.id === id)
  if (!m) return
  m.userLiked = !m.userLiked
  m.reactions += m.userLiked ? 1 : -1
}

async function handleReply() {
  if (!reply.content.trim()) return
  isReplying.value = true
  // TODO: POST /talks/:id/messages
  setTimeout(() => {
    messages.value.push({
      id: Date.now(),
      author: { name: 'Vous', initials: 'VS' },
      createdAt: "à l'instant",
      content: reply.content,
      reactions: 0,
      isOp: false,
      userLiked: false,
    })
    reply.content = ''
    isReplying.value = false
  }, 400)
}
</script>

<template>
  <AppHeader />

  <main>
    <section>
      <div class="container">
        <div style="max-width: 880px; margin-inline: auto;" class="layout-flex layout-columns layout-gap-large">
          <RouterLink to="/forum" class="ghost" style="align-self: flex-start;">← Retour au forum</RouterLink>

          <article class="card discussion-detail">
            <div class="layout-flex layout-gap-small layout-items-center">
              <span class="badge">{{ talk.category }}</span>
              <span class="small muted">· {{ talk.createdAt }}</span>
            </div>
            <h1 class="discussion-detail-title">{{ talk.title }}</h1>

            <div class="layout-flex layout-gap-medium layout-items-center">
              <div class="avatar">{{ talk.author.initials }}</div>
              <div class="layout-flex layout-columns" style="gap: 2px;">
                <span style="font-weight: 600;">{{ talk.author.name }}</span>
                <span class="tiny muted">Membre depuis {{ talk.author.joined }}</span>
              </div>
            </div>

            <div class="discussion-content">
              <p v-for="(p, i) in talk.content.split('\n\n')" :key="i" style="white-space: pre-wrap;">{{ p }}</p>
            </div>

            <div class="reactions-bar">
              <button
                v-for="r in reactionTypes"
                :key="r.key"
                type="button"
                class="reaction-btn"
                :class="{ active: talk.userReactions[r.key] }"
                @click="toggleReaction(r.key)"
              >
                <span class="reaction-icon">{{ r.icon }}</span>
                <span class="reaction-count">{{ talk.reactions[r.key] }}</span>
              </button>

              <div style="flex: 1;"></div>

              <span class="small muted">{{ messages.length }} réponse{{ messages.length > 1 ? 's' : '' }} · {{ talk.reactions.total }} réaction{{ talk.reactions.total > 1 ? 's' : '' }}</span>
            </div>
          </article>

          <section class="layout-flex layout-columns layout-gap-large">
            <h3>{{ messages.length }} réponse{{ messages.length > 1 ? 's' : '' }}</h3>

            <article
              v-for="m in messages"
              :key="m.id"
              class="message-card"
              :class="{ 'message-card--op': m.isOp }"
            >
              <div class="message-header">
                <div class="layout-flex layout-gap-medium layout-items-center">
                  <div class="avatar">{{ m.author.initials }}</div>
                  <div class="layout-flex layout-columns" style="gap: 2px;">
                    <div class="layout-flex layout-gap-small layout-items-center">
                      <span style="font-weight: 600;">{{ m.author.name }}</span>
                      <span v-if="m.isOp" class="badge badge--accent">Auteur</span>
                    </div>
                    <span class="tiny muted">{{ m.createdAt }}</span>
                  </div>
                </div>
                <button class="ghost small" @click="toggleMessageLike(m.id)">
                  <svg
                    viewBox="0 0 24 24"
                    :fill="m.userLiked ? 'var(--lime-500)' : 'none'"
                    stroke="currentColor"
                    stroke-width="2"
                    style="width: 16px; height: 16px;"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {{ m.reactions }}
                </button>
              </div>
              <p class="measure" style="white-space: pre-wrap;">{{ m.content }}</p>
            </article>
          </section>

          <form class="card layout-flex layout-columns layout-gap-medium" style="padding: var(--space-6);" @submit.prevent="handleReply">
            <h4>Votre réponse</h4>
            <div class="form-group">
              <textarea
                v-model="reply.content"
                class="primary full-width"
                rows="5"
                placeholder="Partagez votre avis, vos conseils, vos questions…"
                required
              ></textarea>
            </div>
            <div class="layout-flex layout-justify-between layout-items-center">
              <span class="tiny muted">Markdown supporté</span>
              <button type="submit" class="primary medium" :disabled="!reply.content.trim() || isReplying">
                {{ isReplying ? 'Envoi…' : 'Répondre' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>
