<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { useCurrentUser } from '@/composables/useCurrentUser'

const auth = useAuthStore()
const { roleLabel } = useCurrentUser()
const router = useRouter()
const { userEmail } = storeToRefs(auth)
const { t } = useI18n()

const displayName = computed(() => userEmail.value || t('proLayout.defaultAccount'))
const initials = computed(() => {
  const email = userEmail.value
  if (!email) return '?'
  const namePart = email.split('@')[0] ?? email
  const segments = namePart.split(/[._-]+/).filter(Boolean)
  if (segments.length >= 2) {
    return ((segments[0]?.[0] ?? '') + (segments[1]?.[0] ?? '')).toUpperCase()
  }
  return namePart.slice(0, 2).toUpperCase()
})

const logout = () => auth.logout(router)

const activityNav = [
  {
    labelKey: 'proLayout.nav.overview',
    to: '/pro',
    icon: 'M228.92,49.69a8,8,0,0,0-6.86-1.45L160.93,63.52,99.58,32.84a8,8,0,0,0-5.52-.6l-64,16A8,8,0,0,0,24,56V200a8,8,0,0,0,9.94,7.76l61.13-15.28,61.35,30.68A8,8,0,0,0,160,224a8.15,8.15,0,0,0,1.94-.24l64-16A8,8,0,0,0,232,200V56A8,8,0,0,0,228.92,49.69Z',
  },
  {
    labelKey: 'proLayout.nav.marketplace',
    to: '/pro/marketplace',
    icon: 'M239.18,97.26,202,86.59l-15.55-39.18a16,16,0,0,0-29.74,0L141.18,86.59l-37.21,10.67a16,16,0,0,0,0,30.41l37.21,10.67,15.55,39.18a16,16,0,0,0,29.74,0L202,138.34l37.21-10.67a16,16,0,0,0,0-30.41ZM196.51,124.35,184,159.55l-12.55-35.2L136.25,112l35.2-12.55L184,64.45l12.55,35.2L231.75,112ZM104,40a8,8,0,0,1-8,8H64a8,8,0,0,1,0-16H96A8,8,0,0,1,104,40ZM72,80a8,8,0,0,1,0-16H32a8,8,0,0,0,0,16ZM48,224a8,8,0,0,1,8-8H88a8,8,0,0,1,0,16H56A8,8,0,0,1,48,224Z',
  },
  {
    labelKey: 'proLayout.nav.pickups',
    to: '/pro/pickups',
    icon: 'M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z',
  },
  {
    labelKey: 'proLayout.nav.projects',
    to: '/pro/projects',
    icon: 'M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z',
  },
]

const businessNav = [
  {
    labelKey: 'proLayout.nav.subscription',
    to: '/pro/subscription',
    icon: 'M239.82,157l-12-96A16,16,0,0,0,212,47H44A16,16,0,0,0,28.18,61l-12,96A16,16,0,0,0,32,175H224A16,16,0,0,0,239.82,157Z',
  },
  {
    labelKey: 'proLayout.nav.ads',
    to: '/pro/ads',
    icon: 'M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Z',
  },
  {
    labelKey: 'proLayout.nav.stats',
    to: '/pro/stats',
    icon: 'M168,80H88a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16Zm0,32H88a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16Zm56-72V200a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V40A16,16,0,0,1,48,24H208A16,16,0,0,1,224,40ZM208,200V40H48V200Z',
  },
]
</script>

<template>
  <div class="dashboard-shell">
    <aside class="dashboard-sidebar">
      <RouterLink to="/" class="logo">
        <div class="logo-dot"></div>
        <span>UpcycleConnect</span>
      </RouterLink>

      <nav class="dashboard-sidebar-nav">
        <div class="dashboard-sidebar-section">
          <span class="sidebar-section-title">{{ $t('proLayout.sections.activity') }}</span>
          <ul class="sidebar-nav-list">
            <li v-for="item in activityNav" :key="item.to" class="sidebar-nav-item">
              <RouterLink :to="item.to">
                <svg class="sidebar-icon" viewBox="0 0 256 256" fill="currentColor">
                  <path :d="item.icon" />
                </svg>
                <span>{{ $t(item.labelKey) }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>

        <div class="dashboard-sidebar-section">
          <span class="sidebar-section-title">{{ $t('proLayout.sections.business') }}</span>
          <ul class="sidebar-nav-list">
            <li v-for="item in businessNav" :key="item.to" class="sidebar-nav-item">
              <RouterLink :to="item.to">
                <svg class="sidebar-icon" viewBox="0 0 256 256" fill="currentColor">
                  <path :d="item.icon" />
                </svg>
                <span>{{ $t(item.labelKey) }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>

      <div class="sidebar-user">
        <div class="sidebar-user-avatar">{{ initials }}</div>
        <div class="sidebar-user-info">
          <span class="sidebar-user-name">{{ displayName }}</span>
          <span class="sidebar-user-role">{{ roleLabel }}</span>
        </div>
        <button class="sidebar-user-action" :title="$t('auth.logout')" @click="logout">
          <svg viewBox="0 0 256 256" fill="currentColor">
            <path
              d="M124,216a12,12,0,0,1-12,12H48a12,12,0,0,1-12-12V40A12,12,0,0,1,48,28h64a12,12,0,0,1,0,24H60V204h52A12,12,0,0,1,124,216Zm108-92.49-40-40a12,12,0,0,0-17,17L195,116H112a12,12,0,0,0,0,24h83l-20,20a12,12,0,0,0,17,17l40-40A12,12,0,0,0,232,123.51Z"
            />
          </svg>
        </button>
      </div>
    </aside>

    <main class="dashboard-main">
      <slot />
    </main>
  </div>
</template>
