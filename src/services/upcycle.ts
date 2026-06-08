import { apiUpcycle } from '@/services/api'
import type { ApiResponse } from '@/types/api'

export interface UpcycleObject {
  id: number
  title?: string
  name?: string
  category?: string
  price?: number | null
  status?: string
  [key: string]: unknown
}

export interface Order {
  id: number | string
  street?: string
  city?: string
  zip_code?: string
  user_id?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export interface Package {
  id: number | string
  reference?: string
  code?: string | null
  status?: string
  [key: string]: unknown
}

export interface EventStep {
  id: number | string
  title?: string
  start_at?: string
  [key: string]: unknown
}

export interface ScoreResult {
  score?: number
  [key: string]: unknown
}

export const getObjects = async (): Promise<UpcycleObject[]> => {
  const { data } = await apiUpcycle.get<ApiResponse<UpcycleObject[]>>('/objects')
  return data.data
}

export const getObject = async (id: number | string): Promise<UpcycleObject> => {
  const { data } = await apiUpcycle.get<ApiResponse<UpcycleObject>>(`/objects/${id}`)
  return data.data
}

export const createObject = async (payload: Record<string, unknown>): Promise<UpcycleObject> => {
  const { data } = await apiUpcycle.post<ApiResponse<UpcycleObject>>('/objects', payload)
  return data.data
}

export const getObjectScore = async (id: number | string): Promise<ScoreResult> => {
  const { data } = await apiUpcycle.get<ApiResponse<ScoreResult>>(`/objects/${id}/score`)
  return data.data
}

export const getObjectDeliveryMethods = async (id: number | string): Promise<unknown[]> => {
  const { data } = await apiUpcycle.get<ApiResponse<unknown[]>>(`/objects/${id}/delivery-methods`)
  return data.data
}

export const getProjects = async (): Promise<unknown[]> => {
  const { data } = await apiUpcycle.get<ApiResponse<unknown[]>>('/projects')
  return data.data
}

export const getOrders = async (): Promise<Order[]> => {
  const { data } = await apiUpcycle.get<ApiResponse<Order[]>>('/orders')
  return data.data
}

export const createOrder = async (payload: Record<string, unknown>): Promise<Order> => {
  const { data } = await apiUpcycle.post<ApiResponse<Order>>('/orders', payload)
  return data.data
}

export const getPackages = async (): Promise<Package[]> => {
  const { data } = await apiUpcycle.get<ApiResponse<Package[]>>('/packages')
  return data.data
}

export const createPackage = async (payload: Record<string, unknown>): Promise<Package> => {
  const { data } = await apiUpcycle.post<ApiResponse<Package>>('/packages', payload)
  return data.data
}

export const getEventSteps = async (): Promise<EventStep[]> => {
  const { data } = await apiUpcycle.get<ApiResponse<EventStep[]>>('/event-steps')
  return data.data
}
