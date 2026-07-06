import { forumApiClient } from '../axios'
import type {
  ApiResponse,
  Talk,
  TalkCreatePayload,
  TalkMessage,
  TalkUpdatePayload,
  UserRef,
} from '@/types'

const BASE_PATH = '/talks'

export const getTalks = async (): Promise<Talk[]> => {
  const { data } = await forumApiClient.get<ApiResponse<Talk[]>>(`${BASE_PATH}/`)
  return data.data
}

export const createTalk = async (payload: TalkCreatePayload): Promise<Talk> => {
  const { data } = await forumApiClient.post<ApiResponse<Talk>>(`${BASE_PATH}/`, payload)
  return data.data
}

export const updateTalk = async (id: number, payload: TalkUpdatePayload): Promise<Talk> => {
  const { data } = await forumApiClient.put<ApiResponse<Talk>>(`${BASE_PATH}/${id}/`, payload)
  return data.data
}

export const deleteTalk = async (id: number): Promise<void> => {
  await forumApiClient.delete(`${BASE_PATH}/${id}/`)
}

export const getTalkMessages = async (id: number): Promise<TalkMessage[]> => {
  const { data } = await forumApiClient.get<ApiResponse<TalkMessage[]>>(
    `${BASE_PATH}/${id}/messages/`,
  )
  return data.data
}

export const getTalkUsers = async (id: number): Promise<UserRef[]> => {
  const { data } = await forumApiClient.get<ApiResponse<UserRef[]>>(`${BASE_PATH}/${id}/users/`)
  return data.data
}
