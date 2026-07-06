import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import { createStep, deleteStep, getStepById, getSteps, updateStep } from '@/api/clients/stepClient'
import { useApi } from '@/composables/useApi'
import type { Step, StepPayload } from '@/types'

export const useStepStore = defineStore(
  'step',
  () => {
    const steps = ref<Step[]>([])
    const currentStep = ref<Step | null>(null)
    const { isLoading, error, request } = useApi()

    const fetchSteps = async () => {
      const data = await request(getSteps, 'Impossible de charger les étapes')
      if (data) steps.value = data
    }

    const fetchStepById = async (id: string) => {
      const data = await request(() => getStepById(id), "Impossible de charger l'étape")
      if (data) currentStep.value = data
    }

    const addStep = async (payload: StepPayload) => {
      const data = await request(() => createStep(payload), "Impossible de créer l'étape")
      if (data) steps.value.push(data)
      return data
    }

    const editStep = async (id: string, payload: StepPayload) => {
      const data = await request(() => updateStep(id, payload), "Impossible de modifier l'étape")
      if (data) {
        const index = steps.value.findIndex((s) => s.id === id)
        if (index !== -1) steps.value[index] = data
        if (currentStep.value?.id === id) currentStep.value = data
      }
      return data
    }

    const removeStep = async (id: string) => {
      const result = await request(
        () => deleteStep(id).then(() => true),
        "Impossible de supprimer l'étape",
      )
      if (result) {
        steps.value = steps.value.filter((s) => s.id !== id)
        if (currentStep.value?.id === id) currentStep.value = null
      }
    }

    const getStepFromStore = (id: string): Step | undefined => steps.value.find((s) => s.id === id)

    return {
      steps,
      currentStep,
      isLoading,
      error,
      fetchSteps,
      fetchStepById,
      addStep,
      editStep,
      removeStep,
      getStepFromStore,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['steps', 'currentStep'],
    },
  },
)
