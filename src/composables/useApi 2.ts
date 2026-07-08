import { ref } from 'vue'
import type { ApiError } from '@/types/api'

export const getApiErrorMessage = (err: unknown, fallback: string): string => {
  const apiError = (err as { response?: { data?: ApiError } }).response?.data
  if (apiError?.message) return apiError.message
  if (err instanceof Error && err.message) return err.message
  return fallback
}

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
