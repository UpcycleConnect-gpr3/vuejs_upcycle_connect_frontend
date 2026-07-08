<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCurrentUser } from '@/composables/useCurrentUser'
import { upcycleApiClient } from '@/api/axios'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const router = useRouter()
const authStore = useAuthStore()
const { roleHome } = useCurrentUser()

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
      <RouterLink to="/" class="navlink">{{ $t('nav.home') }}</RouterLink>
      <RouterLink to="/service" class="navlink">{{ $t('nav.service') }}</RouterLink>
      <RouterLink to="/resources" class="navlink">{{ $t('nav.resources') }}</RouterLink>
      <RouterLink to="/pricing" class="navlink">{{ $t('nav.pricing') }}</RouterLink>
      <RouterLink to="/forum" class="navlink">{{ $t('nav.forum') }}</RouterLink>
      <RouterLink v-if="authStore.isAuthenticated" to="/annonces" class="navlink">{{
        $t('nav.listings')
      }}</RouterLink>
    </nav>

    <div class="layout-flex layout-gap-medium layout-items-center">
      <LanguageSwitcher />
      <template v-if="!authStore.isAuthenticated">
        <button class="ghost medium" @click="handleSignup">{{ $t('auth.signup') }}</button>
        <button class="primary medium" @click="handleLogin">{{ $t('auth.login') }}</button>
      </template>
      <template v-else>
        <RouterLink :to="roleHome" class="primary medium">{{ $t('auth.myspace') }}</RouterLink>
        <button class="ghost medium" @click="handleLogout">{{ $t('auth.logout') }}</button>
      </template>
    </div>
  </header>
</template>
