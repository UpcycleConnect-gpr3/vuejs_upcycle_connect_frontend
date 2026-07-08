import { upcycleApiClient } from '../axios'
import type { ApiResponse, ObjectOrder, ObjectOrderPayload } from '@/types'

const BASE_PATH = '/object-orders'

export const getObjectOrders = async (): Promise<ObjectOrder[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<ObjectOrder[]>>(BASE_PATH)
  return data.data
}

export const getObjectOrderById = async (id: number): Promise<ObjectOrder> => {
  const { data } = await upcycleApiClient.get<ApiResponse<ObjectOrder>>(`${BASE_PATH}/${id}`)
  return data.data
}

export const createObjectOrder = async (payload: ObjectOrderPayload): Promise<ObjectOrder> => {
  const { data } = await upcycleApiClient.post<ApiResponse<ObjectOrder>>(BASE_PATH, payload)
  return data.data
}

export const deleteObjectOrder = async (id: number): Promise<void> => {
  await upcycleApiClient.delete(`${BASE_PATH}/${id}`)
}
