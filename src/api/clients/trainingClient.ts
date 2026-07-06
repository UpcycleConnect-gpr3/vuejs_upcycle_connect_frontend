import { trainingApiClient } from '../axios'
import type {
  ApiResponse,
  Training,
  TrainingContentRef,
  TrainingCurriculum,
  TrainingPayload,
  TrainingSchedule,
} from '@/types'

// Backend training : chaque chemin doit se terminer par `/` (matcher Go 1.22 {$}).
const BASE_PATH = '/trainings'

export const getTrainings = async (): Promise<Training[]> => {
  const { data } = await trainingApiClient.get<ApiResponse<Training[]>>(`${BASE_PATH}/`)
  return data.data
}

// Seul `name` est obligatoire.
export const createTraining = async (payload: TrainingPayload): Promise<Training> => {
  const { data } = await trainingApiClient.post<ApiResponse<Training>>(`${BASE_PATH}/`, payload)
  return data.data
}

// Champs partiels acceptés en mise à jour.
export const updateTraining = async (
  id: number,
  payload: Partial<TrainingPayload>,
): Promise<Training> => {
  const { data } = await trainingApiClient.put<ApiResponse<Training>>(`${BASE_PATH}/${id}/`, payload)
  return data.data
}

export const deleteTraining = async (id: number): Promise<void> => {
  await trainingApiClient.delete(`${BASE_PATH}/${id}/`)
}

// --- Sous-ressources ---

export const getTrainingCurricula = async (id: number): Promise<TrainingCurriculum[]> => {
  const { data } = await trainingApiClient.get<ApiResponse<TrainingCurriculum[]>>(
    `${BASE_PATH}/${id}/curricula/`,
  )
  return data.data
}

export const getTrainingContent = async (id: number): Promise<TrainingContentRef[]> => {
  const { data } = await trainingApiClient.get<ApiResponse<TrainingContentRef[]>>(
    `${BASE_PATH}/${id}/content/`,
  )
  return data.data
}

export const getTrainingSchedules = async (id: number): Promise<TrainingSchedule[]> => {
  const { data } = await trainingApiClient.get<ApiResponse<TrainingSchedule[]>>(
    `${BASE_PATH}/${id}/schedules/`,
  )
  return data.data
}
