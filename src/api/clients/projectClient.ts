import { upcycleApiClient } from '../axios'
import type {
  ApiResponse,
  ObjectRef,
  Project,
  ProjectPayload,
  Step,
  StepPayload,
  StepSummary,
} from '@/types'

const BASE_PATH = '/projects'

export const getProjects = async (): Promise<Project[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<Project[]>>(BASE_PATH)
  return data.data
}

export const getProjectById = async (id: number): Promise<Project> => {
  const { data } = await upcycleApiClient.get<ApiResponse<Project>>(`${BASE_PATH}/${id}`)
  return data.data
}

export const createProject = async (payload: ProjectPayload): Promise<Project> => {
  const { data } = await upcycleApiClient.post<ApiResponse<Project>>(BASE_PATH, payload)
  return data.data
}

export const updateProject = async (id: number, payload: ProjectPayload): Promise<Project> => {
  const { data } = await upcycleApiClient.put<ApiResponse<Project>>(`${BASE_PATH}/${id}`, payload)
  return data.data
}

export const deleteProject = async (id: number): Promise<void> => {
  await upcycleApiClient.delete(`${BASE_PATH}/${id}`)
}

export const getProjectObjects = async (id: number): Promise<ObjectRef[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<ObjectRef[]>>(
    `${BASE_PATH}/${id}/objects`,
  )
  return data.data
}

export const addProjectObject = async (id: number, objectId: string): Promise<void> => {
  await upcycleApiClient.post(`${BASE_PATH}/${id}/objects/${objectId}`)
}

export const getProjectSteps = async (id: number): Promise<StepSummary[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<StepSummary[]>>(
    `${BASE_PATH}/${id}/steps`,
  )
  return data.data
}

export const createProjectStep = async (id: number, payload: StepPayload): Promise<Step> => {
  const { data } = await upcycleApiClient.post<ApiResponse<Step>>(
    `${BASE_PATH}/${id}/steps`,
    payload,
  )
  return data.data
}
