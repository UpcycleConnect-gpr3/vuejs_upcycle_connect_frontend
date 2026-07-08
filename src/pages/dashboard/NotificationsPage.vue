<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { getMyNotifications, markNotificationRead, type Notification } from '@/services/notifications'
import { useToastsStore } from '@/stores/toasts'

const toasts = useToastsStore()
const notifications = ref<Notification[]>([])
const isLoading = ref(false)

const unreadCount = computed(() => notifications.value.filter((n) => !n.is_read).length)

const load = async () => {
  isLoading.value = true
  try {
    notifications.value = await getMyNotifications()
  } catch {
    toasts.error('Impossible de charger vos notifications.')
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
    toasts.error('Action impossible.')
  }
}

onMounted(load)
</script>

<template>
  <DashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Notifications</span>
        <h1>Mes notifications</h1>
        <p class="muted measure">
          Les informations envoyées par UpcycleConnect.
          <span v-if="unreadCount"> {{ unreadCount }} non lue(s).</span>
        </p>
      </div>
    </header>

    <p v-if="isLoading && !notifications.length" class="muted">Chargement…</p>
    <p v-else-if="!notifications.length" class="muted center" style="padding: var(--space-8)">
      Aucune notification pour le moment.
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
          <span v-if="!n.is_read" class="badge badge--accent">Nouveau</span>
        </div>
        <p v-if="n.body" class="small muted" style="margin: var(--space-1) 0 0">{{ n.body }}</p>
        <span class="tiny muted">{{ (n.created_at || '').slice(0, 16).replace('T', ' ') }}</span>
      </article>
    </div>
  </DashboardLayout>
</template>
