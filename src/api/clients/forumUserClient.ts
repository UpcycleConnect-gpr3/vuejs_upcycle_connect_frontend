import { forumApiClient } from '../axios'
import type { ApiResponse, ForumUser, ForumUserUpdatePayload } from '@/types'

// Backend forum : chaque chemin doit se terminer par `/` (matcher Go 1.22 {$}).
const BASE_PATH = '/users'

export const getForumUsers = async (): Promise<ForumUser[]> => {
  const { data } = await forumApiClient.get<ApiResponse<ForumUser[]>>(`${BASE_PATH}/`)
  return data.data
}

export const getForumUserById = async (id: string): Promise<ForumUser> => {
  const { data } = await forumApiClient.get<ApiResponse<ForumUser>>(`${BASE_PATH}/${id}/`)
  return data.data
}

export const updateForumUser = async (
  id: string,
  payload: ForumUserUpdatePayload,
): Promise<ForumUser> => {
  const { data } = await forumApiClient.put<ApiResponse<ForumUser>>(`${BASE_PATH}/${id}/`, payload)
  return data.data
}

export const deleteForumUser = async (id: string): Promise<void> => {
  await forumApiClient.delete(`${BASE_PATH}/${id}/`)
}

// Pas de POST : le backend forum n'expose pas de création d'utilisateur.
