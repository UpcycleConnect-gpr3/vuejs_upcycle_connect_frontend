<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()
const isSubmitting = ref(false)

const form = reactive({
  title: '',
  content: '',
  categoryId: '',
})

const categories = [
  { id: 'tips', name: 'Tips & Tricks' },
  { id: 'questions', name: 'Questions' },
  { id: 'show', name: 'Show & Tell' },
  { id: 'partners', name: 'Partners' },
  { id: 'general', name: 'General' },
]

async function handleSubmit() {
  if (!form.title || !form.content || !form.categoryId) return
  isSubmitting.value = true
  // TODO: POST /talks → go_forum_backend
  console.log('Create talk:', form)
  setTimeout(() => {
    isSubmitting.value = false
    router.push('/forum')
  }, 600)
}
</script>

<template>
  <AppHeader />

  <main>
    <section class="loose">
      <div class="container">
        <div class="layout-flex layout-columns layout-gap-large" style="max-width: 760px; margin-inline: auto;">
          <RouterLink to="/forum" class="ghost" style="align-self: flex-start;">← Retour au forum</RouterLink>

          <hgroup>
            <span class="eyebrow">Nouvelle discussion</span>
            <h1>Démarrer une discussion</h1>
            <p class="lead measure">Posez votre question ou partagez votre projet avec la communauté.</p>
          </hgroup>

          <form @submit.prevent="handleSubmit" class="card layout-flex layout-columns layout-gap-large" style="padding: var(--space-8);">
            <div class="form-group">
              <label for="category" class="uppercase">Catégorie</label>
              <select id="category" v-model="form.categoryId" class="primary medium full-width" required>
                <option value="" disabled>Choisissez une catégorie</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="title" class="uppercase">Titre</label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                class="primary medium full-width"
                placeholder="Ex: Comment transformer une palette en table basse ?"
                maxlength="120"
                required
              />
              <span class="tiny muted">{{ form.title.length }} / 120</span>
            </div>

            <div class="form-group">
              <label for="content" class="uppercase">Contenu</label>
              <textarea
                id="content"
                v-model="form.content"
                class="primary full-width"
                rows="10"
                placeholder="Décrivez votre projet, votre question, partagez vos photos…"
                required
              ></textarea>
              <span class="tiny muted">Markdown supporté · 5000 caractères max</span>
            </div>

            <div class="layout-flex layout-justify-end layout-gap-medium" style="padding-top: var(--space-3); border-top: 1px solid var(--border-color);">
              <RouterLink to="/forum" class="ghost medium">Annuler</RouterLink>
              <button type="submit" class="primary medium" :disabled="isSubmitting">
                {{ isSubmitting ? 'Publication…' : 'Publier la discussion' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>
