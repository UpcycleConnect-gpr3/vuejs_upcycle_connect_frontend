import { forumApiClient } from '../axios'
import type { ApiResponse, ForumEvent, ForumEventPayload } from '@/types'

// Backend forum : chaque chemin doit se terminer par `/` (matcher Go 1.22 {$}).
// Modèle distinct des événements du backend upcycle (voir eventClient.ts) :
// ici le backend n'expose que { id, title, date }.
const BASE_PATH = '/events'

export const getForumEvents = async (): Promise<ForumEvent[]> => {
  const { data } = await forumApiClient.get<ApiResponse<ForumEvent[]>>(`${BASE_PATH}/`)
  return data.data
}

export const createForumEvent = async (payload: ForumEventPayload): Promise<ForumEvent> => {
  const { data } = await forumApiClient.post<ApiResponse<ForumEvent>>(`${BASE_PATH}/`, payload)
  return data.data
}

// Champs partiels acceptés en mise à jour.
export const updateForumEvent = async (
  id: number,
  payload: Partial<ForumEventPayload>,
): Promise<ForumEvent> => {
  const { data } = await forumApiClient.put<ApiResponse<ForumEvent>>(`${BASE_PATH}/${id}/`, payload)
  return data.data
}

export const deleteForumEvent = async (id: number): Promise<void> => {
  await forumApiClient.delete(`${BASE_PATH}/${id}/`)
}
