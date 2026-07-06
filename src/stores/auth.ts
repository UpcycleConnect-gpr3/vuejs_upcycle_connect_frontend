import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { computed, ref } from 'vue'
import type { Router } from 'vue-router'
import { useApiErrors } from '@/composables/useApiErrors'
import type { ApiError, Credentials, LoginResponse, LoginTotpPayload, User } from '@/types/api'
import {
  enableTotp as apiEnableTotp,
  getMe as apiGetMe,
  getTotpSetup as apiGetTotpSetup,
  login as apiLogin,
  loginTotp as apiLoginTotp,
  register as apiRegister,
} from '@/api/clients/authClient'

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
  // localhost : pas d'attribut Domain (rejeté par le navigateur) → cookie host-only,
  // partagé entre tous les ports de l'hôte. Domain conservé pour un vrai domaine (prod).
  if (COOKIE_DOMAIN && COOKIE_DOMAIN !== 'localhost' && COOKIE_DOMAIN !== '127.0.0.1')
    parts.push(`domain=${COOKIE_DOMAIN}`)
  if (window.location.protocol === 'https:') parts.push('Secure')
  parts.push('SameSite=Lax')
  document.cookie = parts.join('; ')
}

const deleteCookieFallback = (name: string) => {
  const parts = [`${name}=`, `path=${COOKIE_PATH}`, 'expires=Thu, 01 Jan 1970 00:00:00 GMT']
  // localhost : pas d'attribut Domain (rejeté par le navigateur) → cookie host-only,
  // partagé entre tous les ports de l'hôte. Domain conservé pour un vrai domaine (prod).
  if (COOKIE_DOMAIN && COOKIE_DOMAIN !== 'localhost' && COOKIE_DOMAIN !== '127.0.0.1')
    parts.push(`domain=${COOKIE_DOMAIN}`)
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
    const user = ref<User | null>(null)
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

    // Charge le profil de l'utilisateur connecté (GET /auth/me).
    const fetchMe = async () => {
      const me = await apiGetMe()
      user.value = me
      userEmail.value = me.email
      return me
    }

    // Connexion par identifiants (POST /auth/login) — étape 1 du flow :
    // - totp_required=false → le bearer_token est stocké, profil chargé, terminé ;
    // - totp_required=true  → renvoie le hash temporaire, l'appelant doit
    //   demander le code TOTP puis appeler loginTotp({hash, code}).
    const loginWithCredentials = async ({ email, password }: Credentials): Promise<LoginResponse> => {
      clearError()
      setLoading(true)
      try {
        const result = await apiLogin({ email, password })
        if (!result.totp_required && result.bearer_token) {
          await setToken(result.bearer_token)
          try {
            await fetchMe()
          } catch {
            // Token stocké : la connexion reste valide même si /auth/me échoue.
            userEmail.value = email
          }
        }
        return result
      } catch (err) {
        handleApiError(err, 'Échec de la connexion')
        throw err
      } finally {
        setLoading(false)
      }
    }

    // Étape 2 du flow (POST /auth/login-totp) : échange hash + code TOTP
    // contre le bearer_token.
    const loginTotp = async ({ hash, code }: LoginTotpPayload) => {
      clearError()
      setLoading(true)
      try {
        const result = await apiLoginTotp({ hash, code })
        await setToken(result.bearer_token)
        try {
          await fetchMe()
        } catch {
          // Token stocké : la connexion reste valide même si /auth/me échoue.
        }
        return result
      } catch (err) {
        handleApiError(err, 'Code de vérification invalide')
        throw err
      } finally {
        setLoading(false)
      }
    }

    const register = async ({ email, password }: Credentials) => {
      clearError()
      setLoading(true)
      try {
        return await apiRegister({ email, password })
      } catch (err) {
        handleApiError(err, "Échec de l'inscription")
        throw err
      } finally {
        setLoading(false)
      }
    }

    // Rafraîchit le profil connecté avec gestion loading/erreur.
    const loadProfile = async () => {
      clearError()
      setLoading(true)
      try {
        return await fetchMe()
      } catch (err) {
        handleApiError(err, 'Impossible de charger le profil')
        throw err
      } finally {
        setLoading(false)
      }
    }

    // Activation TOTP (utilisateur connecté) : GET /auth/totp génère le secret
    // et renvoie l'URL otpauth:// à afficher en QR code.
    const fetchTotpSetup = async () => {
      clearError()
      setLoading(true)
      try {
        return await apiGetTotpSetup()
      } catch (err) {
        handleApiError(err, "Impossible de générer le secret d'authentification")
        throw err
      } finally {
        setLoading(false)
      }
    }

    // POST /auth/totp : valide le code scanné et active le TOTP sur le compte.
    const enableTotp = async (code: string) => {
      clearError()
      setLoading(true)
      try {
        const message = await apiEnableTotp(code)
        if (user.value) user.value = { ...user.value, totp_enabled: true }
        return message
      } catch (err) {
        handleApiError(err, "Code d'activation invalide")
        throw err
      } finally {
        setLoading(false)
      }
    }

    const logout = async (router: Router) => {
      await clearToken()
      userEmail.value = ''
      user.value = null
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
      user,
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
      loginWithCredentials,
      loginTotp,
      register,
      loadProfile,
      fetchTotpSetup,
      enableTotp,
      logout,
      restoreTokenFromCookies,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['bearerToken', 'userEmail', 'user'],
    },
  },
)
