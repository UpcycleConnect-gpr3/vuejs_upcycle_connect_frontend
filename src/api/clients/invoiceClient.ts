import { upcycleApiClient } from '../axios'
import type { ApiResponse, Invoice } from '@/types'

export const getMyInvoices = async (): Promise<Invoice[]> => {
  const { data } = await upcycleApiClient.get<ApiResponse<Invoice[]>>('/invoices/me')
  return data.data
}

export const downloadInvoicePdf = async (ref: string): Promise<void> => {
  const response = await upcycleApiClient.get(`/invoices/${ref}/pdf`, {
    responseType: 'blob',
  })
  const url = URL.createObjectURL(response.data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${ref.replace(/_/g, '-').toUpperCase()}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
