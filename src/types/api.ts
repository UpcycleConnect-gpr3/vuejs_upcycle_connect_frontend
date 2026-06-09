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

export interface User {
  id: string
  firstname: string
  lastname: string
  email: string
  totp_enabled: boolean
  created_at: string
  updated_at: string
}
