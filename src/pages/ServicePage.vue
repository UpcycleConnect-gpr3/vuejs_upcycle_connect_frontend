<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useUiAuthModalStore } from '@/stores/uiAuthModal'

const ui = useUiAuthModalStore()

const services = [
  { titleKey: 'servicePage.services.training.title', imageLeft: true },
  { titleKey: 'servicePage.services.workshop.title', imageLeft: false },
  { titleKey: 'servicePage.services.community.title', imageLeft: true },
  { titleKey: 'servicePage.services.marketplace.title', imageLeft: false },
]
</script>

<template>
  <AppHeader />

  <main>
    <section class="loose">
      <div class="container layout-flex layout-columns layout-items-center layout-gap-large">
        <hgroup class="center">
          <h1 class="center secondary">{{ $t('servicePage.hero.title') }}</h1>
          <p class="lead center measure" style="margin-inline: auto">
            {{ $t('servicePage.hero.subtitle') }}
          </p>
        </hgroup>
        <div class="layout-flex layout-gap-medium">
          <button class="primary medium" @click="ui.open('register')">
            {{ $t('servicePage.hero.cta_primary') }}
          </button>
          <button class="secondary medium">{{ $t('servicePage.hero.cta_secondary') }}</button>
        </div>
      </div>
    </section>

    <section v-for="s in services" :key="s.titleKey">
      <div class="container">
        <div class="card grid-2" style="padding: 0; overflow: hidden">
          <div
            v-if="s.imageLeft"
            class="image-placeholder"
            style="min-height: 420px; align-self: stretch"
          ></div>
          <div class="layout-flex layout-columns layout-gap-large" style="padding: var(--space-12)">
            <hgroup>
              <h2 class="secondary">{{ $t(s.titleKey) }}</h2>
              <p class="measure">
                {{ $t('servicePage.services.description') }}
              </p>
            </hgroup>
            <div class="layout-flex layout-gap-medium">
              <button class="primary medium" @click="ui.open('register')">
                {{ $t('servicePage.services.cta_primary') }}
              </button>
              <button class="secondary medium">{{ $t('servicePage.services.cta_secondary') }}</button>
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
          <span class="eyebrow">{{ $t('servicePage.cta.eyebrow') }}</span>
          <h2 class="center secondary">{{ $t('servicePage.cta.title') }}</h2>
          <p class="lead center measure" style="margin-inline: auto">
            {{ $t('servicePage.cta.subtitle') }}
          </p>
          <div class="layout-flex layout-gap-medium">
            <button class="primary large" @click="ui.open('register')">
              {{ $t('servicePage.cta.primary') }}
            </button>
            <RouterLink to="/pricing" class="secondary large">{{ $t('servicePage.cta.secondary') }}</RouterLink>
          </div>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>
