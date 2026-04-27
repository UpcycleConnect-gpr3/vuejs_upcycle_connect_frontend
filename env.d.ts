/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_URL: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_COOKIE_DOMAIN: string
  readonly VITE_COOKIE_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
