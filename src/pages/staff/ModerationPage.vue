<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import StaffDashboardLayout from '@/components/StaffDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'
import {
  getTalks,
  getTalkMessages,
  deleteTalk,
  type Talk,
  type ForumMessage,
} from '@/services/forum'
import { useToastsStore } from '@/stores/toasts'

const { t } = useI18n()
const toasts = useToastsStore()

const talks = ref<Talk[]>([])
const isLoading = ref(false)
const search = ref('')

const selected = ref<Talk | null>(null)
const messages = ref<ForumMessage[]>([])
const showDetail = ref(false)

const publicTalks = computed(() =>
  talks.value.filter((t) => (t.content as string) !== '__private__'),
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return publicTalks.value
  return publicTalks.value.filter((t) =>
    `${t.title} ${t.content ?? ''}`.toLowerCase().includes(q),
  )
})

const load = async () => {
  isLoading.value = true
  try {
    talks.value = await getTalks()
  } catch {
    toasts.error(t('staffModeration.toasts.loadFailed'))
  } finally {
    isLoading.value = false
  }
}

const openDetail = async (talk: Talk) => {
  selected.value = talk
  messages.value = []
  showDetail.value = true
  try {
    messages.value = await getTalkMessages(talk.id)
  } catch {
    messages.value = []
  }
}

const remove = async (talk: Talk) => {
  try {
    await deleteTalk(talk.id)
    toasts.success(t('staffModeration.toasts.deleted'))
    showDetail.value = false
    await load()
  } catch {
    toasts.error(t('staffModeration.toasts.deleteFailed'))
  }
}

onMounted(load)
</script>

<template>
  <StaffDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">{{ t('staffModeration.eyebrow') }}</span>
        <h1>{{ t('staffModeration.title') }}</h1>
        <p class="muted measure">
          {{ t('staffModeration.subtitle') }}
        </p>
      </div>
    </header>

    <input
      v-model="search"
      type="search"
      class="primary medium"
      :placeholder="t('staffModeration.searchPlaceholder')"
      style="max-width: 300px"
    />

    <p v-if="isLoading && !talks.length" class="muted">{{ t('common.loading') }}</p>
    <p v-else-if="!filtered.length" class="muted center" style="padding: var(--space-8)">
      {{ t('staffModeration.empty') }}
    </p>

    <div v-else class="layout-flex layout-columns layout-gap-medium">
      <article
        v-for="talk in filtered"
        :key="talk.id"
        class="dashboard-card"
        style="cursor: pointer"
        @click="openDetail(talk)"
      >
        <div class="layout-flex layout-justify-between" style="align-items: flex-start">
          <div style="flex: 1">
            <h4 style="margin: 0">{{ talk.title }}</h4>
            <p class="small muted" style="margin: var(--space-1) 0 0">{{ talk.content }}</p>
          </div>
          <button class="ghost small" @click.stop="remove(talk)">{{ t('common.delete') }}</button>
        </div>
      </article>
    </div>

    <AppModal :open="showDetail" size="medium" :title="selected?.title" @close="showDetail = false">
      <div v-if="selected" class="layout-flex layout-columns layout-gap-medium">
        <p class="muted">{{ selected.content }}</p>
        <div>
          <h4 style="margin-bottom: var(--space-2)">{{ t('staffModeration.messagesCount', { count: messages.length }) }}</h4>
          <p v-if="!messages.length" class="small muted">{{ t('staffModeration.noMessages') }}</p>
          <ul v-else class="layout-flex layout-columns layout-gap-small">
            <li v-for="m in messages" :key="m.id" class="event-row">
              <span>{{ m.content }}</span>
            </li>
          </ul>
        </div>
      </div>
      <template #footer>
        <button class="ghost medium" @click="showDetail = false">{{ t('staffModeration.close') }}</button>
        <button
          v-if="selected"
          class="primary medium"
          style="background: var(--destructive-color)"
          @click="remove(selected)"
        >
          {{ t('staffModeration.deleteDiscussion') }}
        </button>
      </template>
    </AppModal>
  </StaffDashboardLayout>
</template>
