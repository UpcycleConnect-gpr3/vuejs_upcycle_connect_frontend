export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface ApiValidationError {
  field: string
  message: string
}

export interface ApiError {
  message: string
  status: string
  errors?: ApiValidationError[]
}

// Utilisateur renvoyé par le module d'authentification (l'auth elle-même
// — login, register, TOTP — est gérée par le frontend auth dédié).
export interface User {
  id: string
  username?: string
  firstname: string | null
  lastname: string | null
  email: string
  totp_enabled?: boolean
  created_at: string
  updated_at: string
}
