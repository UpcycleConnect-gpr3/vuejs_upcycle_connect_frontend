<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useTalkStore } from '@/stores/talkStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useCurrentUser } from '@/composables/useCurrentUser'
import { useToastsStore } from '@/stores/toasts'
import { useUiAuthModalStore } from '@/stores/uiAuthModal'

const talkStore = useTalkStore()
const categoryStore = useCategoryStore()
const toasts = useToastsStore()
const authModal = useUiAuthModalStore()
const { currentUserId } = useCurrentUser()

const { talks, isLoading } = storeToRefs(talkStore)
const { categories } = storeToRefs(categoryStore)

const categoryName = (id: number) => categories.value.find((c) => c.id === id)?.name ?? 'Général'

const visibleTalks = computed(() =>
  [...talks.value].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
)

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''

const showForm = ref(false)
const isSubmitting = ref(false)
const form = reactive({ title: '', content: '', category_id: 0 })

const openForm = () => {
  if (!currentUserId.value) {
    authModal.open('login')
    return
  }
  form.title = ''
  form.content = ''
  form.category_id = categories.value[0]?.id ?? 0
  showForm.value = true
}

const submit = async () => {
  if (!form.title.trim() || !form.content.trim() || !form.category_id) {
    toasts.error('Titre, message et catégorie sont requis.')
    return
  }
  isSubmitting.value = true
  const created = await talkStore.addTalk({
    title: form.title.trim(),
    content: form.content.trim(),
    category_id: form.category_id,
    type: 'discussion',
    status: 'open',
    description: '',
  })
  isSubmitting.value = false
  if (created) {
    toasts.success('Discussion publiée')
    showForm.value = false
    await talkStore.fetchTalks()
  } else {
    toasts.error('Impossible de publier la discussion.')
  }
}

onMounted(() => {
  talkStore.fetchTalks()
  categoryStore.fetchCategories()
})
</script>

<template>
  <AppHeader />

  <main>
    <section>
      <div class="container layout-flex layout-columns layout-gap-large">
        <div class="layout-flex layout-justify-between layout-items-center" style="flex-wrap: wrap; gap: var(--space-4)">
          <hgroup>
            <span class="eyebrow">Communauté</span>
            <h1>Forum</h1>
            <p class="lead measure">Posez vos questions, partagez vos astuces d'upcycling et échangez avec la communauté.</p>
          </hgroup>
          <button class="primary medium" @click="openForm">+ Nouvelle discussion</button>
        </div>

        <p v-if="isLoading && !visibleTalks.length" class="muted">Chargement des discussions…</p>

        <div
          v-else-if="!visibleTalks.length"
          class="card layout-flex layout-columns layout-items-center layout-gap-medium"
          style="padding: var(--space-12); text-align: center"
        >
          <h3>Aucune discussion pour le moment</h3>
          <p class="muted">Lancez la première conversation de la communauté.</p>
          <button class="primary medium" @click="openForm">Créer une discussion</button>
        </div>

        <div v-else class="layout-flex layout-columns layout-gap-medium">
          <article
            v-for="talk in visibleTalks"
            :key="talk.id"
            class="card layout-flex layout-columns layout-gap-small"
          >
            <div class="layout-flex layout-justify-between layout-items-center" style="gap: var(--space-3)">
              <span class="eyebrow">{{ categoryName(talk.category_id) }}</span>
              <span class="tiny muted">{{ formatDate(talk.created_at) }}</span>
            </div>
            <h3 style="margin: 0">{{ talk.title }}</h3>
            <p class="measure" style="margin: 0">{{ talk.content || talk.description }}</p>
          </article>
        </div>
      </div>
    </section>
  </main>

  <div v-if="showForm" class="forum-modal-backdrop" @click.self="showForm = false">
    <div class="card forum-modal">
      <hgroup>
        <span class="eyebrow">Nouvelle discussion</span>
        <h3>Partager avec la communauté</h3>
      </hgroup>

      <div class="form-group">
        <label>Titre</label>
        <input v-model="form.title" type="text" class="primary medium full-width" placeholder="Titre de la discussion" />
      </div>

      <div class="form-group">
        <label>Catégorie</label>
        <select v-model.number="form.category_id" class="primary medium full-width">
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <p v-if="!categories.length" class="tiny muted">Aucune catégorie disponible.</p>
      </div>

      <div class="form-group">
        <label>Message</label>
        <textarea
          v-model="form.content"
          rows="5"
          class="primary medium full-width"
          placeholder="Votre message…"
          style="resize: vertical"
        ></textarea>
      </div>

      <div class="layout-flex layout-gap-medium layout-justify-end">
        <button class="ghost medium" @click="showForm = false">Annuler</button>
        <button class="primary medium" :disabled="isSubmitting || !categories.length" @click="submit">
          {{ isSubmitting ? 'Publication…' : 'Publier' }}
        </button>
      </div>
    </div>
  </div>

  <AppFooter />
</template>

<style scoped>
.forum-modal-backdrop {
  position: fixed;
  inset: 0;
  background: oklch(0% 0 0 / 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 1000;
}
.forum-modal {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
