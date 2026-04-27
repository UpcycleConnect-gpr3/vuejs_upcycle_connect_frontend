import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Router } from 'vue-router'
import { useApiErrors } from '@/composables/useApiErrors'
import type { ApiError } from '@/types/api'

declare const cookieStore: {
  set: (
    name: string,
    value: string,
    options?: { domain?: string; path?: string },
  ) => Promise<void>
  get: (name: string) => Promise<{ value?: string } | undefined>
  delete: (
    name: string,
    options?: { domain?: string; path?: string },
  ) => Promise<void>
}

const COOKIE_DOMAIN = import.meta.env.VITE_COOKIE_DOMAIN
const COOKIE_PATH = import.meta.env.VITE_COOKIE_PATH || '/'
const TOKEN_COOKIE_NAME = 'bearer_token'

const hasCookieStore = (): boolean =>
  typeof globalThis !== 'undefined' && 'cookieStore' in globalThis

const writeCookieFallback = (name: string, value: string) => {
  const parts = [`${name}=${encodeURIComponent(value)}`, `path=${COOKIE_PATH}`]
  if (COOKIE_DOMAIN) parts.push(`domain=${COOKIE_DOMAIN}`)
  if (window.location.protocol === 'https:') parts.push('Secure')
  parts.push('SameSite=Lax')
  document.cookie = parts.join('; ')
}

const deleteCookieFallback = (name: string) => {
  const parts = [
    `${name}=`,
    `path=${COOKIE_PATH}`,
    'expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ]
  if (COOKIE_DOMAIN) parts.push(`domain=${COOKIE_DOMAIN}`)
  document.cookie = parts.join('; ')
}

const readCookieFallback = (name: string): string | null => {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
  if (!match) return null
  const value = match.substring(name.length + 1)
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export const getTokenFromCookies = async (): Promise<string | null> => {
  if (hasCookieStore()) {
    const cookie = await cookieStore.get(TOKEN_COOKIE_NAME)
    return cookie?.value ?? null
  }
  return readCookieFallback(TOKEN_COOKIE_NAME)
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const bearerToken = ref<string>('')
    const isLoading = ref<boolean>(false)
    const error = ref<string | null>(null)

    const { fieldErrors, setFieldErrors, clearFieldErrors } = useApiErrors()

    const isAuthenticated = computed(() => !!bearerToken.value)

    const setToken = async (token: string) => {
      bearerToken.value = token
      if (hasCookieStore()) {
        await cookieStore.set(TOKEN_COOKIE_NAME, token, {
          domain: COOKIE_DOMAIN,
          path: COOKIE_PATH,
        })
      } else {
        writeCookieFallback(TOKEN_COOKIE_NAME, token)
      }
    }

    const clearToken = async () => {
      bearerToken.value = ''
      if (hasCookieStore()) {
        await cookieStore.delete(TOKEN_COOKIE_NAME, {
          domain: COOKIE_DOMAIN,
          path: COOKIE_PATH,
        })
      } else {
        deleteCookieFallback(TOKEN_COOKIE_NAME)
      }
    }

    const clearError = () => {
      error.value = null
      clearFieldErrors()
    }

    const setError = (message: string) => {
      error.value = message
    }

    const setLoading = (state: boolean) => {
      isLoading.value = state
    }

    const handleApiError = (err: unknown, fallback: string) => {
      const apiError = (err as { response?: { data?: ApiError } }).response
        ?.data
      setError(apiError?.message || fallback)
      setFieldErrors(apiError)
    }

    const logout = async (router: Router) => {
      await clearToken()
      await router.push({ name: 'login' })
    }

    const restoreTokenFromCookies = async () => {
      if (bearerToken.value) return
      const token = await getTokenFromCookies()
      if (token) bearerToken.value = token
    }

    return {
      bearerToken,
      isLoading,
      error,
      fieldErrors,
      isAuthenticated,
      setToken,
      clearToken,
      clearError,
      setError,
      setLoading,
      logout,
      restoreTokenFromCookies,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['bearerToken'],
    },
  },
)
