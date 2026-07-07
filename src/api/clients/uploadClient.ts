import { upcycleApiClient } from '../axios'
import type { ApiResponse } from '@/types'

export const uploadImage = async (file: File): Promise<string> => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await upcycleApiClient.post<ApiResponse<{ path: string }>>('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data.path
}
