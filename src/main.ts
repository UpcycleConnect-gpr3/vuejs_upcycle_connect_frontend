import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './css/style.css'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

const authStore = useAuthStore()
authStore.restoreTokenFromCookies().finally(() => {
  // Session restaurée : recharge le profil via GET /auth/me sans bloquer le mount.
  if (authStore.isAuthenticated) {
    authStore.loadProfile().catch(() => {})
  }
  app.mount('#app')
})
