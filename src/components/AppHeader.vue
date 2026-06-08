<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUiAuthModalStore } from '@/stores/uiAuthModal'
import { useAuthStore } from '@/stores/auth'

const ui = useUiAuthModalStore()
const auth = useAuthStore()
const router = useRouter()
const { isAuthenticated, userEmail } = storeToRefs(auth)

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
</script>

<template>
  <header>
    <RouterLink to="/" class="logo">
      <div class="logo-dot"></div>
      <span>UpcycleConnect</span>
    </RouterLink>

    <nav>
      <RouterLink to="/" class="navlink">Home</RouterLink>
      <RouterLink to="/service" class="navlink">Service</RouterLink>
      <RouterLink to="/resources" class="navlink">Resources</RouterLink>
      <RouterLink to="/pricing" class="navlink">Pricing</RouterLink>
      <RouterLink to="/forum" class="navlink">Forum</RouterLink>
    </nav>

    <div v-if="isAuthenticated" class="layout-flex layout-gap-medium layout-items-center">
      <RouterLink to="/dashboard" class="ghost medium">Dashboard</RouterLink>
      <div class="avatar" :title="userEmail">{{ initials }}</div>
      <button class="primary medium" @click="logout">Logout</button>
    </div>
    <div v-else class="layout-flex layout-gap-medium layout-items-center">
      <button class="ghost medium" @click="ui.open('register')">Sign up</button>
      <button class="primary medium" @click="ui.open('login')">Log in</button>
    </div>
  </header>
</template>
