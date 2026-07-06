<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useUiAuthModalStore } from '@/stores/uiAuthModal'

const ui = useUiAuthModalStore()

const services = [
  { title: 'Training incredible', imageLeft: true },
  { title: 'Workshop incredible', imageLeft: false },
  { title: 'Community incredible', imageLeft: true },
  { title: 'Marketplace incredible', imageLeft: false },
]
</script>

<template>
  <AppHeader />

  <main>
    <section class="loose">
      <div class="container layout-flex layout-columns layout-items-center layout-gap-large">
        <hgroup class="center">
          <h1 class="center secondary">A headline to make a big impact on visitors</h1>
          <p class="lead center measure" style="margin-inline: auto">
            Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum
            has been the industry's standard dummy text ever since the 1500s.
          </p>
        </hgroup>
        <div class="layout-flex layout-gap-medium">
          <button class="primary medium" @click="ui.open('register')">Get started</button>
          <button class="secondary medium">Learn more</button>
        </div>
      </div>
    </section>

    <section v-for="s in services" :key="s.title">
      <div class="container">
        <div class="card grid-2" style="padding: 0; overflow: hidden">
          <div
            v-if="s.imageLeft"
            class="image-placeholder"
            style="min-height: 420px; align-self: stretch"
          ></div>
          <div class="layout-flex layout-columns layout-gap-large" style="padding: var(--space-12)">
            <hgroup>
              <h2 class="secondary">{{ s.title }}</h2>
              <p class="measure">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
                Ipsum has been the industry's standard dummy text ever since the 1500s, when an
                unknown printer took a galley of type and scrambled it to make a type specimen book.
              </p>
            </hgroup>
            <div class="layout-flex layout-gap-medium">
              <button class="primary medium" @click="ui.open('register')">Get started</button>
              <button class="secondary medium">Learn more</button>
            </div>
          </div>
          <div
            v-if="!s.imageLeft"
            class="image-placeholder"
            style="min-height: 420px; align-self: stretch"
          ></div>
        </div>
      </div>
    </section>

    <section>
      <div class="container">
        <div
          class="card layout-flex layout-columns layout-items-center layout-gap-large"
          style="padding: var(--space-16); text-align: center"
        >
          <span class="eyebrow">Ready ?</span>
          <h2 class="center secondary">Ready to get started ?</h2>
          <p class="lead center measure" style="margin-inline: auto">
            Join thousands of users already building a circular future.
          </p>
          <div class="layout-flex layout-gap-medium">
            <button class="primary large" @click="ui.open('register')">Get started</button>
            <RouterLink to="/pricing" class="secondary large">See pricing</RouterLink>
          </div>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>
