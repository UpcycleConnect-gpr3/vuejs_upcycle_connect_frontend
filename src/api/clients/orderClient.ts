import { upcycleApiClient } from '../axios'
import type { ApiResponse, Order, OrderPayload } from '@/types'

const BASE_PATH = '/orders'

export const getOrders = async (): Promise<Order[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<Order[]>>(BASE_PATH)
  return data.data
}

export const getOrderById = async (id: string): Promise<Order> => {
  const { data } = await upcycleApiClient.get<ApiResponse<Order>>(`${BASE_PATH}/${id}`)
  return data.data
}

export const createOrder = async (payload: OrderPayload): Promise<Order> => {
  const { data } = await upcycleApiClient.post<ApiResponse<Order>>(BASE_PATH, payload)
  return data.data
}

export const updateOrder = async (id: string, payload: OrderPayload): Promise<Order> => {
  const { data } = await upcycleApiClient.put<ApiResponse<Order>>(`${BASE_PATH}/${id}`, payload)
  return data.data
}

export const deleteOrder = async (id: string): Promise<void> => {
  await upcycleApiClient.delete(`${BASE_PATH}/${id}`)
}
