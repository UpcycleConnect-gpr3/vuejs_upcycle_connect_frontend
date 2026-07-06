import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { computed, ref } from 'vue'
import {
  createConversation,
  getContacts,
  getConversationMessages,
  getConversations,
  sendConversationMessage,
} from '@/api/clients/conversationClient'
import { useApi } from '@/composables/useApi'
import type { Conversation, ConversationMessage, ConversationUser } from '@/types'

export const useConversationStore = defineStore(
  'conversation',
  () => {
    const conversations = ref<Conversation[]>([])
    const contacts = ref<ConversationUser[]>([])
    const messages = ref<ConversationMessage[]>([])
    const currentConversationId = ref<number | null>(null)
    const { isLoading, error, request } = useApi()

    const currentConversation = computed(
      () => conversations.value.find((c) => c.id === currentConversationId.value) ?? null,
    )

    const fetchConversations = async () => {
      const data = await request(getConversations, 'Impossible de charger les conversations')
      if (data) conversations.value = data
    }

    const fetchContacts = async () => {
      const data = await request(getContacts, 'Impossible de charger les utilisateurs')
      if (data) contacts.value = data
    }

    const openConversation = async (id: number) => {
      currentConversationId.value = id
      messages.value = []
      const data = await request(
        () => getConversationMessages(id),
        'Impossible de charger les messages',
      )
      if (data) messages.value = data
    }

    const refreshCurrentMessages = async () => {
      const id = currentConversationId.value
      if (!id) return
      try {
        const data = await getConversationMessages(id)
        if (currentConversationId.value === id) messages.value = data
      } catch {
        return
      }
    }

    const startConversation = async (userId: string) => {
      const data = await request(
        () => createConversation(userId),
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
      if (!id) return null
      const data = await request(
        () => sendConversationMessage(id, content),
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
