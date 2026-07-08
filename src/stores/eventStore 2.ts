import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import {
  createEvent,
  createEventStep,
  deleteEvent,
  getEventById,
  getEvents,
  getEventSteps,
  updateEvent,
} from '@/api/clients/eventClient'
import { useApi } from '@/composables/useApi'
import type { EventPayload, EventStep, StepSummary, UpcycleEvent } from '@/types'

export const useEventStore = defineStore(
  'event',
  () => {
    const events = ref<UpcycleEvent[]>([])
    const currentEvent = ref<UpcycleEvent | null>(null)
    const currentEventSteps = ref<StepSummary[]>([])
    const { isLoading, error, request } = useApi()

    const fetchEvents = async () => {
      const data = await request(getEvents, 'Impossible de charger les événements')
      if (data) events.value = data
    }

    const fetchEventById = async (id: number) => {
      const data = await request(() => getEventById(id), "Impossible de charger l'événement")
      if (data) currentEvent.value = data
    }

    const addEvent = async (payload: EventPayload) => {
      const data = await request(() => createEvent(payload), "Impossible de créer l'événement")
      if (data) events.value.push(data)
      return data
    }

    const editEvent = async (id: number, payload: EventPayload) => {
      const data = await request(
        () => updateEvent(id, payload),
        "Impossible de modifier l'événement",
      )
      if (data) {
        const index = events.value.findIndex((e) => e.id === id)
        if (index !== -1) events.value[index] = data
        if (currentEvent.value?.id === id) currentEvent.value = data
      }
      return data
    }

    const removeEvent = async (id: number) => {
      const result = await request(
        () => deleteEvent(id).then(() => true),
        "Impossible de supprimer l'événement",
      )
      if (result) {
        events.value = events.value.filter((e) => e.id !== id)
        if (currentEvent.value?.id === id) currentEvent.value = null
      }
    }

    const fetchEventSteps = async (id: number) => {
      const data = await request(
        () => getEventSteps(id),
        "Impossible de charger les étapes de l'événement",
      )
      if (data) currentEventSteps.value = data
    }

    const addEventStep = async (
      id: number,
      payload: Omit<EventStep, 'id' | 'event_id' | 'created_at' | 'updated_at'>,
    ) => {
      const data = await request(
        () => createEventStep(id, payload),
        "Impossible d'ajouter une étape à l'événement",
      )
      if (data) currentEventSteps.value.push(data)
      return data
    }

    const getEventFromStore = (id: number): UpcycleEvent | undefined =>
      events.value.find((e) => e.id === id)

    return {
      events,
      currentEvent,
      currentEventSteps,
      isLoading,
      error,
      fetchEvents,
      fetchEventById,
      addEvent,
      editEvent,
      removeEvent,
      fetchEventSteps,
      addEventStep,
      getEventFromStore,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['events', 'currentEvent'],
    },
  },
)
