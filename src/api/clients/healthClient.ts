import { upcycleApiClient } from '../axios'
import type { ApiResponse, HealthStatus } from '@/types'

export const getHealth = async (): Promise<HealthStatus> => {
  const { data } = await upcycleApiClient.get<ApiResponse<HealthStatus>>('/health/')
  return data.data
}
