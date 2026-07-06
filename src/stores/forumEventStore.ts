import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import {
  createForumEvent,
  deleteForumEvent,
  getForumEvents,
  updateForumEvent,
} from '@/api/clients/forumEventClient'
import { useApi } from '@/composables/useApi'
import type { ForumEvent, ForumEventPayload } from '@/types'

// Événements du backend forum ({ id, title, date }) — distincts des
// événements du backend upcycle gérés par useEventStore.
export const useForumEventStore = defineStore(
  'forumEvent',
  () => {
    const events = ref<ForumEvent[]>([])
    const { isLoading, error, request } = useApi()

    const fetchEvents = async () => {
      const data = await request(getForumEvents, 'Impossible de charger les événements')
      if (data) events.value = data
    }

    const addEvent = async (payload: ForumEventPayload) => {
      const data = await request(() => createForumEvent(payload), "Impossible de créer l'événement")
      if (data) events.value.push(data)
      return data
    }

    const editEvent = async (id: number, payload: Partial<ForumEventPayload>) => {
      const data = await request(
        () => updateForumEvent(id, payload),
        "Impossible de modifier l'événement",
      )
      if (data) {
        const index = events.value.findIndex((e) => e.id === id)
        if (index !== -1) events.value[index] = data
      }
      return data
    }

    const removeEvent = async (id: number) => {
      const result = await request(
        () => deleteForumEvent(id).then(() => true),
        "Impossible de supprimer l'événement",
      )
      if (result) events.value = events.value.filter((e) => e.id !== id)
    }

    const getEventFromStore = (id: number): ForumEvent | undefined =>
      events.value.find((e) => e.id === id)

    return {
      events,
      isLoading,
      error,
      fetchEvents,
      addEvent,
      editEvent,
      removeEvent,
      getEventFromStore,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['events'],
    },
  },
)
