import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { useAuthStore } from '../stores/authStore'

const createAxiosClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  })

  client.interceptors.request.use(async (config) => {
    const authStore = useAuthStore()
    if (authStore.bearerToken) {
      config.headers.Authorization = authStore.bearerToken
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      console.error(`[${baseURL}] Error:`, error.message)
      return Promise.reject(error)
    },
  )

  return client
}

// Un client par domaine
export const authApiClient = createAxiosClient(
  import.meta.env.VITE_AUTH_URL ?? 'http://localhost:4242',
)
export const forumApiClient = createAxiosClient(
  import.meta.env.VITE_FORUM_URL ?? 'http://forum.localhost',
)
export const trainingApiClient = createAxiosClient(
  import.meta.env.VITE_TRAINING_URL ?? 'http://training.localhost',
)
export const upcycleApiClient = createAxiosClient(
  import.meta.env.VITE_UPCYCLE_URL ?? 'http://localhost:4343',
)
export const billingApiClient = createAxiosClient(
  import.meta.env.VITE_BILLING_URL ?? import.meta.env.VITE_UPCYCLE_URL ?? 'http://localhost:4343',
)
