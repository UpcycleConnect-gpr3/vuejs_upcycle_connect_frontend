import { forumApiClient } from '../axios'
import type { ApiResponse, ForumCategory, ForumCategoryPayload } from '@/types'

const BASE_PATH = '/categories'

export const getCategories = async (): Promise<ForumCategory[]> => {
  const { data } = await forumApiClient.get<ApiResponse<ForumCategory[]>>(`${BASE_PATH}/`)
  return data.data
}

export const createCategory = async (payload: ForumCategoryPayload): Promise<ForumCategory> => {
  const { data } = await forumApiClient.post<ApiResponse<ForumCategory>>(`${BASE_PATH}/`, payload)
  return data.data
}

export const updateCategory = async (
  id: number,
  payload: Partial<ForumCategoryPayload>,
): Promise<ForumCategory> => {
  const { data } = await forumApiClient.put<ApiResponse<ForumCategory>>(
    `${BASE_PATH}/${id}/`,
    payload,
  )
  return data.data
}

export const deleteCategory = async (id: number): Promise<void> => {
  await forumApiClient.delete(`${BASE_PATH}/${id}/`)
}
