import { authApiClient } from '../axios'
import type { ApiResponse, User } from '@/types'

const BASE_PATH = '/user'

export const getUsers = async (): Promise<User[]> => {
  const { data } = await authApiClient.get<ApiResponse<User[]>>(`${BASE_PATH}/`)
  return data.data
}

export const getUserById = async (id: string): Promise<User> => {
  const { data } = await authApiClient.get<ApiResponse<User>>(`${BASE_PATH}/${id}/`)
  return data.data
}
