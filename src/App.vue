<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthModal from '@/components/AuthModal.vue'
import ToastHost from '@/components/ToastHost.vue'
import { useAuthStore, getTokenFromCookies } from '@/stores/authStore'
import { upcycleApiClient } from '@/api/axios'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  const token = await getTokenFromCookies()
  if (!token) {
    if (authStore.bearerToken) await authStore.clearToken()
    return
  }
  if (authStore.bearerToken !== token) {
    await authStore.setToken(token)
    await authStore.login(router, upcycleApiClient)
  }
})
</script>

<template>
  <router-view />
  <AuthModal />
  <ToastHost />
</template>

<style scoped></style>
