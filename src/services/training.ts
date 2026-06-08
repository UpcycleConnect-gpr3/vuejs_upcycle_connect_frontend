import { apiTraining } from '@/services/api'
import type { ApiResponse } from '@/types/api'

export interface Training {
  id: number
  name?: string
  type?: string
  duration?: string
  location?: string
  mode_of_delivery?: string
  target_audience?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export interface Schedule {
  id: number
  title: string
  day_number: number
  duration?: string
  description?: string
  content?: string
  is_practical?: boolean
  resources_required?: string
  order_position?: number
  training_id?: number
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export interface TrainingContent {
  id: number
  type?: string
  name?: string
  content?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export const getTrainings = async (): Promise<Training[]> => {
  const { data } = await apiTraining.get<ApiResponse<Training[]>>('/trainings/')
  return data.data
}

export const getTraining = async (id: number | string): Promise<Training> => {
  const { data } = await apiTraining.get<ApiResponse<Training>>(`/trainings/${id}/`)
  return data.data
}

export const getTrainingSchedules = async (id: number | string): Promise<Schedule[]> => {
  const { data } = await apiTraining.get<ApiResponse<Schedule[]>>(`/trainings/${id}/schedules/`)
  return data.data
}

export const getSchedules = async (): Promise<Schedule[]> => {
  const { data } = await apiTraining.get<ApiResponse<Schedule[]>>('/schedules/')
  return data.data
}

export const getTrainingContents = async (): Promise<TrainingContent[]> => {
  const { data } = await apiTraining.get<ApiResponse<TrainingContent[]>>('/training-content/')
  return data.data
}

export const getTrainingContent = async (id: number | string): Promise<TrainingContent> => {
  const { data } = await apiTraining.get<ApiResponse<TrainingContent>>(`/training-content/${id}/`)
  return data.data
}
