import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { computed, ref } from 'vue'
import type { Router } from 'vue-router'
import { useApiErrors } from '@/composables/useApiErrors'
import type { ApiError } from '@/types/api'

declare const cookieStore: {
  set: (name: string, value: string, options?: { domain?: string; path?: string }) => Promise<void>
  get: (name: string) => Promise<{ value?: string } | undefined>
  delete: (name: string, options?: { domain?: string; path?: string }) => Promise<void>
}

const COOKIE_DOMAIN = import.meta.env.VITE_COOKIE_DOMAIN
const COOKIE_PATH = import.meta.env.VITE_COOKIE_PATH || '/'
const TOKEN_COOKIE_NAME = 'bearer_token'
const AUTH_REDIRECT_URL = import.meta.env.VITE_AUTH_REDIRECT_URL || 'http://localhost:4284'

const hasCookieStore = (): boolean =>
  typeof globalThis !== 'undefined' && 'cookieStore' in globalThis

const isRealDomain = (): boolean =>
  !!COOKIE_DOMAIN && COOKIE_DOMAIN !== 'localhost' && COOKIE_DOMAIN !== '127.0.0.1'

const cookieStoreOptions = () =>
  isRealDomain() ? { domain: COOKIE_DOMAIN, path: COOKIE_PATH } : { path: COOKIE_PATH }

const writeCookieFallback = (name: string, value: string) => {
  const parts = [`${name}=${encodeURIComponent(value)}`, `path=${COOKIE_PATH}`]
  if (isRealDomain()) parts.push(`domain=${COOKIE_DOMAIN}`)
  if (window.location.protocol === 'https:') parts.push('Secure')
  parts.push('SameSite=Lax')
  document.cookie = parts.join('; ')
}

const deleteCookieFallback = (name: string) => {
  const parts = [`${name}=`, `path=${COOKIE_PATH}`, 'expires=Thu, 01 Jan 1970 00:00:00 GMT']
  if (isRealDomain()) parts.push(`domain=${COOKIE_DOMAIN}`)
  document.cookie = parts.join('; ')
}

const readCookieFallback = (name: string): string | null => {
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`))
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
    const userEmail = ref<string>('')
    const isLoading = ref<boolean>(false)
    const error = ref<string | null>(null)

    const { fieldErrors, setFieldErrors, clearFieldErrors } = useApiErrors()

    const isAuthenticated = computed(() => !!bearerToken.value)

    const setToken = async (token: string) => {
      bearerToken.value = token
      if (hasCookieStore()) {
        await cookieStore.set(TOKEN_COOKIE_NAME, token, cookieStoreOptions())
      } else {
        writeCookieFallback(TOKEN_COOKIE_NAME, token)
      }
    }

    const clearToken = async () => {
      bearerToken.value = ''
      if (hasCookieStore()) {
        await cookieStore.delete(
          TOKEN_COOKIE_NAME,
          isRealDomain() ? { domain: COOKIE_DOMAIN, path: COOKIE_PATH } : { path: COOKIE_PATH },
        )
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
      const apiError = (err as { response?: { data?: ApiError } }).response?.data
      setError(apiError?.message || fallback)
      setFieldErrors(apiError)
    }

    const logout = async (router: Router) => {
      await clearToken()
      userEmail.value = ''
      await router.push('/')
    }

    const restoreTokenFromCookies = async () => {
      if (bearerToken.value) return
      const token = await getTokenFromCookies()
      if (token) bearerToken.value = token
    }

    const login = async (router: Router, moduleApiClient: any) => {
      clearError()
      setLoading(true)
      try {
        const token = await getTokenFromCookies()
        if (!token) {
          window.location.href = `${AUTH_REDIRECT_URL}/auth/login/`
          return
        }

        const response = await moduleApiClient.post(
          '/auth/login/',
          {},
          {
            headers: { Authorization: token },
          },
        )

        if (response.data?.email) {
          userEmail.value = response.data.email
        }

        await router.push('/')
      } catch (err) {
        handleApiError(err, 'Échec de la connexion')
        await clearToken()
        window.location.href = `${AUTH_REDIRECT_URL}/auth/login/`
      } finally {
        setLoading(false)
      }
    }

    return {
      bearerToken,
      userEmail,
      isLoading,
      error,
      fieldErrors,
      isAuthenticated,
      setToken,
      clearToken,
      clearError,
      setError,
      setLoading,
      login,
      logout,
      restoreTokenFromCookies,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['bearerToken', 'userEmail'],
    },
  },
)
