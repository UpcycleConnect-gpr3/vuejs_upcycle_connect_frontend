import { upcycleApiClient } from '../axios'
import type {
  ApiResponse,
  DeliverySummary,
  DepositResult,
  DepositedPackage,
  Locker,
  PackageInfo,
} from '@/types'

// Lockers ayant au moins un slot libre (filtrables par ville).
export const getAvailableLockers = async (city?: string): Promise<Locker[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<Locker[]>>('/lockers/available', {
    params: city ? { city } : undefined,
  })
  return data.data
}

// Dépose un objet de l'utilisateur dans un locker : renvoie le code de récupération.
export const depositObject = async (payload: {
  object_id: string
  locker_id: string
  weight?: number
}): Promise<DepositResult> => {
  const { data } = await upcycleApiClient.post<ApiResponse<DepositResult>>(
    '/packages/deposit',
    payload,
  )
  return data.data
}

// Récupère un objet via son code.
export const retrievePackage = async (
  packageCode: string,
): Promise<{ object_id: string; status: string }> => {
  const { data } = await upcycleApiClient.post<ApiResponse<{ object_id: string; status: string }>>(
    '/packages/retrieve',
    { package_code: packageCode },
  )
  return data.data
}

// Vérifie un code (écran locker) et renvoie l'état du package.
export const getPackageByCode = async (code: string): Promise<PackageInfo> => {
  const { data } = await upcycleApiClient.get<ApiResponse<PackageInfo>>(`/packages/code/${code}`)
  return data.data
}

// Objets actuellement en conteneur (pour l'espace pro : parcourir puis recuperer).
export const getDepositedPackages = async (): Promise<DepositedPackage[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<DepositedPackage[]>>('/packages/deposited')
  return data.data
}

// Ventes de l'utilisateur a deposer en casier (code de depot).
export const getSellerDeliveries = async (): Promise<DeliverySummary[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<DeliverySummary[]>>('/packages/sales')
  return data.data
}

// Achats de l'utilisateur a recuperer en casier (code de retrait).
export const getBuyerDeliveries = async (): Promise<DeliverySummary[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<DeliverySummary[]>>('/packages/purchases')
  return data.data
}

// Le vendeur confirme le depot (ouvre le casier avec son code de depot).
export const confirmDeposit = async (code: string): Promise<void> => {
  await upcycleApiClient.post('/packages/deposit-confirm', { code })
}
