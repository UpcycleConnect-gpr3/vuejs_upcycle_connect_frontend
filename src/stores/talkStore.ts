import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import {
  createTalk,
  deleteTalk,
  getTalkMessages,
  getTalks,
  getTalkUsers,
  updateTalk,
} from '@/api/clients/talkClient'
import { useApi } from '@/composables/useApi'
import type { Talk, TalkCreatePayload, TalkMessage, TalkUpdatePayload, UserRef } from '@/types'

export const useTalkStore = defineStore(
  'talk',
  () => {
    const talks = ref<Talk[]>([])
    // Sous-ressources du talk consulté (GET /talks/{id}/messages/ et /users/)
    const currentTalkMessages = ref<TalkMessage[]>([])
    const currentTalkUsers = ref<UserRef[]>([])
    const { isLoading, error, request } = useApi()

    const fetchTalks = async () => {
      const data = await request(getTalks, 'Impossible de charger les discussions')
      if (data) talks.value = data
    }

    const addTalk = async (payload: TalkCreatePayload) => {
      const data = await request(() => createTalk(payload), 'Impossible de créer la discussion')
      if (data) talks.value.push(data)
      return data
    }

    const editTalk = async (id: number, payload: TalkUpdatePayload) => {
      const data = await request(
        () => updateTalk(id, payload),
        'Impossible de modifier la discussion',
      )
      if (data) {
        const index = talks.value.findIndex((t) => t.id === id)
        if (index !== -1) talks.value[index] = data
      }
      return data
    }

    const removeTalk = async (id: number) => {
      const result = await request(
        () => deleteTalk(id).then(() => true),
        'Impossible de supprimer la discussion',
      )
      if (result) talks.value = talks.value.filter((t) => t.id !== id)
    }

    const fetchTalkMessages = async (id: number) => {
      const data = await request(() => getTalkMessages(id), 'Impossible de charger les messages')
      if (data) currentTalkMessages.value = data
    }

    const fetchTalkUsers = async (id: number) => {
      const data = await request(() => getTalkUsers(id), 'Impossible de charger les membres')
      if (data) currentTalkUsers.value = data
    }

    const getTalkFromStore = (id: number): Talk | undefined => talks.value.find((t) => t.id === id)

    return {
      talks,
      currentTalkMessages,
      currentTalkUsers,
      isLoading,
      error,
      fetchTalks,
      addTalk,
      editTalk,
      removeTalk,
      fetchTalkMessages,
      fetchTalkUsers,
      getTalkFromStore,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['talks'],
    },
  },
)
