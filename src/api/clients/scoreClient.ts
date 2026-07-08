import { upcycleApiClient } from '../axios'
import type { ApiResponse, ScoreConfig } from '@/types'

export const getScoreConfig = async (): Promise<ScoreConfig> => {
  const { data } = await upcycleApiClient.get<ApiResponse<ScoreConfig>>('/score/config')
  return data.data
}
