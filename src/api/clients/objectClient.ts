import { upcycleApiClient } from '../axios'
import type {
  ApiResponse,
  DeliveryMethodRef,
  ObjectPayload,
  ObjectScore,
  ObjectUpdatePayload,
  ProjectRef,
  UpcycleObject,
  UserRef,
} from '@/types'

const BASE_PATH = '/objects'

export const getObjects = async (): Promise<UpcycleObject[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<UpcycleObject[]>>(BASE_PATH)
  return data.data
}

export const getObjectById = async (id: string): Promise<UpcycleObject> => {
  const { data } = await upcycleApiClient.get<ApiResponse<UpcycleObject>>(`${BASE_PATH}/${id}`)
  return data.data
}

export const createObject = async (payload: ObjectPayload): Promise<UpcycleObject> => {
  const { data } = await upcycleApiClient.post<ApiResponse<UpcycleObject>>(BASE_PATH, payload)
  return data.data
}

export const updateObject = async (
  id: string,
  payload: ObjectUpdatePayload,
): Promise<UpcycleObject> => {
  const { data } = await upcycleApiClient.put<ApiResponse<UpcycleObject>>(
    `${BASE_PATH}/${id}`,
    payload,
  )
  return data.data
}

export const deleteObject = async (id: string): Promise<void> => {
  await upcycleApiClient.delete(`${BASE_PATH}/${id}`)
}

export const getObjectScore = async (id: string): Promise<ObjectScore> => {
  const { data } = await upcycleApiClient.get<ApiResponse<ObjectScore>>(`${BASE_PATH}/${id}/score`)
  return data.data
}

export const getObjectDeliveryMethods = async (id: string): Promise<DeliveryMethodRef[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<DeliveryMethodRef[]>>(
    `${BASE_PATH}/${id}/delivery-methods`,
  )
  return data.data
}

export const addObjectDeliveryMethod = async (
  id: string,
  deliveryMethodId: number,
): Promise<void> => {
  await upcycleApiClient.post(`${BASE_PATH}/${id}/delivery-methods/${deliveryMethodId}`)
}

export const removeObjectDeliveryMethod = async (
  id: string,
  deliveryMethodId: number,
): Promise<void> => {
  await upcycleApiClient.delete(`${BASE_PATH}/${id}/delivery-methods/${deliveryMethodId}`)
}

export const getObjectProjects = async (id: string): Promise<ProjectRef[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<ProjectRef[]>>(
    `${BASE_PATH}/${id}/projects`,
  )
  return data.data
}

export const addObjectProject = async (id: string, projectId: number): Promise<void> => {
  await upcycleApiClient.post(`${BASE_PATH}/${id}/projects/${projectId}`)
}

export const removeObjectProject = async (id: string, projectId: number): Promise<void> => {
  await upcycleApiClient.delete(`${BASE_PATH}/${id}/projects/${projectId}`)
}

export const getObjectUsers = async (id: string): Promise<UserRef[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<UserRef[]>>(`${BASE_PATH}/${id}/users`)
  return data.data
}

export const addObjectUser = async (id: string, userId: string): Promise<void> => {
  await upcycleApiClient.post(`${BASE_PATH}/${id}/users/${userId}`)
}

export const removeObjectUser = async (id: string, userId: string): Promise<void> => {
  await upcycleApiClient.delete(`${BASE_PATH}/${id}/users/${userId}`)
}
