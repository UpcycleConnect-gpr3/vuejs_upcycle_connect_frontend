import { apiForum } from '@/services/api'
import type {
  ApiResponse,
  Talk,
  TalkCreatePayload,
  TalkMessage,
  TalkUpdatePayload,
  UserRef,
} from '@/types'

// Backend forum : chaque chemin doit se terminer par `/` (matcher Go 1.22 {$}).
const BASE_PATH = '/talks'

export const getTalks = async (): Promise<Talk[]> => {
  const { data } = await apiForum.get<ApiResponse<Talk[]>>(`${BASE_PATH}/`)
  return data.data
}

export const createTalk = async (payload: TalkCreatePayload): Promise<Talk> => {
  const { data } = await apiForum.post<ApiResponse<Talk>>(`${BASE_PATH}/`, payload)
  return data.data
}

// La mise à jour n'accepte que { title, status }.
export const updateTalk = async (id: number, payload: TalkUpdatePayload): Promise<Talk> => {
  const { data } = await apiForum.put<ApiResponse<Talk>>(`${BASE_PATH}/${id}/`, payload)
  return data.data
}

export const deleteTalk = async (id: number): Promise<void> => {
  await apiForum.delete(`${BASE_PATH}/${id}/`)
}

// --- Sous-ressources ---

export const getTalkMessages = async (id: number): Promise<TalkMessage[]> => {
  const { data } = await apiForum.get<ApiResponse<TalkMessage[]>>(`${BASE_PATH}/${id}/messages/`)
  return data.data
}

export const getTalkUsers = async (id: number): Promise<UserRef[]> => {
  const { data } = await apiForum.get<ApiResponse<UserRef[]>>(`${BASE_PATH}/${id}/users/`)
  return data.data
}
