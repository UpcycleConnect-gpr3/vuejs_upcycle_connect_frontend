import { apiAuth } from '@/services/api'
import type {
  ApiMessageResponse,
  ApiResponse,
  Credentials,
  LoginResponse,
  LoginTotpPayload,
  LoginTotpResponse,
  RegisterResponse,
  TotpSetupResponse,
  User,
} from '@/types'

// Étape 1 du login : renvoie bearer_token (totp_required=false)
// ou un hash temporaire (totp_required=true) à échanger sur /auth/login-totp.
export const login = async (payload: Credentials): Promise<LoginResponse> => {
  const { data } = await apiAuth.post<ApiResponse<LoginResponse>>('/auth/login', payload)
  return data.data
}

// Étape 2 du login (comptes TOTP) : hash + code à 6 chiffres → bearer_token.
export const loginTotp = async (payload: LoginTotpPayload): Promise<LoginTotpResponse> => {
  const { data } = await apiAuth.post<ApiResponse<LoginTotpResponse>>('/auth/login-totp', payload)
  return data.data
}

export const register = async (payload: Credentials): Promise<RegisterResponse> => {
  const { data } = await apiAuth.post<ApiResponse<RegisterResponse>>('/auth/register', payload)
  return data.data
}

export const getMe = async (): Promise<User> => {
  const { data } = await apiAuth.get<ApiResponse<User>>('/auth/me')
  return data.data
}

// Génère un secret TOTP côté backend et renvoie l'URL otpauth:// à afficher
// en QR code (le secret n'est activé qu'après validation via enableTotp).
export const getTotpSetup = async (): Promise<TotpSetupResponse> => {
  const { data } = await apiAuth.get<ApiResponse<TotpSetupResponse>>('/auth/totp')
  return data.data
}

export const enableTotp = async (code: string): Promise<string> => {
  const { data } = await apiAuth.post<ApiMessageResponse>('/auth/totp', { code })
  return data.message
}
