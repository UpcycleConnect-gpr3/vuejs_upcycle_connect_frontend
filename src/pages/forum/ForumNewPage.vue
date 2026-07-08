<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { getCategories, createTalk, type ForumCategory } from '@/services/forum'
import { useToastsStore } from '@/stores/toasts'

const router = useRouter()
const toasts = useToastsStore()
const { t } = useI18n()
const isSubmitting = ref(false)

const form = reactive({
  title: '',
  content: '',
  categoryId: '' as string,
})

const defaultCategoryIds = ['tips', 'questions', 'show', 'partners', 'general']
const remoteCategories = ref<{ id: string; name: string }[] | null>(null)

const categories = computed(
  () =>
    remoteCategories.value ??
    defaultCategoryIds.map((id) => ({ id, name: t(`forumNew.categories.${id}`) })),
)

onMounted(async () => {
  try {
    const data = await getCategories()
    const visible = (Array.isArray(data) ? data : []).filter(
      (c: ForumCategory) => c.name !== 'private',
    )
    if (visible.length) {
      remoteCategories.value = visible.map((c: ForumCategory) => ({
        id: String(c.id),
        name: c.name,
      }))
    }
  } catch {
    toasts.error(t('forumNew.toasts.categoriesFailed'))
  }
})

async function handleSubmit() {
  if (!form.title || !form.content) return
  isSubmitting.value = true
  try {
    await createTalk({
      title: form.title,
      content: form.content,
      category_id: Number(form.categoryId) || 0,
    })
    toasts.success(t('forumNew.toasts.published'))
    router.push('/forum')
  } catch {
    toasts.error(t('forumNew.toasts.publishFailed'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AppHeader />

  <main>
    <section class="loose">
      <div class="container">
        <div
          class="layout-flex layout-columns layout-gap-large"
          style="max-width: 760px; margin-inline: auto"
        >
          <RouterLink to="/forum" class="ghost" style="align-self: flex-start"
            > {{ t('forumNew.backToForum') }}</RouterLink
          >

          <hgroup>
            <span class="eyebrow">{{ t('forumNew.eyebrow') }}</span>
            <h1>{{ t('forumNew.title') }}</h1>
            <p class="lead measure">
              {{ t('forumNew.subtitle') }}
            </p>
          </hgroup>

          <form
            @submit.prevent="handleSubmit"
            class="card layout-flex layout-columns layout-gap-large"
            style="padding: var(--space-8)"
          >
            <div class="form-group">
              <label for="category" class="uppercase">{{ t('forumNew.form.category') }}</label>
              <select id="category" v-model="form.categoryId" class="primary medium full-width">
                <option value="" disabled>{{ t('forumNew.form.categoryPlaceholder') }}</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <span class="tiny muted">{{ t('forumNew.form.categoryHint') }}</span>
            </div>

            <div class="form-group">
              <label for="title" class="uppercase">{{ t('forumNew.form.title') }}</label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                class="primary medium full-width"
                :placeholder="t('forumNew.form.titlePlaceholder')"
                maxlength="120"
                required
              />
              <span class="tiny muted">{{ t('forumNew.form.titleCount', { count: form.title.length }) }}</span>
            </div>

            <div class="form-group">
              <label for="content" class="uppercase">{{ t('forumNew.form.content') }}</label>
              <textarea
                id="content"
                v-model="form.content"
                class="primary full-width"
                rows="10"
                :placeholder="t('forumNew.form.contentPlaceholder')"
                required
              ></textarea>
              <span class="tiny muted">{{ t('forumNew.form.contentHint') }}</span>
            </div>

            <div
              class="layout-flex layout-justify-end layout-gap-medium"
              style="padding-top: var(--space-3); border-top: 1px solid var(--border-color)"
            >
              <RouterLink to="/forum" class="ghost medium">{{ t('common.cancel') }}</RouterLink>
              <button type="submit" class="primary medium" :disabled="isSubmitting">
                {{ isSubmitting ? t('forumNew.form.publishing') : t('forumNew.form.submit') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>
