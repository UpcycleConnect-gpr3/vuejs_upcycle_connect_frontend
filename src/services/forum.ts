import { apiForum } from '@/services/api'
import type { ApiResponse } from '@/types/api'

export interface ForumCategory {
  id: number
  name: string
  [key: string]: unknown
}

export interface Talk {
  id: number
  title: string
  description?: string
  type?: string
  status?: string
  author?: string
  created_at?: string
  [key: string]: unknown
}

export interface ForumMessage {
  id: number
  talk_id?: number
  content: string
  author?: string
  created_at?: string
  [key: string]: unknown
}

export const getCategories = async (): Promise<ForumCategory[]> => {
  const { data } = await apiForum.get<ApiResponse<ForumCategory[]>>('/categories/')
  return data.data
}

export const getTalks = async (): Promise<Talk[]> => {
  const { data } = await apiForum.get<ApiResponse<Talk[]>>('/talks/')
  return data.data
}

export const getTalk = async (id: number | string): Promise<Talk> => {
  const { data } = await apiForum.get<ApiResponse<Talk>>(`/talks/${id}/`)
  return data.data
}

export const createTalk = async (payload: Record<string, unknown>): Promise<Talk> => {
  const { data } = await apiForum.post<ApiResponse<Talk>>('/talks/', payload)
  return data.data
}

export const getTalkMessages = async (id: number | string): Promise<ForumMessage[]> => {
  const { data } = await apiForum.get<ApiResponse<ForumMessage[]>>(`/talks/${id}/messages/`)
  return data.data
}

export const createTalkMessage = async (
  id: number | string,
  payload: Record<string, unknown>,
): Promise<ForumMessage> => {
  const { data } = await apiForum.post<ApiResponse<ForumMessage>>(`/talks/${id}/messages/`, payload)
  return data.data
}
