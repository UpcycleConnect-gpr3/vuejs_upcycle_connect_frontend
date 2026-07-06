<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import AppModal from '@/components/AppModal.vue'
import { useUiAuthModalStore } from '@/stores/uiAuthModal'
import { useAuthStore } from '@/stores/authStore'
import { upcycleApiClient } from '@/api/axios'

const ui = useUiAuthModalStore()
const auth = useAuthStore()
const router = useRouter()
const { tab, isOpen } = storeToRefs(ui)

const close = () => ui.close()

// L'authentification est gérée par le module auth dédié : authStore.login
// redirige vers son portail s'il n'y a pas de token, sinon valide le token
// auprès du module via POST /auth/login/.
const goToAuthPortal = async () => {
  await auth.login(router, upcycleApiClient)
  ui.close()
}
</script>

<template>
  <AppModal :open="isOpen" size="small" @close="close">
    <template #header>
      <h3>{{ tab === 'register' ? 'Inscription' : 'Connexion' }}</h3>
    </template>

    <div class="layout-flex layout-columns layout-gap-medium">
      <p class="muted">
        La connexion et la création de compte se font sur le portail UpcycleConnect. Vous allez
        être redirigé, puis ramené sur le site une fois authentifié.
      </p>
      <p v-if="auth.error" class="tiny" style="color: var(--destructive-color)">{{ auth.error }}</p>
      <button
        class="primary medium full-width"
        :disabled="auth.isLoading"
        @click="goToAuthPortal"
      >
        {{ auth.isLoading ? 'Redirection…' : 'Continuer vers le portail' }}
      </button>
    </div>
  </AppModal>
</template>
