import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from '../App.vue'
import router from '../router'

describe('App', () => {
  it('mounts and renders properly', async () => {
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedstate)

    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
      },
    })

    await router.isReady()
    expect(wrapper.exists()).toBe(true)
  })
})
