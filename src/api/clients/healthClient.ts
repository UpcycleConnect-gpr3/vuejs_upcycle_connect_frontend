import { apiUpcycle } from '@/services/api'
import type { ApiResponse, HealthStatus } from '@/types'

export const getHealth = async (): Promise<HealthStatus> => {
  const { data } = await apiUpcycle.get<ApiResponse<HealthStatus>>('/health/')
  return data.data
}
