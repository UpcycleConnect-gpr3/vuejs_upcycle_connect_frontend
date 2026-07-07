import { forumApiClient } from '../axios'
import type {
  ApiResponse,
  Conversation,
  ConversationMessage,
  ConversationUser,
  ForumCategory,
  Talk,
} from '@/types'

const PRIVATE_CATEGORY_NAME = 'private'

let privateCategoryId: number | null = null

const getPrivateCategoryId = async (): Promise<number> => {
  if (privateCategoryId) return privateCategoryId
  const { data } = await forumApiClient.get<ApiResponse<ForumCategory[]>>('/categories/')
  const existing = data.data.find((c) => c.name === PRIVATE_CATEGORY_NAME)
  if (existing) {
    privateCategoryId = existing.id
    return existing.id
  }
  await forumApiClient.post('/categories/', {
    name: PRIVATE_CATEGORY_NAME,
    description: 'Discussions privées entre membres',
  })
  const { data: refreshed } = await forumApiClient.get<ApiResponse<ForumCategory[]>>('/categories/')
  const created = refreshed.data.find((c) => c.name === PRIVATE_CATEGORY_NAME)
  if (!created) throw new Error('Catégorie privée introuvable')
  privateCategoryId = created.id
  return created.id
}

export const ssoLogin = async (profile: {
  username?: string
  firstname?: string
  lastname?: string
  email?: string
}): Promise<void> => {
  await forumApiClient.post('/auth/sso-login/', profile)
}

const getTalkUsers = async (talkId: number): Promise<ConversationUser[]> => {
  const { data } = await forumApiClient.get<ApiResponse<ConversationUser[]>>(
    `/talks/${talkId}/users/`,
  )
  return data.data
}

export const getConversations = async (userId: string): Promise<Conversation[]> => {
  const categoryId = await getPrivateCategoryId()
  const { data } = await forumApiClient.get<ApiResponse<Talk[]>>('/talks/', {
    params: { limit: 100 },
  })
  const privateTalks = data.data.filter((t) => (t as { category_id?: number }).category_id === categoryId)
  const conversations: Conversation[] = []
  for (const talk of privateTalks) {
    const users = await getTalkUsers(talk.id)
    if (users.some((u) => u.id === userId)) {
      conversations.push({
        id: talk.id,
        title: talk.title,
        created_at: String(talk.created_at ?? ''),
        updated_at: String(talk.updated_at ?? ''),
        users,
      })
    }
  }
  return conversations
}

export const createConversation = async (
  meId: string,
  otherId: string,
  title: string,
): Promise<Conversation> => {
  const existing = (await getConversations(meId)).find((c) =>
    c.users.some((u) => u.id === otherId),
  )
  if (existing) return existing

  const categoryId = await getPrivateCategoryId()
  const { data } = await forumApiClient.post<ApiResponse<Talk>>('/talks/', {
    title,
    content: '__private__',
    category_id: categoryId,
  })
  const talkId = data.data.id
  await forumApiClient.post(`/talks/${talkId}/users/`, { user_id: meId })
  await forumApiClient.post(`/talks/${talkId}/users/`, { user_id: otherId })
  const users = await getTalkUsers(talkId)
  return {
    id: talkId,
    title,
    created_at: String(data.data.created_at ?? ''),
    updated_at: String(data.data.updated_at ?? ''),
    users,
  }
}

export const getConversationMessages = async (
  talkId: number,
  meId: string,
): Promise<ConversationMessage[]> => {
  const [{ data: thread }, { data: mine }] = await Promise.all([
    forumApiClient.get<ApiResponse<{ id: number; content: string; created_at: string }[]>>(
      `/talks/${talkId}/messages/`,
    ),
    forumApiClient.get<ApiResponse<{ id: number }[]>>(`/users/${meId}/messages/`),
  ])
  const myIds = new Set(mine.data.map((m) => m.id))
  return thread.data.map((m) => ({
    id: m.id,
    conversation_id: talkId,
    user_id: myIds.has(m.id) ? meId : '',
    content: m.content,
    created_at: String(m.created_at ?? ''),
  }))
}

export const sendConversationMessage = async (
  talkId: number,
  meId: string,
  content: string,
): Promise<ConversationMessage> => {
  const { data } = await forumApiClient.post<ApiResponse<{ id: number; content: string; created_at: string }>>(
    '/messages/',
    { content },
  )
  const message = data.data
  await forumApiClient.post(`/talks/${talkId}/messages/`, { message_id: message.id })
  await forumApiClient.post(`/messages/${message.id}/users/`, { user_id: meId })
  return {
    id: message.id,
    conversation_id: talkId,
    user_id: meId,
    content: message.content,
    created_at: String(message.created_at ?? ''),
  }
}

export const getContacts = async (): Promise<ConversationUser[]> => {
  const { data } = await forumApiClient.get<ApiResponse<ConversationUser[]>>('/users/')
  return data.data
}
