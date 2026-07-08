import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { computed, ref } from 'vue'
import {
  createConversation,
  getContacts,
  getConversationMessages,
  getConversations,
  sendConversationMessage,
  ssoLogin,
} from '@/api/clients/conversationClient'
import { useApi } from '@/composables/useApi'
import { useCurrentUser } from '@/composables/useCurrentUser'
import { useAuthStore } from '@/stores/authStore'
import type { Conversation, ConversationMessage, ConversationUser } from '@/types'

export const useConversationStore = defineStore(
  'conversation',
  () => {
    const auth = useAuthStore()
    const { currentUserId } = useCurrentUser()

    const conversations = ref<Conversation[]>([])
    const contacts = ref<ConversationUser[]>([])
    const messages = ref<ConversationMessage[]>([])
    const currentConversationId = ref<number | null>(null)
    const isProvisioned = ref(false)
    const { isLoading, error, request } = useApi()

    const currentConversation = computed(
      () => conversations.value.find((c) => c.id === currentConversationId.value) ?? null,
    )

    const ensureProvisioned = async () => {
      if (isProvisioned.value) return
      const email = auth.userEmail
      try {
        await ssoLogin({
          username: email ? email.split('@')[0] : '',
          email,
        })
        isProvisioned.value = true
      } catch {
        return
      }
    }

    const fetchConversations = async () => {
      const meId = currentUserId.value
      if (!meId) return
      await ensureProvisioned()
      const data = await request(
        () => getConversations(meId),
        'Impossible de charger les conversations',
      )
      if (data) conversations.value = data
    }

    const fetchContacts = async () => {
      await ensureProvisioned()
      const data = await request(getContacts, 'Impossible de charger les utilisateurs')
      if (data) contacts.value = data
    }

    const openConversation = async (id: number) => {
      const meId = currentUserId.value
      if (!meId) return
      currentConversationId.value = id
      messages.value = []
      const data = await request(
        () => getConversationMessages(id, meId),
        'Impossible de charger les messages',
      )
      if (data) messages.value = data
    }

    const refreshCurrentMessages = async () => {
      const id = currentConversationId.value
      const meId = currentUserId.value
      if (!id || !meId) return
      try {
        const data = await getConversationMessages(id, meId)
        if (currentConversationId.value === id) messages.value = data
      } catch {
        return
      }
    }

    const startConversation = async (userId: string, title = 'Discussion') => {
      const meId = currentUserId.value
      if (!meId) return null
      await ensureProvisioned()
      const data = await request(
        () => createConversation(meId, userId, title),
        'Impossible de créer la conversation',
      )
      if (data) {
        if (!conversations.value.some((c) => c.id === data.id)) {
          conversations.value.unshift(data)
        }
        await openConversation(data.id)
      }
      return data
    }

    const sendMessage = async (content: string) => {
      const id = currentConversationId.value
      const meId = currentUserId.value
      if (!id || !meId) return null
      const data = await request(
        () => sendConversationMessage(id, meId, content),
        "Impossible d'envoyer le message",
      )
      if (data) messages.value.push(data)
      return data
    }

    return {
      conversations,
      contacts,
      messages,
      currentConversationId,
      currentConversation,
      isLoading,
      error,
      fetchConversations,
      fetchContacts,
      openConversation,
      refreshCurrentMessages,
      startConversation,
      sendMessage,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['conversations'],
    },
  },
)
