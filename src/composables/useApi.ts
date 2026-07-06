import { ref } from 'vue'
import type { ApiError } from '@/types/api'

// Extrait le message d'erreur du format d'erreur standard de l'API,
// avec repli sur le message Axios/JS puis sur un message métier.
export const getApiErrorMessage = (err: unknown, fallback: string): string => {
  const apiError = (err as { response?: { data?: ApiError } }).response?.data
  if (apiError?.message) return apiError.message
  if (err instanceof Error && err.message) return err.message
  return fallback
}

// État loading/erreur partagé par les actions d'un store.
// `request` exécute un appel API : il renvoie le résultat, ou null en cas
// d'échec après avoir renseigné `error` (les stores ne relancent pas l'erreur).
export const useApi = () => {
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const request = async <T>(fn: () => Promise<T>, fallback: string): Promise<T | null> => {
    isLoading.value = true
    error.value = null
    try {
      return await fn()
    } catch (err) {
      error.value = getApiErrorMessage(err, fallback)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, error, request }
}
