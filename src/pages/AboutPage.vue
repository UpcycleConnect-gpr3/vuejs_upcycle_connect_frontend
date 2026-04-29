<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const team = [
  { name: 'Alex Dupont', role: 'CEO & Founder' },
  { name: 'Marie Laurent', role: 'CTO' },
  { name: 'Thomas Martin', role: 'Head of Product' },
  { name: 'Julie Bernard', role: 'Head of Community' },
]
</script>

<template>
  <AppHeader />

  <main>
    <section class="loose">
      <div class="container layout-flex layout-columns layout-items-center layout-gap-large">
        <span class="eyebrow">About us</span>
        <hgroup class="center">
          <h1 class="center">Every object has<br />a second life</h1>
          <p class="lead center measure" style="margin-inline: auto;">
            UpcycleConnect is the platform where designers, makers and companies turn waste into wonder.
          </p>
        </hgroup>
      </div>
    </section>

    <section>
      <div class="container">
        <div class="card grid-2" style="padding: 0; overflow: hidden;">
          <div class="image-placeholder" style="min-height: 420px; align-self: stretch;"></div>
          <div class="layout-flex layout-columns layout-gap-large" style="padding: var(--space-12);">
            <span class="eyebrow">Mission</span>
            <hgroup>
              <h2>Circular by design</h2>
              <p class="measure">
                Enable a truly circular economy by connecting people, products and knowledge. We want upcycling
                to be the default, not the exception.
              </p>
            </hgroup>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="container layout-flex layout-columns layout-items-center layout-gap-extra-large">
        <hgroup class="center">
          <span class="eyebrow">Team</span>
          <h2 class="center">Our Team</h2>
          <p class="center measure" style="margin-inline: auto;">
            Passionate people working toward the same goal.
          </p>
        </hgroup>
        <div class="grid-4" style="width: 100%">
          <article v-for="t in team" :key="t.name" class="card layout-flex layout-columns layout-items-center layout-gap-medium">
            <div class="image-placeholder" style="width: 100%; min-height: 200px;"></div>
            <hgroup class="center">
              <h5 class="center">{{ t.name }}</h5>
              <p class="small center muted">{{ t.role }}</p>
            </hgroup>
          </article>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>
