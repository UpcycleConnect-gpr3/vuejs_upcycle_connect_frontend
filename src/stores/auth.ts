import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { computed, ref } from 'vue'
import type { Router } from 'vue-router'
import { useApiErrors } from '@/composables/useApiErrors'
import type { ApiError, ApiResponse } from '@/types/api'
import { apiAuth } from '@/services/api'

interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  bearer_token?: string
  totp_required: boolean
  hash?: string
}

interface LoginTotpResponse {
  bearer_token: string
}

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

const writeCookieFallback = (name: string, value: string) => {
  const parts = [`${name}=${encodeURIComponent(value)}`, `path=${COOKIE_PATH}`]
  if (COOKIE_DOMAIN) parts.push(`domain=${COOKIE_DOMAIN}`)
  if (window.location.protocol === 'https:') parts.push('Secure')
  parts.push('SameSite=Lax')
  document.cookie = parts.join('; ')
}

const deleteCookieFallback = (name: string) => {
  const parts = [`${name}=`, `path=${COOKIE_PATH}`, 'expires=Thu, 01 Jan 1970 00:00:00 GMT']
  if (COOKIE_DOMAIN) parts.push(`domain=${COOKIE_DOMAIN}`)
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
      const apiError = (err as { response?: { data?: ApiError } }).response?.data
      setError(apiError?.message || fallback)
      setFieldErrors(apiError)
    }

/*    const login = async ({ email, password }: LoginPayload) => {
      clearError()
      setLoading(true)
      try {
        const { data } = await apiAuth.post<ApiResponse<LoginResponse>>('/auth/login/', {
          email,
          password,
        })
        const result = data.data
        if (result.totp_required) {
          return { totpRequired: true as const, hash: result.hash ?? '' }
        }
        if (result.bearer_token) {
          await setToken(result.bearer_token)
          userEmail.value = email
        }
        return { totpRequired: false as const, hash: '' }
      } catch (err) {
        handleApiError(err, 'Échec de la connexion')
        throw err
      } finally {
        setLoading(false)
      }
    }*/

    const loginTotp = async ({ hash, code }: { hash: string; code: string }) => {
      clearError()
      setLoading(true)
      try {
        const { data } = await apiAuth.post<ApiResponse<LoginTotpResponse>>('/auth/login-totp/', {
          hash,
          code,
        })
        await setToken(data.data.bearer_token)
        return data.data
      } catch (err) {
        handleApiError(err, 'Code de vérification invalide')
        throw err
      } finally {
        setLoading(false)
      }
    }

    const register = async ({ email, password }: LoginPayload) => {
      clearError()
      setLoading(true)
      try {
        const { data } = await apiAuth.post<ApiResponse<{ user_id: string }>>('/auth/register/', {
          email,
          password,
        })
        return data.data
      } catch (err) {
        handleApiError(err, "Échec de l'inscription")
        throw err
      } finally {
        setLoading(false)
      }
    }

    const logout = async (router: Router) => {
      await clearToken()
      userEmail.value = ''
      await router.push({ name: 'login' })
    }

    const restoreTokenFromCookies = async () => {
      if (bearerToken.value) return
      const token = await getTokenFromCookies()
      if (token) bearerToken.value = token
    }

    const login = async (router: Router) => {
      const token = await getTokenFromCookies()
      if (token) {
        await router.push('/login-confirm')
      } else {
        window.location.href = `${AUTH_REDIRECT_URL}/auth/login/`
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
      loginTotp,
      register,
      logout,
      restoreTokenFromCookies,
      login,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['bearerToken', 'userEmail'],
    },
  },
)
