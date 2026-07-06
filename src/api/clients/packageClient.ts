import { apiUpcycle } from '@/services/api'
import type { ApiResponse, Package, PackagePayload } from '@/types'

const BASE_PATH = '/packages'

export const getPackages = async (): Promise<Package[]> => {
  const { data } = await apiUpcycle.get<ApiResponse<Package[]>>(BASE_PATH)
  return data.data
}

export const getPackageById = async (id: string): Promise<Package> => {
  const { data } = await apiUpcycle.get<ApiResponse<Package>>(`${BASE_PATH}/${id}`)
  return data.data
}

export const createPackage = async (payload: PackagePayload): Promise<Package> => {
  const { data } = await apiUpcycle.post<ApiResponse<Package>>(BASE_PATH, payload)
  return data.data
}

export const updatePackage = async (id: string, payload: PackagePayload): Promise<Package> => {
  const { data } = await apiUpcycle.put<ApiResponse<Package>>(`${BASE_PATH}/${id}`, payload)
  return data.data
}

export const deletePackage = async (id: string): Promise<void> => {
  await apiUpcycle.delete(`${BASE_PATH}/${id}`)
}
