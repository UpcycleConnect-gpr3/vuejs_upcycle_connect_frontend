import { apiBilling } from '@/services/api'
import type { ApiResponse } from '@/types/api'

export interface CheckoutSession {
  // Hosted Stripe Checkout URL to redirect the browser to.
  url: string
}

export interface CheckoutStatus {
  // Mirrors Stripe's payment/subscription state once the webhook has landed.
  status: 'paid' | 'pending' | 'unpaid' | 'failed'
  customer_email?: string
}

/**
 * Asks the backend to create a Stripe Checkout Session for a subscription and
 * returns the hosted URL to redirect to. The backend holds the Stripe secret
 * key — it never touches the frontend. The success/cancel URLs are passed so
 * the backend can hand them to Stripe (it may also override them server-side).
 */
export const createSubscriptionCheckout = async (priceId: string): Promise<CheckoutSession> => {
  const { data } = await apiBilling.post<ApiResponse<CheckoutSession>>(
    '/billing/checkout-session',
    {
      price_id: priceId,
      mode: 'subscription',
      // {CHECKOUT_SESSION_ID} is a Stripe placeholder — keep it literal.
      success_url: `${window.location.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/pricing?checkout=canceled`,
    },
  )
  return data.data
}

/**
 * Reads the persisted result of a checkout session. The webhook is the source
 * of truth for "paid"; this lets the success page reflect the real DB state.
 */
export const getCheckoutStatus = async (sessionId: string): Promise<CheckoutStatus> => {
  const { data } = await apiBilling.get<ApiResponse<CheckoutStatus>>(
    `/billing/checkout-session/${sessionId}`,
  )
  return data.data
}
