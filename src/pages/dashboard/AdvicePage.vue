<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { getTrainingContents } from '@/services/training'
import { useToastsStore } from '@/stores/toasts'

const toasts = useToastsStore()
const { t } = useI18n()

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
  { id: 'debutant', name: t('dashAdvice.categories.debutant'), count: 12 },
  { id: 'outils', name: t('dashAdvice.categories.outils'), count: 8 },
  { id: 'technique', name: t('dashAdvice.categories.technique'), count: 24 },
  { id: 'tendances', name: t('dashAdvice.categories.tendances'), count: 6 },
  { id: 'inspiration', name: t('dashAdvice.categories.inspiration'), count: 14 },
]

const articles = ref<Advice[]>([
  {
    id: 1,
    title: t('dashAdvice.articles.1.title'),
    excerpt: t('dashAdvice.articles.1.excerpt'),
    category: 'debutant',
    readTime: 5,
    publishedAt: '2026-04-22',
    author: 'Marie L.',
    bookmarked: true,
  },
  {
    id: 2,
    title: t('dashAdvice.articles.2.title'),
    excerpt: t('dashAdvice.articles.2.excerpt'),
    category: 'outils',
    readTime: 8,
    publishedAt: '2026-04-18',
    author: 'Thomas M.',
    bookmarked: false,
  },
  {
    id: 3,
    title: t('dashAdvice.articles.3.title'),
    excerpt: t('dashAdvice.articles.3.excerpt'),
    category: 'technique',
    readTime: 6,
    publishedAt: '2026-04-15',
    author: 'Julie B.',
    bookmarked: false,
  },
  {
    id: 4,
    title: t('dashAdvice.articles.4.title'),
    excerpt: t('dashAdvice.articles.4.excerpt'),
    category: 'tendances',
    readTime: 4,
    publishedAt: '2026-04-10',
    author: 'Marie L.',
    bookmarked: true,
  },
  {
    id: 5,
    title: t('dashAdvice.articles.5.title'),
    excerpt: t('dashAdvice.articles.5.excerpt'),
    category: 'inspiration',
    readTime: 3,
    publishedAt: '2026-04-05',
    author: 'Alex D.',
    bookmarked: false,
  },
  {
    id: 6,
    title: t('dashAdvice.articles.6.title'),
    excerpt: t('dashAdvice.articles.6.excerpt'),
    category: 'debutant',
    readTime: 4,
    publishedAt: '2026-03-28',
    author: 'Thomas M.',
    bookmarked: false,
  },
])

onMounted(async () => {
  try {
    const contents = await getTrainingContents()
    if (Array.isArray(contents) && contents.length) {
      articles.value = contents.map(
        (c): Advice => ({
          id: c.id,
          title: (c.name as string) ?? t('dashAdvice.defaultArticleTitle'),
          excerpt: (c.content as string)?.slice(0, 160) ?? '',
          category: (c.type as string) ?? 'debutant',
          readTime: 5,
          publishedAt: '',
          author: t('dashAdvice.defaultAuthor'),
          bookmarked: false,
        }),
      )
    }
  } catch {
    toasts.error(t('dashAdvice.toastLoadError'))
  }
})

const filtered = computed(() =>
  articles.value.filter((a) => {
    if (activeCategory.value && a.category !== activeCategory.value) return false
    if (
      search.value &&
      !a.title.toLowerCase().includes(search.value.toLowerCase()) &&
      !a.excerpt.toLowerCase().includes(search.value.toLowerCase())
    )
      return false
    return true
  }),
)

const featured = computed(() => articles.value[0])
const others = computed(() => filtered.value.filter((a) => a.id !== featured.value?.id))

function toggleBookmark(id: number) {
  const a = articles.value.find((x) => x.id === id)
  if (a) a.bookmarked = !a.bookmarked
}
</script>

<template>
  <DashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">{{ $t('dashAdvice.eyebrow') }}</span>
        <h1>{{ $t('dashAdvice.title') }}</h1>
        <p class="muted measure">
          {{ $t('dashAdvice.subtitle') }}
        </p>
      </div>
    </header>

    <div class="advice-toolbar">
      <input
        v-model="search"
        type="search"
        class="primary medium"
        :placeholder="$t('dashAdvice.searchPlaceholder')"
        style="flex: 1"
      />
      <div class="layout-flex layout-gap-small" style="flex-wrap: wrap">
        <button
          class="forum-tab"
          :class="{ active: activeCategory === null }"
          @click="activeCategory = null"
        >
          {{ $t('dashAdvice.all') }}
        </button>
        <button
          v-for="c in categories"
          :key="c.id"
          class="forum-tab"
          :class="{ active: activeCategory === c.id }"
          @click="activeCategory = c.id"
        >
          {{ c.name }} <span class="forum-tab-count">{{ c.count }}</span>
        </button>
      </div>
    </div>

    <RouterLink
      v-if="featured && !search && !activeCategory"
      :to="`/dashboard/advice/${featured.id}`"
      class="advice-featured"
    >
      <div class="advice-featured-image"></div>
      <div class="advice-featured-body">
        <span class="eyebrow">{{ $t('dashAdvice.featured') }}</span>
        <h2>{{ featured.title }}</h2>
        <p class="muted measure">{{ featured.excerpt }}</p>
        <div class="layout-flex layout-gap-small layout-items-center">
          <span class="badge">{{ categories.find((c) => c.id === featured?.category)?.name }}</span>
          <span class="tiny muted"
            >{{ $t('dashAdvice.readTimeAuthorDate', { min: featured.readTime, author: featured.author, date: featured.publishedAt }) }}</span
          >
        </div>
      </div>
    </RouterLink>

    <div class="advice-grid">
      <article v-for="a in others" :key="a.id" class="advice-card">
        <RouterLink :to="`/dashboard/advice/${a.id}`" class="advice-card-image"></RouterLink>
        <div class="advice-card-body">
          <div class="layout-flex layout-justify-between layout-items-center">
            <span class="badge">{{ categories.find((c) => c.id === a.category)?.name }}</span>
            <button
              class="bookmark-btn"
              :class="{ active: a.bookmarked }"
              @click.stop="toggleBookmark(a.id)"
              :aria-label="a.bookmarked ? $t('dashAdvice.removeBookmark') : $t('dashAdvice.addBookmark')"
            >
              <svg
                viewBox="0 0 24 24"
                :fill="a.bookmarked ? 'var(--lime-500)' : 'none'"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
            </button>
          </div>
          <RouterLink :to="`/dashboard/advice/${a.id}`" class="advice-card-link">
            <h4>{{ a.title }}</h4>
          </RouterLink>
          <p class="small muted">{{ a.excerpt }}</p>
          <div class="layout-flex layout-justify-between layout-items-center">
            <span class="tiny muted">{{ $t('dashAdvice.readTimeAuthor', { min: a.readTime, author: a.author }) }}</span>
            <span class="tiny muted">{{ a.publishedAt }}</span>
          </div>
        </div>
      </article>
    </div>

    <p v-if="others.length === 0" class="muted center" style="padding: var(--space-10)">
      {{ $t('dashAdvice.noResults') }}
    </p>
  </DashboardLayout>
</template>
