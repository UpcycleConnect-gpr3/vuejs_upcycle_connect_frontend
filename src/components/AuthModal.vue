<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import AppModal from '@/components/AppModal.vue'
import { useUiAuthModalStore } from '@/stores/uiAuthModal'
import { useAuthStore } from '@/stores/auth'
import { useToastsStore } from '@/stores/toasts'

const ui = useUiAuthModalStore()
const auth = useAuthStore()
const toasts = useToastsStore()
const { tab, isOpen } = storeToRefs(ui)
const { fieldErrors, isLoading } = storeToRefs(auth)

type Step = 'form' | 'totp'
const step = ref<Step>('form')
const totpHash = ref('')
const totpCode = ref('')

const loginForm = reactive({ email: '', password: '' })
const registerForm = reactive({ email: '', password: '', confirm: '' })
const localError = ref('')

const reset = () => {
  step.value = 'form'
  totpHash.value = ''
  totpCode.value = ''
  localError.value = ''
  auth.clearError()
}

watch(isOpen, (open) => {
  if (!open) reset()
})

watch(tab, () => reset())

const close = () => ui.close()

const submitLogin = async () => {
  localError.value = ''
  try {
    const result = await auth.loginWithCredentials({
      email: loginForm.email,
      password: loginForm.password,
    })
    // Compte protégé par TOTP : le hash temporaire doit être échangé
    // avec le code à 6 chiffres sur /auth/login-totp.
    if (result.totp_required && result.hash) {
      totpHash.value = result.hash
      totpCode.value = ''
      step.value = 'totp'
      return
    }
    toasts.success('Connexion réussie')
    close()
  } catch {
    // field/global errors surfaced via store
  }
}

const submitTotp = async () => {
  try {
    await auth.loginTotp({ hash: totpHash.value, code: totpCode.value })
    auth.$patch({ userEmail: loginForm.email })
    toasts.success('Connexion réussie')
    close()
  } catch {
    // errors surfaced via store
  }
}

const submitRegister = async () => {
  localError.value = ''
  if (registerForm.password !== registerForm.confirm) {
    localError.value = 'Les mots de passe ne correspondent pas.'
    return
  }
  try {
    await auth.register({ email: registerForm.email, password: registerForm.password })
    toasts.success('Compte créé, vous pouvez vous connecter')
    loginForm.email = registerForm.email
    registerForm.password = ''
    registerForm.confirm = ''
    ui.open('login')
  } catch {
    // errors surfaced via store
  }
}
</script>

<template>
  <AppModal :open="isOpen" size="small" @close="close">
    <template #header>
      <div class="layout-flex layout-gap-small">
        <button class="forum-tab" :class="{ active: tab === 'login' }" @click="ui.open('login')">
          Connexion
        </button>
        <button
          class="forum-tab"
          :class="{ active: tab === 'register' }"
          @click="ui.open('register')"
        >
          Inscription
        </button>
      </div>
    </template>

    <!-- Login -->
    <form
      v-if="tab === 'login' && step === 'form'"
      class="layout-flex layout-columns layout-gap-medium"
      @submit.prevent="submitLogin"
    >
      <div class="form-group">
        <label class="uppercase">Email</label>
        <input
          v-model="loginForm.email"
          type="email"
          class="primary medium full-width"
          placeholder="you@example.com"
          required
        />
        <span v-if="fieldErrors.email" class="tiny" style="color: var(--destructive-color)">{{
          fieldErrors.email
        }}</span>
      </div>
      <div class="form-group">
        <label class="uppercase">Mot de passe</label>
        <input
          v-model="loginForm.password"
          type="password"
          class="primary medium full-width"
          required
        />
        <span v-if="fieldErrors.password" class="tiny" style="color: var(--destructive-color)">{{
          fieldErrors.password
        }}</span>
      </div>
      <p v-if="auth.error" class="tiny" style="color: var(--destructive-color)">{{ auth.error }}</p>
      <button type="submit" class="primary medium full-width" :disabled="isLoading">
        {{ isLoading ? 'Connexion…' : 'Se connecter' }}
      </button>
    </form>

    <!-- TOTP step -->
    <form
      v-else-if="tab === 'login' && step === 'totp'"
      class="layout-flex layout-columns layout-gap-medium"
      @submit.prevent="submitTotp"
    >
      <p class="small muted">Entrez le code de votre application d'authentification.</p>
      <div class="form-group">
        <label class="uppercase">Code de vérification</label>
        <input
          v-model="totpCode"
          type="text"
          inputmode="numeric"
          class="primary medium full-width"
          placeholder="123456"
          required
        />
      </div>
      <p v-if="auth.error" class="tiny" style="color: var(--destructive-color)">{{ auth.error }}</p>
      <button type="submit" class="primary medium full-width" :disabled="isLoading">
        {{ isLoading ? 'Vérification…' : 'Valider' }}
      </button>
    </form>

    <!-- Register -->
    <form
      v-else
      class="layout-flex layout-columns layout-gap-medium"
      @submit.prevent="submitRegister"
    >
      <div class="form-group">
        <label class="uppercase">Email</label>
        <input
          v-model="registerForm.email"
          type="email"
          class="primary medium full-width"
          placeholder="you@example.com"
          required
        />
        <span v-if="fieldErrors.email" class="tiny" style="color: var(--destructive-color)">{{
          fieldErrors.email
        }}</span>
      </div>
      <div class="form-group">
        <label class="uppercase">Mot de passe</label>
        <input
          v-model="registerForm.password"
          type="password"
          class="primary medium full-width"
          required
        />
        <span v-if="fieldErrors.password" class="tiny" style="color: var(--destructive-color)">{{
          fieldErrors.password
        }}</span>
      </div>
      <div class="form-group">
        <label class="uppercase">Confirmer le mot de passe</label>
        <input
          v-model="registerForm.confirm"
          type="password"
          class="primary medium full-width"
          required
        />
      </div>
      <p v-if="localError" class="tiny" style="color: var(--destructive-color)">{{ localError }}</p>
      <p v-if="auth.error" class="tiny" style="color: var(--destructive-color)">{{ auth.error }}</p>
      <button type="submit" class="primary medium full-width" :disabled="isLoading">
        {{ isLoading ? 'Création…' : 'Créer mon compte' }}
      </button>
    </form>
  </AppModal>
</template>
