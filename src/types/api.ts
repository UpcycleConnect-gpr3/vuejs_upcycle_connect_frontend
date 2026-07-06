export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface ApiMessageResponse {
  success: boolean
  message: string
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

// ---------------------------------------------------------------------------
// Auth (go_auth_backend)
// ---------------------------------------------------------------------------
export interface User {
  id: string
  username?: string
  firstname: string | null
  lastname: string | null
  email: string
  totp_enabled?: boolean // présent sur /auth/me uniquement
  created_at: string
  updated_at: string
}

export interface Credentials {
  email: string
  password: string
}

export interface TOTPCodeRequest {
  code: string
}

// POST /auth/login : bearer_token si le TOTP est désactivé,
// hash temporaire (à échanger sur /auth/login-totp) sinon.
export interface LoginResponse {
  bearer_token?: string
  hash?: string
  totp_required: boolean
}

export interface LoginTotpPayload {
  hash: string
  code: string
}

export interface LoginTotpResponse {
  bearer_token: string
}

export interface RegisterResponse {
  user_id: string
}

// GET /auth/totp : URL otpauth:// à afficher en QR code.
export interface TotpSetupResponse {
  totp_url: string
}
