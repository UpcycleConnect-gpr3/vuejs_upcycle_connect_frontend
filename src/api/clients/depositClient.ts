import { upcycleApiClient } from '../axios'
import type { ApiResponse, DepositResult, Locker, PackageInfo } from '@/types'

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
