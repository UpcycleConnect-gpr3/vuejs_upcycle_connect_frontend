import { apiUpcycle } from '@/services/api'
import type { ApiResponse, Step, StepPayload } from '@/types'

const BASE_PATH = '/steps'

export const getSteps = async (): Promise<Step[]> => {
  const { data } = await apiUpcycle.get<ApiResponse<Step[]>>(BASE_PATH)
  return data.data
}

export const getStepById = async (id: string): Promise<Step> => {
  const { data } = await apiUpcycle.get<ApiResponse<Step>>(`${BASE_PATH}/${id}`)
  return data.data
}

export const createStep = async (payload: StepPayload): Promise<Step> => {
  const { data } = await apiUpcycle.post<ApiResponse<Step>>(BASE_PATH, payload)
  return data.data
}

export const updateStep = async (id: string, payload: StepPayload): Promise<Step> => {
  const { data } = await apiUpcycle.put<ApiResponse<Step>>(`${BASE_PATH}/${id}`, payload)
  return data.data
}

export const deleteStep = async (id: string): Promise<void> => {
  await apiUpcycle.delete(`${BASE_PATH}/${id}`)
}
