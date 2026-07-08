import { upcycleApiClient } from '../axios'
import type { Ad, AdPayload, ApiResponse } from '@/types'

const BASE_PATH = '/ads'

export const getAds = async (): Promise<Ad[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<Ad[]>>(BASE_PATH)
  return data.data
}

export const createAd = async (payload: AdPayload): Promise<{ id: number }> => {
  const { data } = await upcycleApiClient.post<ApiResponse<{ id: number }>>(BASE_PATH, payload)
  return data.data
}

export const updateAd = async (id: number, payload: AdPayload): Promise<void> => {
  await upcycleApiClient.put(`${BASE_PATH}/${id}`, payload)
}

export const deleteAd = async (id: number): Promise<void> => {
  await upcycleApiClient.delete(`${BASE_PATH}/${id}`)
}
