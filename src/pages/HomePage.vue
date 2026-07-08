<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useUiAuthModalStore } from '@/stores/uiAuthModal'
import { useToastsStore } from '@/stores/toasts'

const ui = useUiAuthModalStore()
const toasts = useToastsStore()
const { t } = useI18n()

const onContact = () => {
  toasts.info(t('home.contact.form.disabled_notice'))
}

const features = [
  {
    titleKey: 'home.features.marketplace.title',
    descriptionKey: 'home.features.marketplace.description',
  },
  {
    titleKey: 'home.features.forum.title',
    descriptionKey: 'home.features.forum.description',
  },
  {
    titleKey: 'home.features.training.title',
    descriptionKey: 'home.features.training.description',
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
          <span class="eyebrow">{{ $t('home.whatWeDo.eyebrow') }}</span>
          <h2 class="center">{{ $t('home.whatWeDo.title') }}</h2>
        </hgroup>

        <div class="grid-3">
          <article
            v-for="(f, i) in features"
            :key="i"
            class="card accent-bar layout-flex layout-columns layout-gap-large"
          >
            <span class="eyebrow">0{{ i + 1 }}</span>
            <hgroup>
              <h4>{{ $t(f.titleKey) }}</h4>
              <p class="measure">{{ $t(f.descriptionKey) }}</p>
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
            <span class="eyebrow">{{ $t('home.spotlight.eyebrow') }}</span>
            <hgroup>
              <h2>{{ $t('home.spotlight.title_line1') }}<br />{{ $t('home.spotlight.title_line2') }}</h2>
              <p class="measure">
                {{ $t('home.spotlight.description') }}
              </p>
            </hgroup>
            <div class="layout-flex layout-gap-medium">
              <button class="primary medium" @click="ui.open('register')">
                {{ $t('home.spotlight.cta_primary') }}
              </button>
              <button class="ghost medium">{{ $t('home.spotlight.cta_secondary') }}</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="container layout-flex layout-columns layout-items-center layout-gap-extra-large">
        <hgroup class="center">
          <span class="eyebrow">{{ $t('home.partnership.eyebrow') }}</span>
          <h2 class="center">{{ $t('home.partnership.title') }}</h2>
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
            <span class="eyebrow">{{ $t('home.contact.eyebrow') }}</span>
            <hgroup>
              <h2>{{ $t('home.contact.title') }}</h2>
              <p class="measure">
                {{ $t('home.contact.description') }}
              </p>
            </hgroup>
            <form class="layout-flex layout-columns layout-gap-large" @submit.prevent="onContact">
              <div class="form-group">
                <label for="name">{{ $t('home.contact.form.name_label') }}</label>
                <input
                  id="name"
                  type="text"
                  class="primary medium full-width"
                  :placeholder="$t('home.contact.form.name_placeholder')"
                  disabled
                />
              </div>
              <div class="form-group">
                <label for="email">{{ $t('home.contact.form.email_label') }}</label>
                <input
                  id="email"
                  type="email"
                  class="primary medium full-width"
                  :placeholder="$t('home.contact.form.email_placeholder')"
                  disabled
                />
              </div>
              <div class="form-group">
                <label for="message">{{ $t('home.contact.form.message_label') }}</label>
                <textarea
                  id="message"
                  class="primary full-width"
                  :placeholder="$t('home.contact.form.message_placeholder')"
                  disabled
                ></textarea>
              </div>
              <button type="submit" class="primary medium" disabled>
                {{ $t('home.contact.form.submit') }}
              </button>
              <span class="tiny muted">{{ $t('home.contact.form.disabled_notice') }}</span>
            </form>
          </div>
          <div class="image-placeholder" style="align-self: stretch; min-height: 520px"></div>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>
