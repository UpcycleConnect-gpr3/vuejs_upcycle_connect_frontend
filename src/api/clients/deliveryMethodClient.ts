import { upcycleApiClient } from '../axios'
import type { ApiResponse, DeliveryMethod, DeliveryMethodPayload } from '@/types'

const BASE_PATH = '/delivery-methods'

export const getDeliveryMethods = async (): Promise<DeliveryMethod[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<DeliveryMethod[]>>(BASE_PATH)
  return data.data
}

export const getDeliveryMethodById = async (id: number): Promise<DeliveryMethod> => {
  const { data } = await upcycleApiClient.get<ApiResponse<DeliveryMethod>>(`${BASE_PATH}/${id}`)
  return data.data
}

export const createDeliveryMethod = async (
  payload: DeliveryMethodPayload,
): Promise<DeliveryMethod> => {
  const { data } = await upcycleApiClient.post<ApiResponse<DeliveryMethod>>(BASE_PATH, payload)
  return data.data
}

export const updateDeliveryMethod = async (
  id: number,
  payload: DeliveryMethodPayload,
): Promise<DeliveryMethod> => {
  const { data } = await upcycleApiClient.put<ApiResponse<DeliveryMethod>>(`${BASE_PATH}/${id}`, payload)
  return data.data
}

export const deleteDeliveryMethod = async (id: number): Promise<void> => {
  await upcycleApiClient.delete(`${BASE_PATH}/${id}`)
}
