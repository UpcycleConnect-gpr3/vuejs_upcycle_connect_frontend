import { apiUpcycle } from '@/services/api'
import type { ApiResponse, EventStep, EventStepPayload, EventStepUpdatePayload } from '@/types'

const BASE_PATH = '/event-steps'

export const getEventSteps = async (): Promise<EventStep[]> => {
  const { data } = await apiUpcycle.get<ApiResponse<EventStep[]>>(BASE_PATH)
  return data.data
}

export const getEventStepById = async (id: number): Promise<EventStep> => {
  const { data } = await apiUpcycle.get<ApiResponse<EventStep>>(`${BASE_PATH}/${id}`)
  return data.data
}

export const createEventStep = async (payload: EventStepPayload): Promise<EventStep> => {
  const { data } = await apiUpcycle.post<ApiResponse<EventStep>>(BASE_PATH, payload)
  return data.data
}

export const updateEventStep = async (
  id: number,
  payload: EventStepUpdatePayload,
): Promise<EventStep> => {
  const { data } = await apiUpcycle.put<ApiResponse<EventStep>>(`${BASE_PATH}/${id}`, payload)
  return data.data
}

export const deleteEventStep = async (id: number): Promise<void> => {
  await apiUpcycle.delete(`${BASE_PATH}/${id}`)
}
