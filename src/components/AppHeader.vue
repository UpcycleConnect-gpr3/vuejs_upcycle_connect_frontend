<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { upcycleApiClient } from '@/api/axios'

const router = useRouter()
const authStore = useAuthStore()

const AUTH_REDIRECT_URL = import.meta.env.VITE_AUTH_REDIRECT_URL || 'http://localhost:4284'

const handleLogin = async () => {
  await authStore.login(router, upcycleApiClient)
}

const handleSignup = () => {
  window.location.href = `${AUTH_REDIRECT_URL}/auth/register`
}

const handleLogout = async () => {
  await authStore.logout(router)
}
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

    <div class="layout-flex layout-gap-medium layout-items-center">
      <template v-if="!authStore.isAuthenticated">
        <button class="ghost medium" @click="handleSignup">Sign up</button>
        <button class="primary medium" @click="handleLogin">Log in</button>
      </template>
      <button v-else class="ghost medium" @click="handleLogout">Log out</button>
    </div>
  </header>
</template>
