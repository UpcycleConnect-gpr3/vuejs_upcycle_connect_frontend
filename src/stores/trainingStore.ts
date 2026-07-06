import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import {
  createTraining,
  deleteTraining,
  getTrainingContent,
  getTrainingCurricula,
  getTrainings,
  getTrainingSchedules,
  updateTraining,
} from '@/api/clients/trainingClient'
import { useApi } from '@/composables/useApi'
import type {
  Training,
  TrainingContentRef,
  TrainingCurriculum,
  TrainingPayload,
  TrainingSchedule,
} from '@/types'

export const useTrainingStore = defineStore(
  'training',
  () => {
    const trainings = ref<Training[]>([])
    // Sous-ressources de la formation consultée (GET /trainings/{id}/*)
    const currentTrainingCurricula = ref<TrainingCurriculum[]>([])
    const currentTrainingContent = ref<TrainingContentRef[]>([])
    const currentTrainingSchedules = ref<TrainingSchedule[]>([])
    const { isLoading, error, request } = useApi()

    const fetchTrainings = async () => {
      const data = await request(getTrainings, 'Impossible de charger les formations')
      if (data) trainings.value = data
    }

    const addTraining = async (payload: TrainingPayload) => {
      const data = await request(() => createTraining(payload), 'Impossible de créer la formation')
      if (data) trainings.value.push(data)
      return data
    }

    const editTraining = async (id: number, payload: Partial<TrainingPayload>) => {
      const data = await request(
        () => updateTraining(id, payload),
        'Impossible de modifier la formation',
      )
      if (data) {
        const index = trainings.value.findIndex((t) => t.id === id)
        if (index !== -1) trainings.value[index] = data
      }
      return data
    }

    const removeTraining = async (id: number) => {
      const result = await request(
        () => deleteTraining(id).then(() => true),
        'Impossible de supprimer la formation',
      )
      if (result) trainings.value = trainings.value.filter((t) => t.id !== id)
    }

    const fetchTrainingCurricula = async (id: number) => {
      const data = await request(
        () => getTrainingCurricula(id),
        'Impossible de charger les curricula',
      )
      if (data) currentTrainingCurricula.value = data
    }

    const fetchTrainingContent = async (id: number) => {
      const data = await request(() => getTrainingContent(id), 'Impossible de charger le contenu')
      if (data) currentTrainingContent.value = data
    }

    const fetchTrainingSchedules = async (id: number) => {
      const data = await request(
        () => getTrainingSchedules(id),
        'Impossible de charger les créneaux',
      )
      if (data) currentTrainingSchedules.value = data
    }

    const getTrainingFromStore = (id: number): Training | undefined =>
      trainings.value.find((t) => t.id === id)

    return {
      trainings,
      currentTrainingCurricula,
      currentTrainingContent,
      currentTrainingSchedules,
      isLoading,
      error,
      fetchTrainings,
      addTraining,
      editTraining,
      removeTraining,
      fetchTrainingCurricula,
      fetchTrainingContent,
      fetchTrainingSchedules,
      getTrainingFromStore,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['trainings'],
    },
  },
)
