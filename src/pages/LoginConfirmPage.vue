<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore, getTokenFromCookies } from '@/stores/authStore'
import type { ApiResponse, User } from '@/types/api'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const AUTH_URL = import.meta.env.VITE_AUTH_URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const AUTH_REDIRECT_URL = import.meta.env.VITE_AUTH_REDIRECT_URL

const router = useRouter()
const authStore = useAuthStore()

const user = ref<User | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const fetchUser = async () => {
  try {
    const token = await getTokenFromCookies()
    if (!token) {
      window.location.href = `${AUTH_REDIRECT_URL}/auth/login`
      return
    }

    const response = await axios.get<ApiResponse<User>>(`${AUTH_URL}/user/me/`, {
      headers: {
        Authorization: token,
      },
    })

    user.value = response.data.data
  } catch (err) {
    error.value = 'Failed to load user information'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const handleConfirm = async () => {
  const token = await getTokenFromCookies()
  if (token && user.value) {
    await axios.post(
      `${BACKEND_URL}/auth/login`,
      {
        username: user.value.username ?? '',
        email: user.value.email,
        firstname: user.value.firstname ?? '',
        lastname: user.value.lastname ?? '',
      },
      {
        headers: {
          Authorization: token,
        },
      },
    )

    await authStore.setToken(token)
    authStore.userEmail = user.value.email
    await router.replace('/dashboard')
  }
}

const handleCancel = async () => {
  await authStore.clearToken()
  window.location.replace(`${AUTH_REDIRECT_URL}/auth/login`)
}

onMounted(fetchUser)
</script>

<template>
  <AppHeader />

  <main>
    <section class="loose">
      <div class="container">
        <div class="card">
          <div class="layout-flex layout-columns layout-gap-large">
            <hgroup class="center">
              <h2>Confirm your account</h2>
              <p class="muted">Please verify this is the correct account before proceeding.</p>
            </hgroup>

            <div v-if="isLoading" class="layout-flex layout-items-center layout-justify-center">
              <p>Loading user information...</p>
            </div>

            <div v-else-if="error" class="alert alert--error">
              <p>{{ error }}</p>
              <button class="ghost small" @click="handleCancel">Try again</button>
            </div>

            <div v-else-if="user" class="layout-flex layout-columns layout-gap-medium">
              <div class="form-group">
                <label>Email</label>
                <p class="primary medium">{{ user.email }}</p>
              </div>
              <div class="form-group">
                <label>First Name</label>
                <p class="primary medium">{{ user.firstname }}</p>
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <p class="primary medium">{{ user.lastname }}</p>
              </div>

              <div class="layout-flex layout-gap-medium layout-justify-end">
                <button class="ghost medium" @click="handleCancel">No, use another account</button>
                <button class="primary medium" @click="handleConfirm">
                  Yes, connect with this account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>
