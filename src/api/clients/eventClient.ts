import { upcycleApiClient } from '../axios'
import type { ApiResponse, EventPayload, EventStep, StepSummary, UpcycleEvent } from '@/types'

const BASE_PATH = '/events'

export const getEvents = async (): Promise<UpcycleEvent[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<UpcycleEvent[]>>(BASE_PATH)
  return data.data
}

export const getEventById = async (id: number): Promise<UpcycleEvent> => {
  const { data } = await upcycleApiClient.get<ApiResponse<UpcycleEvent>>(`${BASE_PATH}/${id}`)
  return data.data
}

export const createEvent = async (payload: EventPayload): Promise<UpcycleEvent> => {
  const { data } = await upcycleApiClient.post<ApiResponse<UpcycleEvent>>(BASE_PATH, payload)
  return data.data
}

export const updateEvent = async (id: number, payload: EventPayload): Promise<UpcycleEvent> => {
  const { data } = await upcycleApiClient.put<ApiResponse<UpcycleEvent>>(
    `${BASE_PATH}/${id}`,
    payload,
  )
  return data.data
}

export const deleteEvent = async (id: number): Promise<void> => {
  await upcycleApiClient.delete(`${BASE_PATH}/${id}`)
}

export const getEventSteps = async (id: number): Promise<StepSummary[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<StepSummary[]>>(
    `${BASE_PATH}/${id}/steps`,
  )
  return data.data
}

export const createEventStep = async (
  id: number,
  payload: Omit<EventStep, 'id' | 'event_id' | 'created_at' | 'updated_at'>,
): Promise<EventStep> => {
  const { data } = await upcycleApiClient.post<ApiResponse<EventStep>>(
    `${BASE_PATH}/${id}/steps`,
    payload,
  )
  return data.data
}
