<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { getTrainingContent } from '@/services/training'
import { useToastsStore } from '@/stores/toasts'

const route = useRoute()
const toasts = useToastsStore()
const { t } = useI18n()
const id = computed(() => Number(route.params.id))

const article = ref({
  id: 1,
  title: t('dashAdviceDetail.demo.title'),
  category: t('dashAdviceDetail.demo.category'),
  author: 'Marie L.',
  publishedAt: t('dashAdviceDetail.demo.publishedAt'),
  readTime: 5,
  bookmarked: true,
  content: [
    { type: 'p', text: t('dashAdviceDetail.demo.content.intro') },
    { type: 'h2', text: t('dashAdviceDetail.demo.content.h1') },
    { type: 'p', text: t('dashAdviceDetail.demo.content.p1') },
    { type: 'h2', text: t('dashAdviceDetail.demo.content.h2') },
    { type: 'p', text: t('dashAdviceDetail.demo.content.p2') },
    { type: 'h2', text: t('dashAdviceDetail.demo.content.h3') },
    { type: 'p', text: t('dashAdviceDetail.demo.content.p3') },
    { type: 'h2', text: t('dashAdviceDetail.demo.content.h4') },
    { type: 'p', text: t('dashAdviceDetail.demo.content.p4') },
    { type: 'h2', text: t('dashAdviceDetail.demo.content.h5') },
    { type: 'p', text: t('dashAdviceDetail.demo.content.p5') },
  ],
})

const related = [
  { id: 2, title: t('dashAdviceDetail.related.1.title'), category: t('dashAdviceDetail.related.1.category') },
  { id: 6, title: t('dashAdviceDetail.related.2.title'), category: t('dashAdviceDetail.related.2.category') },
  { id: 3, title: t('dashAdviceDetail.related.3.title'), category: t('dashAdviceDetail.related.3.category') },
]

onMounted(async () => {
  try {
    const c = await getTrainingContent(id.value)
    if (c) {
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
    toasts.error(t('dashAdviceDetail.toastLoadError'))
  }
})

function toggleBookmark() {
  article.value.bookmarked = !article.value.bookmarked
}
</script>

<template>
  <DashboardLayout>
    <RouterLink to="/dashboard/advice" class="ghost" style="align-self: flex-start"
      > {{ $t('dashAdviceDetail.backToAdvice') }}</RouterLink
    >

    <article class="advice-article">
      <header class="advice-article-header">
        <div class="layout-flex layout-gap-small layout-items-center">
          <span class="badge">{{ article.category }}</span>
          <span class="tiny muted">{{ $t('dashAdviceDetail.readTime', { min: article.readTime }) }}</span>
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
              <div class="tiny muted">{{ $t('dashAdviceDetail.publishedOn', { date: article.publishedAt }) }}</div>
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
            <span class="tiny">{{ article.bookmarked ? $t('dashAdviceDetail.saved') : $t('dashAdviceDetail.save') }}</span>
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
      <h3>{{ $t('dashAdviceDetail.relatedArticles') }}</h3>
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
