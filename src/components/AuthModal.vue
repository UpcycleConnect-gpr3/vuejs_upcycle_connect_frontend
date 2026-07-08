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

const AUTH_REDIRECT_URL = import.meta.env.VITE_AUTH_REDIRECT_URL || 'http://localhost:4284'

const close = () => ui.close()

const goToAuthPortal = async () => {
  if (tab.value === 'register') {
    window.location.href = `${AUTH_REDIRECT_URL}/auth/register`
    return
  }
  await auth.login(router, upcycleApiClient)
  ui.close()
}
</script>

<template>
  <AppModal :open="isOpen" size="small" @close="close">
    <template #header>
      <h3>{{ tab === 'register' ? $t('authModal.titleRegister') : $t('auth.login') }}</h3>
    </template>

    <div class="layout-flex layout-columns layout-gap-medium">
      <p class="muted">
        {{ $t('authModal.description') }}
      </p>
      <p v-if="auth.error" class="tiny" style="color: var(--destructive-color)">{{ auth.error }}</p>
      <button class="primary medium full-width" :disabled="auth.isLoading" @click="goToAuthPortal">
        {{ auth.isLoading ? $t('authModal.redirecting') : $t('authModal.continueButton') }}
      </button>
    </div>
  </AppModal>
</template>
