import { upcycleApiClient } from '../axios'
import type { ApiResponse, Locker, LockerPayload } from '@/types'

const BASE_PATH = '/lockers'

export const getLockers = async (): Promise<Locker[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<Locker[]>>(BASE_PATH)
  return data.data
}

export const getLockerById = async (id: string): Promise<Locker> => {
  const { data } = await upcycleApiClient.get<ApiResponse<Locker>>(`${BASE_PATH}/${id}`)
  return data.data
}

export const createLocker = async (payload: LockerPayload): Promise<Locker> => {
  const { data } = await upcycleApiClient.post<ApiResponse<Locker>>(BASE_PATH, payload)
  return data.data
}

export const updateLocker = async (id: string, payload: LockerPayload): Promise<Locker> => {
  const { data } = await upcycleApiClient.put<ApiResponse<Locker>>(`${BASE_PATH}/${id}`, payload)
  return data.data
}

export const deleteLocker = async (id: string): Promise<void> => {
  await upcycleApiClient.delete(`${BASE_PATH}/${id}`)
}
