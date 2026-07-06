import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const decodeUserId = (token: string): string | null => {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const claims = JSON.parse(json) as { userId?: string }
    return claims.userId ?? null
  } catch {
    return null
  }
}

export const useCurrentUser = () => {
  const auth = useAuthStore()
  const currentUserId = computed(() =>
    auth.bearerToken ? decodeUserId(auth.bearerToken) : null,
  )
  return { currentUserId }
}
