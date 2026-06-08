import axios, { type AxiosInstance } from 'axios'

// Read the JWT from the shared `bearer_token` cookie directly so this module
// has no dependency on the auth store (avoids a circular import that breaks
// TypeScript inference). The backend expects the raw token (no `Bearer ` prefix).
const readBearerToken = (): string | null => {
  const match = document.cookie.match(/(?:^|;\s*)bearer_token=([^;]*)/)
  return match && match[1] ? decodeURIComponent(match[1]) : null
}

const attachToken = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = readBearerToken()

      if (token) {
        config.headers.Authorization = `${token}`
      }

      return config
    },
    (error) => Promise.reject(error),
  )
  return instance
}

export const apiAuth = attachToken(
  axios.create({
    baseURL: import.meta.env.VITE_AUTH_URL ?? 'http://auth.localhost',
  }),
)

export const apiForum = attachToken(
  axios.create({
    baseURL: import.meta.env.VITE_FORUM_URL ?? 'http://forum.localhost',
  }),
)

export const apiTraining = attachToken(
  axios.create({
    baseURL: import.meta.env.VITE_TRAINING_URL ?? 'http://training.localhost',
  }),
)

export const apiUpcycle = attachToken(
  axios.create({
    baseURL: import.meta.env.VITE_UPCYCLE_URL ?? 'http://upcycle.localhost',
  }),
)

export default apiUpcycle
