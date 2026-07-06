import { apiUpcycle } from '@/services/api'
import type { ApiResponse, OrderDeliveryMethod, OrderDeliveryMethodPayload } from '@/types'

const BASE_PATH = '/order-delivery-methods'

export const getOrderDeliveryMethods = async (): Promise<OrderDeliveryMethod[]> => {
  const { data } = await apiUpcycle.get<ApiResponse<OrderDeliveryMethod[]>>(BASE_PATH)
  return data.data
}

export const createOrderDeliveryMethod = async (
  payload: OrderDeliveryMethodPayload,
): Promise<OrderDeliveryMethod> => {
  const { data } = await apiUpcycle.post<ApiResponse<OrderDeliveryMethod>>(BASE_PATH, payload)
  return data.data
}

export const deleteOrderDeliveryMethod = async (
  orderId: string,
  deliveryMethodId: number,
): Promise<void> => {
  await apiUpcycle.delete(`${BASE_PATH}/${orderId}/${deliveryMethodId}`)
}
