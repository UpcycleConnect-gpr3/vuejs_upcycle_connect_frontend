<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const team = [
  { name: 'Alex Dupont', roleKey: 'aboutPage.roles.ceoFounder' },
  { name: 'Marie Laurent', roleKey: 'aboutPage.roles.cto' },
  { name: 'Thomas Martin', roleKey: 'aboutPage.roles.headOfProduct' },
  { name: 'Julie Bernard', roleKey: 'aboutPage.roles.headOfCommunity' },
]
</script>

<template>
  <AppHeader />

  <main>
    <section class="loose">
      <div class="container layout-flex layout-columns layout-items-center layout-gap-large">
        <span class="eyebrow">{{ $t('aboutPage.hero.eyebrow') }}</span>
        <hgroup class="center">
          <h1 class="center">{{ $t('aboutPage.hero.title_line1') }}<br />{{ $t('aboutPage.hero.title_line2') }}</h1>
          <p class="lead center measure" style="margin-inline: auto">
            {{ $t('aboutPage.hero.subtitle') }}
          </p>
        </hgroup>
      </div>
    </section>

    <section>
      <div class="container">
        <div class="card grid-2" style="padding: 0; overflow: hidden">
          <div class="image-placeholder" style="min-height: 420px; align-self: stretch"></div>
          <div class="layout-flex layout-columns layout-gap-large" style="padding: var(--space-12)">
            <span class="eyebrow">{{ $t('aboutPage.mission.eyebrow') }}</span>
            <hgroup>
              <h2>{{ $t('aboutPage.mission.title') }}</h2>
              <p class="measure">
                {{ $t('aboutPage.mission.description') }}
              </p>
            </hgroup>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="container layout-flex layout-columns layout-items-center layout-gap-extra-large">
        <hgroup class="center">
          <span class="eyebrow">{{ $t('aboutPage.team.eyebrow') }}</span>
          <h2 class="center">{{ $t('aboutPage.team.title') }}</h2>
          <p class="center measure" style="margin-inline: auto">
            {{ $t('aboutPage.team.subtitle') }}
          </p>
        </hgroup>
        <div class="grid-4" style="width: 100%">
          <article
            v-for="member in team"
            :key="member.name"
            class="card layout-flex layout-columns layout-items-center layout-gap-medium"
          >
            <div class="image-placeholder" style="width: 100%; min-height: 200px"></div>
            <hgroup class="center">
              <h5 class="center">{{ member.name }}</h5>
              <p class="small center muted">{{ $t(member.roleKey) }}</p>
            </hgroup>
          </article>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>
