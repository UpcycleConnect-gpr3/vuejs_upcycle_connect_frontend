/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_URL: string
  readonly VITE_FORUM_URL: string
  readonly VITE_TRAINING_URL: string
  readonly VITE_UPCYCLE_URL: string
  readonly VITE_COOKIE_DOMAIN: string
  readonly VITE_COOKIE_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
