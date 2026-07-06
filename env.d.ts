/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_URL: string
  readonly VITE_FORUM_URL: string
  readonly VITE_TRAINING_URL: string
  readonly VITE_UPCYCLE_URL: string
  readonly VITE_COOKIE_DOMAIN: string
  readonly VITE_COOKIE_PATH: string
  readonly VITE_BILLING_URL: string
  readonly VITE_STRIPE_PRICE_BASIC: string
  readonly VITE_STRIPE_PRICE_BUSINESS: string
  readonly VITE_STRIPE_PAYMENT_LINK_TRAINING: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
