import { apiForum } from '@/services/api'
import type { ApiResponse, ForumCategory, ForumCategoryPayload } from '@/types'

// Backend forum : chaque chemin doit se terminer par `/` (matcher Go 1.22 {$}).
const BASE_PATH = '/categories'

export const getCategories = async (): Promise<ForumCategory[]> => {
  const { data } = await apiForum.get<ApiResponse<ForumCategory[]>>(`${BASE_PATH}/`)
  return data.data
}

export const createCategory = async (payload: ForumCategoryPayload): Promise<ForumCategory> => {
  const { data } = await apiForum.post<ApiResponse<ForumCategory>>(`${BASE_PATH}/`, payload)
  return data.data
}

// Champs partiels acceptés en mise à jour.
export const updateCategory = async (
  id: number,
  payload: Partial<ForumCategoryPayload>,
): Promise<ForumCategory> => {
  const { data } = await apiForum.put<ApiResponse<ForumCategory>>(`${BASE_PATH}/${id}/`, payload)
  return data.data
}

export const deleteCategory = async (id: number): Promise<void> => {
  await apiForum.delete(`${BASE_PATH}/${id}/`)
}
