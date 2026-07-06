import { apiBilling } from '@/services/api'
import type { ApiResponse } from '@/types/api'

export interface CheckoutSession {
  url: string
}

export interface CheckoutStatus {
  status: 'paid' | 'pending' | 'unpaid' | 'failed'
  customer_email?: string
}

export const createSubscriptionCheckout = async (priceId: string): Promise<CheckoutSession> => {
  const { data } = await apiBilling.post<ApiResponse<CheckoutSession>>(
    '/billing/checkout-session',
    {
      price_id: priceId,
      mode: 'subscription',
      success_url: `${window.location.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/pricing?checkout=canceled`,
    },
  )
  return data.data
}

export const getCheckoutStatus = async (sessionId: string): Promise<CheckoutStatus> => {
  const { data } = await apiBilling.get<ApiResponse<CheckoutStatus>>(
    `/billing/checkout-session/${sessionId}`,
  )
  return data.data
}
