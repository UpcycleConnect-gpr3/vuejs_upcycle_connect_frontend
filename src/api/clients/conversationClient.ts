import { upcycleApiClient } from '../axios'
import type { ApiResponse, Conversation, ConversationMessage, ConversationUser } from '@/types'

const BASE_PATH = '/conversations'

export const getConversations = async (): Promise<Conversation[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<Conversation[]>>(BASE_PATH)
  return data.data
}

export const createConversation = async (userId: string): Promise<Conversation> => {
  const { data } = await upcycleApiClient.post<ApiResponse<Conversation>>(BASE_PATH, {
    user_id: userId,
  })
  return data.data
}

export const getConversationMessages = async (
  id: number,
  page = 1,
  limit = 50,
): Promise<ConversationMessage[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<ConversationMessage[]>>(
    `${BASE_PATH}/${id}/messages`,
    { params: { page, limit } },
  )
  return data.data
}

export const sendConversationMessage = async (
  id: number,
  content: string,
): Promise<ConversationMessage> => {
  const { data } = await upcycleApiClient.post<ApiResponse<ConversationMessage>>(
    `${BASE_PATH}/${id}/messages`,
    { content },
  )
  return data.data
}

export const getContacts = async (): Promise<ConversationUser[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<ConversationUser[]>>('/users')
  return data.data
}
