import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

interface JwtClaims {
  userId?: string
  role?: string
}

const decodeClaims = (token: string): JwtClaims => {
  try {
    const payload = token.split('.')[1]
    if (!payload) return {}
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as JwtClaims
  } catch {
    return {}
  }
}

const ROLE_HOME: Record<string, string> = {
  provider: '/dashboard',
  professional: '/pro',
  creator: '/pro',
  employee: '/staff',
  administrator: '/staff',
}

const ROLE_LABEL: Record<string, string> = {
  provider: 'Particulier',
  professional: 'Professionnel',
  creator: 'Créateur',
  employee: 'Salarié',
  administrator: 'Administrateur',
}

export const roleFromToken = (token: string): string => decodeClaims(token).role ?? ''

export const homeForRole = (role: string): string => ROLE_HOME[role] ?? '/dashboard'

export const labelForRole = (role: string): string => ROLE_LABEL[role] ?? 'Membre'

export const useCurrentUser = () => {
  const auth = useAuthStore()

  const claims = computed(() => (auth.bearerToken ? decodeClaims(auth.bearerToken) : {}))
  const currentUserId = computed(() => claims.value.userId ?? null)
  const currentRole = computed(() => claims.value.role ?? '')
  const roleHome = computed(() => homeForRole(currentRole.value))
  const roleLabel = computed(() => labelForRole(currentRole.value))
  const isAdmin = computed(() => currentRole.value === 'administrator')

  return { currentUserId, currentRole, roleHome, roleLabel, isAdmin }
}
