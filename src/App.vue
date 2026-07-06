<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthModal from '@/components/AuthModal.vue'
import ToastHost from '@/components/ToastHost.vue'
import { useAuthStore } from '@/stores/authStore'
import { upcycleApiClient } from '@/api/axios'

const router = useRouter()
const authStore = useAuthStore()

// Étape 3.1 du guide : au démarrage, restaure le token depuis les cookies
// puis appelle /auth/login/ du module pour récupérer l'utilisateur.
onMounted(async () => {
  await authStore.restoreTokenFromCookies()
  if (authStore.bearerToken) {
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
