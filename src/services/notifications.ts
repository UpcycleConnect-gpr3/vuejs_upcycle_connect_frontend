import { apiUpcycle } from '@/services/api'
import type { ApiResponse } from '@/types/api'

export interface Notification {
  id: number
  user_id: string
  title: string
  body: string
  is_read: boolean
  created_at: string
}

export const getMyNotifications = async (): Promise<Notification[]> => {
  const { data } = await apiUpcycle.get<ApiResponse<Notification[]>>('/notifications/me')
  return data.data
}

export const markNotificationRead = async (id: number): Promise<void> => {
  await apiUpcycle.post(`/notifications/${id}/read`)
}
