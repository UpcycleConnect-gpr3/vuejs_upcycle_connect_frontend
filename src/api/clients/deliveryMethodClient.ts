import { apiUpcycle } from '@/services/api'
import type { ApiResponse, DeliveryMethod, DeliveryMethodPayload } from '@/types'

const BASE_PATH = '/delivery-methods'

export const getDeliveryMethods = async (): Promise<DeliveryMethod[]> => {
  const { data } = await apiUpcycle.get<ApiResponse<DeliveryMethod[]>>(BASE_PATH)
  return data.data
}

export const getDeliveryMethodById = async (id: number): Promise<DeliveryMethod> => {
  const { data } = await apiUpcycle.get<ApiResponse<DeliveryMethod>>(`${BASE_PATH}/${id}`)
  return data.data
}

export const createDeliveryMethod = async (
  payload: DeliveryMethodPayload,
): Promise<DeliveryMethod> => {
  const { data } = await apiUpcycle.post<ApiResponse<DeliveryMethod>>(BASE_PATH, payload)
  return data.data
}

export const updateDeliveryMethod = async (
  id: number,
  payload: DeliveryMethodPayload,
): Promise<DeliveryMethod> => {
  const { data } = await apiUpcycle.put<ApiResponse<DeliveryMethod>>(`${BASE_PATH}/${id}`, payload)
  return data.data
}

export const deleteDeliveryMethod = async (id: number): Promise<void> => {
  await apiUpcycle.delete(`${BASE_PATH}/${id}`)
}
