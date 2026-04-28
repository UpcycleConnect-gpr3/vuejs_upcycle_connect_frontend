<script setup lang="ts">
import { RouterLink } from 'vue-router'
import DashboardOnboarding from '@/components/DashboardOnboarding.vue'

const activityNav = [
  { label: 'Vue d\'ensemble', to: '/dashboard', icon: 'M228.92,49.69a8,8,0,0,0-6.86-1.45L160.93,63.52,99.58,32.84a8,8,0,0,0-5.52-.6l-64,16A8,8,0,0,0,24,56V200a8,8,0,0,0,9.94,7.76l61.13-15.28,61.35,30.68A8,8,0,0,0,160,224a8.15,8.15,0,0,0,1.94-.24l64-16A8,8,0,0,0,232,200V56A8,8,0,0,0,228.92,49.69Z' },
  { label: 'Annonces', to: '/dashboard/listings', icon: 'M239.18,97.26,202,86.59l-15.55-39.18a16,16,0,0,0-29.74,0L141.18,86.59l-37.21,10.67a16,16,0,0,0,0,30.41l37.21,10.67,15.55,39.18a16,16,0,0,0,29.74,0L202,138.34l37.21-10.67a16,16,0,0,0,0-30.41ZM196.51,124.35,184,159.55l-12.55-35.2L136.25,112l35.2-12.55L184,64.45l12.55,35.2L231.75,112ZM104,40a8,8,0,0,1-8,8H64a8,8,0,0,1,0-16H96A8,8,0,0,1,104,40ZM72,80a8,8,0,0,1,0-16H32a8,8,0,0,0,0,16ZM48,224a8,8,0,0,1,8-8H88a8,8,0,0,1,0,16H56A8,8,0,0,1,48,224Z' },
  { label: 'Dépôts conteneur', to: '/dashboard/deposits', icon: 'M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z' },
  { label: 'Planning', to: '/dashboard/planning', icon: 'M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z' },
]

const discoverNav = [
  { label: 'Catalogue', to: '/dashboard/catalog', icon: 'M239.82,157l-12-96A16,16,0,0,0,212,47H44A16,16,0,0,0,28.18,61l-12,96A16,16,0,0,0,32,175H224A16,16,0,0,0,239.82,157Z' },
  { label: 'Conseils', to: '/dashboard/advice', icon: 'M168,80H88a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16Zm0,32H88a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16Zm56-72V200a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V40A16,16,0,0,1,48,24H208A16,16,0,0,1,224,40ZM208,200V40H48V200Z' },
]

const profileNav = [
  { label: 'Upcycling Score', to: '/dashboard/score', icon: 'M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Z' },
  { label: 'Commandes', to: '/dashboard/orders', icon: 'M232,80H167.84l-22.4-30.41a8,8,0,0,0-12.88,0L110.16,80H46A14,14,0,0,0,32,94v23.59a30.55,30.55,0,0,0,4.24,15.55L86.43,219.29A8,8,0,0,0,93.41,224H184.59a8,8,0,0,0,7-4.71l50.18-86.15A30.55,30.55,0,0,0,246,117.59V94A14,14,0,0,0,232,80Z' },
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
          <span class="sidebar-section-title">Mon activité</span>
          <ul class="sidebar-nav-list">
            <li v-for="item in activityNav" :key="item.to" class="sidebar-nav-item">
              <RouterLink :to="item.to" :data-tour="item.to === '/dashboard/listings' ? 'listings' : null">
                <svg class="sidebar-icon" viewBox="0 0 256 256" fill="currentColor"><path :d="item.icon" /></svg>
                <span>{{ item.label }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>

        <div class="dashboard-sidebar-section">
          <span class="sidebar-section-title">Découvrir</span>
          <ul class="sidebar-nav-list">
            <li v-for="item in discoverNav" :key="item.to" class="sidebar-nav-item">
              <RouterLink :to="item.to">
                <svg class="sidebar-icon" viewBox="0 0 256 256" fill="currentColor"><path :d="item.icon" /></svg>
                <span>{{ item.label }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>

        <div class="dashboard-sidebar-section">
          <span class="sidebar-section-title">Mon profil</span>
          <ul class="sidebar-nav-list">
            <li v-for="item in profileNav" :key="item.to" class="sidebar-nav-item">
              <RouterLink :to="item.to" :data-tour="item.to === '/dashboard/score' ? 'score' : null">
                <svg class="sidebar-icon" viewBox="0 0 256 256" fill="currentColor"><path :d="item.icon" /></svg>
                <span>{{ item.label }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>

      <div class="sidebar-user">
        <div class="sidebar-user-avatar">JD</div>
        <div class="sidebar-user-info">
          <span class="sidebar-user-name">Jean Dupont</span>
          <span class="sidebar-user-role">Particulier</span>
        </div>
        <a href="http://auth-front.localhost/settings/profile" class="sidebar-user-action" title="Compte">
          <svg viewBox="0 0 256 256" fill="currentColor"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Z"/></svg>
        </a>
      </div>
    </aside>

    <main class="dashboard-main">
      <slot />
    </main>

    <DashboardOnboarding />
  </div>
</template>
