import { upcycleApiClient } from '../axios'
import type { ApiResponse, Appointment, AppointmentPayload } from '@/types'

const BASE_PATH = '/appointments'

export const getAppointments = async (): Promise<Appointment[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<Appointment[]>>(BASE_PATH)
  return data.data
}

export const createAppointment = async (payload: AppointmentPayload): Promise<Appointment> => {
  const { data } = await upcycleApiClient.post<ApiResponse<Appointment>>(BASE_PATH, payload)
  return data.data
}

export const updateAppointment = async (
  id: number,
  payload: AppointmentPayload,
): Promise<Appointment> => {
  const { data } = await upcycleApiClient.put<ApiResponse<Appointment>>(
    `${BASE_PATH}/${id}`,
    payload,
  )
  return data.data
}

export const deleteAppointment = async (id: number): Promise<void> => {
  await upcycleApiClient.delete(`${BASE_PATH}/${id}`)
}
