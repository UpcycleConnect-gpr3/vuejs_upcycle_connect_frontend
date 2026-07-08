<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useUiAuthModalStore } from '@/stores/uiAuthModal'
import { useToastsStore } from '@/stores/toasts'

const ui = useUiAuthModalStore()
const toasts = useToastsStore()

const onContact = () => {
  toasts.info('Le formulaire de contact sera bientôt disponible.')
}

const features = [
  {
    title: 'Upcycling marketplace',
    description: 'Transform waste into value through our curated marketplace.',
  },
  { title: 'Community forum', description: 'Connect with like-minded people and share ideas.' },
  {
    title: 'Training programs',
    description: 'Learn sustainable practices through expert-led courses.',
  },
]
</script>

<template>
  <AppHeader />

  <main>
    <section class="loose">
      <div class="container layout-flex layout-columns layout-items-center layout-gap-large">
        <span class="eyebrow">{{ $t('home.eyebrow') }}</span>
        <hgroup class="center">
          <h1 class="display center">{{ $t('home.title') }}</h1>
          <p class="lead center measure" style="margin-inline: auto">
            {{ $t('home.subtitle') }}
          </p>
        </hgroup>
        <div class="layout-flex layout-gap-medium">
          <button class="primary large" @click="ui.open('register')">
            {{ $t('home.cta_primary') }}
          </button>
          <button class="secondary large">{{ $t('home.cta_secondary') }}</button>
        </div>
      </div>
    </section>

    <section>
      <div class="container layout-flex layout-columns layout-gap-extra-large">
        <hgroup class="center">
          <span class="eyebrow">What we do</span>
          <h2 class="center">A complete circular toolkit</h2>
        </hgroup>

        <div class="grid-3">
          <article
            v-for="(f, i) in features"
            :key="i"
            class="card accent-bar layout-flex layout-columns layout-gap-large"
          >
            <span class="eyebrow">0{{ i + 1 }}</span>
            <hgroup>
              <h4>{{ f.title }}</h4>
              <p class="measure">{{ f.description }}</p>
            </hgroup>
          </article>
        </div>
      </div>
    </section>

    <section>
      <div class="container">
        <div class="card grid-2" style="padding: 0; overflow: hidden">
          <div class="image-placeholder" style="min-height: 420px; align-self: stretch"></div>
          <div class="layout-flex layout-columns layout-gap-large" style="padding: var(--space-12)">
            <span class="eyebrow">Spotlight</span>
            <hgroup>
              <h2>Built for the community,<br />by the community</h2>
              <p class="measure">
                Every feature of UpcycleConnect has been shaped by designers, craftspeople, and
                sustainability advocates. We're not just a platform — we're a movement.
              </p>
            </hgroup>
            <div class="layout-flex layout-gap-medium">
              <button class="primary medium" @click="ui.open('register')">Get started</button>
              <button class="ghost medium">Learn more →</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="container layout-flex layout-columns layout-items-center layout-gap-extra-large">
        <hgroup class="center">
          <span class="eyebrow">Partnership</span>
          <h2 class="center">Our trusted partners</h2>
        </hgroup>
        <div class="grid-3" style="width: 100%">
          <div v-for="i in 3" :key="i" class="image-placeholder" style="min-height: 160px"></div>
        </div>
      </div>
    </section>

    <section>
      <div class="container">
        <div class="card grid-2" style="padding: 0; overflow: hidden">
          <div class="layout-flex layout-columns layout-gap-large" style="padding: var(--space-12)">
            <span class="eyebrow">Contact</span>
            <hgroup>
              <h2>Let's talk</h2>
              <p class="measure">
                Questions, partnerships, or just want to say hi ? Drop us a note and we'll get back
                to you.
              </p>
            </hgroup>
            <form class="layout-flex layout-columns layout-gap-large" @submit.prevent="onContact">
              <div class="form-group">
                <label for="name">Name</label>
                <input
                  id="name"
                  type="text"
                  class="primary medium full-width"
                  placeholder="Your name"
                  disabled
                />
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input
                  id="email"
                  type="email"
                  class="primary medium full-width"
                  placeholder="you@example.com"
                  disabled
                />
              </div>
              <div class="form-group">
                <label for="message">Message</label>
                <textarea
                  id="message"
                  class="primary full-width"
                  placeholder="Type your message here..."
                  disabled
                ></textarea>
              </div>
              <button type="submit" class="primary medium" disabled>Send message</button>
              <span class="tiny muted">Le formulaire de contact sera bientôt disponible.</span>
            </form>
          </div>
          <div class="image-placeholder" style="align-self: stretch; min-height: 520px"></div>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>
