import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import {
  createEventStep,
  deleteEventStep,
  getEventStepById,
  getEventSteps,
  updateEventStep,
} from '@/api/clients/eventStepClient'
import { useApi } from '@/composables/useApi'
import type { EventStep, EventStepPayload, EventStepUpdatePayload } from '@/types'

export const useEventStepStore = defineStore(
  'eventStep',
  () => {
    const eventSteps = ref<EventStep[]>([])
    const currentEventStep = ref<EventStep | null>(null)
    const { isLoading, error, request } = useApi()

    const fetchEventSteps = async () => {
      const data = await request(getEventSteps, "Impossible de charger les étapes d'événement")
      if (data) eventSteps.value = data
    }

    const fetchEventStepById = async (id: number) => {
      const data = await request(() => getEventStepById(id), "Impossible de charger l'étape")
      if (data) currentEventStep.value = data
    }

    const addEventStep = async (payload: EventStepPayload) => {
      const data = await request(() => createEventStep(payload), "Impossible de créer l'étape")
      if (data) eventSteps.value.push(data)
      return data
    }

    const editEventStep = async (id: number, payload: EventStepUpdatePayload) => {
      const data = await request(
        () => updateEventStep(id, payload),
        "Impossible de modifier l'étape",
      )
      if (data) {
        const index = eventSteps.value.findIndex((s) => s.id === id)
        if (index !== -1) eventSteps.value[index] = data
        if (currentEventStep.value?.id === id) currentEventStep.value = data
      }
      return data
    }

    const removeEventStep = async (id: number) => {
      const result = await request(
        () => deleteEventStep(id).then(() => true),
        "Impossible de supprimer l'étape",
      )
      if (result) {
        eventSteps.value = eventSteps.value.filter((s) => s.id !== id)
        if (currentEventStep.value?.id === id) currentEventStep.value = null
      }
    }

    const getEventStepFromStore = (id: number): EventStep | undefined =>
      eventSteps.value.find((s) => s.id === id)

    return {
      eventSteps,
      currentEventStep,
      isLoading,
      error,
      fetchEventSteps,
      fetchEventStepById,
      addEventStep,
      editEventStep,
      removeEventStep,
      getEventStepFromStore,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['eventSteps', 'currentEventStep'],
    },
  },
)
