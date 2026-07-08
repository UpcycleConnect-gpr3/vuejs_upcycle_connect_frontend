<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { getMyNotifications, markNotificationRead, type Notification } from '@/services/notifications'
import { useToastsStore } from '@/stores/toasts'

const toasts = useToastsStore()
const { t } = useI18n()
const notifications = ref<Notification[]>([])
const isLoading = ref(false)

const unreadCount = computed(() => notifications.value.filter((n) => !n.is_read).length)

const load = async () => {
  isLoading.value = true
  try {
    notifications.value = await getMyNotifications()
  } catch {
    toasts.error(t('dashNotifications.toastLoadError'))
  } finally {
    isLoading.value = false
  }
}

const markRead = async (n: Notification) => {
  if (n.is_read) return
  try {
    await markNotificationRead(n.id)
    n.is_read = true
  } catch {
    toasts.error(t('dashNotifications.toastActionError'))
  }
}

onMounted(load)
</script>

<template>
  <DashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">{{ $t('dashNotifications.eyebrow') }}</span>
        <h1>{{ $t('dashNotifications.title') }}</h1>
        <p class="muted measure">
          {{ $t('dashNotifications.subtitle') }}
          <span v-if="unreadCount"> {{ $t('dashNotifications.unreadCount', { count: unreadCount }) }}</span>
        </p>
      </div>
    </header>

    <p v-if="isLoading && !notifications.length" class="muted">{{ $t('common.loading') }}</p>
    <p v-else-if="!notifications.length" class="muted center" style="padding: var(--space-8)">
      {{ $t('dashNotifications.empty') }}
    </p>

    <div v-else class="layout-flex layout-columns layout-gap-small">
      <article
        v-for="n in notifications"
        :key="n.id"
        class="dashboard-card"
        :style="n.is_read ? 'opacity: 0.65' : 'border-left: 3px solid var(--lime-500)'"
        style="cursor: pointer"
        @click="markRead(n)"
      >
        <div class="layout-flex layout-justify-between layout-items-center" style="gap: var(--space-3)">
          <h4 style="margin: 0">{{ n.title }}</h4>
          <span v-if="!n.is_read" class="badge badge--accent">{{ $t('dashNotifications.new') }}</span>
        </div>
        <p v-if="n.body" class="small muted" style="margin: var(--space-1) 0 0">{{ n.body }}</p>
        <span class="tiny muted">{{ (n.created_at || '').slice(0, 16).replace('T', ' ') }}</span>
      </article>
    </div>
  </DashboardLayout>
</template>
