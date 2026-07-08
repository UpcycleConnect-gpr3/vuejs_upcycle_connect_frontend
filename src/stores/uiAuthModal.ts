import { defineStore } from 'pinia'
import { ref } from 'vue'

export type AuthTab = 'login' | 'register'

export const useUiAuthModalStore = defineStore('uiAuthModal', () => {
  const isOpen = ref(false)
  const tab = ref<AuthTab>('login')

  const open = (which: AuthTab = 'login') => {
    tab.value = which
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  return { isOpen, tab, open, close }
})
