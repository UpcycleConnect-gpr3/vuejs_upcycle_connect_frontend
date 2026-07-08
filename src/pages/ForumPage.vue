<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
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
const { t, locale } = useI18n()

const { talks, isLoading } = storeToRefs(talkStore)
const { categories } = storeToRefs(categoryStore)

const categoryName = (id: number) =>
  categories.value.find((c) => c.id === id)?.name ?? t('forumPage.defaultCategory')

const visibleTalks = computed(() =>
  [...talks.value].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
)

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(locale.value === 'en' ? 'en-US' : 'fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : ''

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
    toasts.error(t('forumPage.toast.validation'))
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
    toasts.success(t('forumPage.toast.published'))
    showForm.value = false
    await talkStore.fetchTalks()
  } else {
    toasts.error(t('forumPage.toast.publishError'))
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
            <span class="eyebrow">{{ $t('forumPage.eyebrow') }}</span>
            <h1>{{ $t('nav.forum') }}</h1>
            <p class="lead measure">{{ $t('forumPage.subtitle') }}</p>
          </hgroup>
          <button class="primary medium" @click="openForm">+ {{ $t('forumPage.newDiscussion') }}</button>
        </div>

        <p v-if="isLoading && !visibleTalks.length" class="muted">{{ $t('forumPage.loading') }}</p>

        <div
          v-else-if="!visibleTalks.length"
          class="card layout-flex layout-columns layout-items-center layout-gap-medium"
          style="padding: var(--space-12); text-align: center"
        >
          <h3>{{ $t('forumPage.empty.title') }}</h3>
          <p class="muted">{{ $t('forumPage.empty.subtitle') }}</p>
          <button class="primary medium" @click="openForm">{{ $t('forumPage.empty.cta') }}</button>
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
        <span class="eyebrow">{{ $t('forumPage.newDiscussion') }}</span>
        <h3>{{ $t('forumPage.modal.title') }}</h3>
      </hgroup>

      <div class="form-group">
        <label>{{ $t('forumPage.modal.titleLabel') }}</label>
        <input
          v-model="form.title"
          type="text"
          class="primary medium full-width"
          :placeholder="$t('forumPage.modal.titlePlaceholder')"
        />
      </div>

      <div class="form-group">
        <label>{{ $t('forumPage.modal.categoryLabel') }}</label>
        <select v-model.number="form.category_id" class="primary medium full-width">
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <p v-if="!categories.length" class="tiny muted">{{ $t('forumPage.modal.noCategoriesAvailable') }}</p>
      </div>

      <div class="form-group">
        <label>{{ $t('forumPage.modal.messageLabel') }}</label>
        <textarea
          v-model="form.content"
          rows="5"
          class="primary medium full-width"
          :placeholder="$t('forumPage.modal.messagePlaceholder')"
          style="resize: vertical"
        ></textarea>
      </div>

      <div class="layout-flex layout-gap-medium layout-justify-end">
        <button class="ghost medium" @click="showForm = false">{{ $t('common.cancel') }}</button>
        <button class="primary medium" :disabled="isSubmitting || !categories.length" @click="submit">
          {{ isSubmitting ? $t('forumPage.modal.publishing') : $t('forumPage.modal.publish') }}
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
