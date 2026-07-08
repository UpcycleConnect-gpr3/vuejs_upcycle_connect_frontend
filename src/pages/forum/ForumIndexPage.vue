<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const { t } = useI18n()

const search = ref('')
const activeCategory = ref<string | null>(null)

const categoryDefs = [
  { id: 'tips', count: 24 },
  { id: 'questions', count: 87 },
  { id: 'show', count: 41 },
  { id: 'partners', count: 12 },
  { id: 'general', count: 156 },
]

const categories = computed(() =>
  categoryDefs.map((c) => ({ ...c, name: t(`forumIndex.categories.${c.id}`) })),
)

function categoryLabel(id: string) {
  return t(`forumIndex.categories.${id}`)
}

const discussionDefs = [
  {
    id: 1,
    author: 'Marie L.',
    authorInitials: 'ML',
    category: 'questions',
    replies: 12,
    reactions: 24,
    pinned: true,
    key: 'd1',
  },
  {
    id: 2,
    author: 'Thomas M.',
    authorInitials: 'TM',
    category: 'show',
    replies: 8,
    reactions: 47,
    pinned: false,
    key: 'd2',
  },
  {
    id: 3,
    author: 'Julie B.',
    authorInitials: 'JB',
    category: 'tips',
    replies: 23,
    reactions: 89,
    pinned: false,
    key: 'd3',
  },
  {
    id: 4,
    author: 'Alex D.',
    authorInitials: 'AD',
    category: 'partners',
    replies: 4,
    reactions: 11,
    pinned: false,
    key: 'd4',
  },
]

const discussions = computed(() =>
  discussionDefs.map((d) => ({
    ...d,
    title: t(`forumIndex.discussions.${d.key}.title`),
    excerpt: t(`forumIndex.discussions.${d.key}.excerpt`),
    lastActivity: t(`forumIndex.discussions.${d.key}.lastActivity`),
  })),
)

const filtered = computed(() =>
  discussions.value.filter((d) => {
    if (activeCategory.value && d.category !== activeCategory.value) return false
    if (search.value && !d.title.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  }),
)
</script>

<template>
  <AppHeader />

  <main>
    <section class="loose">
      <div class="container layout-flex layout-columns layout-gap-large">
        <div
          class="layout-flex layout-justify-between layout-items-end"
          style="flex-wrap: wrap; gap: var(--space-5)"
        >
          <hgroup>
            <span class="eyebrow">{{ t('nav.forum') }}</span>
            <h1>{{ t('forumIndex.title') }}</h1>
            <p class="lead measure">
              {{ t('forumIndex.subtitle') }}
            </p>
          </hgroup>
          <RouterLink to="/forum/new" class="primary medium">{{ t('forumIndex.newDiscussion') }}</RouterLink>
        </div>
      </div>
    </section>

    <section>
      <div class="container layout-flex layout-columns layout-gap-large">
        <div class="forum-toolbar">
          <input
            v-model="search"
            type="search"
            class="primary medium"
            :placeholder="t('forumIndex.searchPlaceholder')"
            style="flex: 1"
          />
          <div class="forum-tabs">
            <button
              class="forum-tab"
              :class="{ active: activeCategory === null }"
              @click="activeCategory = null"
            >
              {{ t('forumIndex.tabs.all') }}
            </button>
            <button
              v-for="c in categories"
              :key="c.id"
              class="forum-tab"
              :class="{ active: activeCategory === c.id }"
              @click="activeCategory = c.id"
            >
              {{ c.name }}
              <span class="forum-tab-count">{{ c.count }}</span>
            </button>
          </div>
        </div>

        <div class="layout-flex layout-columns layout-gap-medium">
          <RouterLink
            v-for="d in filtered"
            :key="d.id"
            :to="`/forum/${d.id}`"
            class="discussion-row"
          >
            <div class="avatar">{{ d.authorInitials }}</div>
            <div class="discussion-body">
              <div class="layout-flex layout-gap-small layout-items-center" style="flex-wrap: wrap">
                <span v-if="d.pinned" class="badge badge--accent">{{ t('forumIndex.pinned') }}</span>
                <span class="badge">{{ categoryLabel(d.category) }}</span>
              </div>
              <h3 class="discussion-title">{{ d.title }}</h3>
              <p class="small muted measure">{{ d.excerpt }}</p>
              <div class="discussion-meta">
                <span class="small muted"
                  >{{ t('forumIndex.by') }} <strong style="color: var(--foreground-color)">{{ d.author }}</strong> ·
                  {{ d.lastActivity }}</span
                >
              </div>
            </div>
            <div class="discussion-stats">
              <div class="stat-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                  />
                </svg>
                {{ d.replies }}
              </div>
              <div class="stat-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  />
                </svg>
                {{ d.reactions }}
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>
