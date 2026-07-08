import { upcycleApiClient } from '../axios'
import type { ApiResponse, Subscription, UserStats } from '@/types'

export const getMyStats = async (): Promise<UserStats> => {
  const { data } = await upcycleApiClient.get<ApiResponse<UserStats>>('/stats/me')
  return data.data
}

export const getMySubscription = async (): Promise<Subscription | null> => {
  const { data } = await upcycleApiClient.get<ApiResponse<Subscription | null>>('/subscriptions/me')
  return data.data
}
