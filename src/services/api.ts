import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.bearerToken

    if (token) {
      config.headers.Authorization = `${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

export default api
