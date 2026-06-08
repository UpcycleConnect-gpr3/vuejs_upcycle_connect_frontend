<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const articles = [
  { title: 'Latest News on Upcycle Connect', date: '28 Février 2026' },
  { title: 'Designer Spotlight : Marie Laurent', date: '12 Mars 2026' },
  { title: 'Community milestone : 10k users', date: '20 Mars 2026' },
  { title: 'New partnerships announced', date: '1 Avril 2026' },
]
</script>

<template>
  <AppHeader />

  <main>
    <section>
      <div class="container">
        <div class="card grid-2" style="padding: 0; overflow: hidden">
          <div class="image-placeholder" style="min-height: 560px; align-self: stretch"></div>
          <div class="layout-flex layout-columns layout-gap-large" style="padding: var(--space-12)">
            <span class="eyebrow">Featured · 28 Février 2026</span>
            <hgroup>
              <h1>Bigger news on<br />Upcycle Connect</h1>
              <p class="lead measure">
                Major platform update, new partnerships, and community milestones. Here's everything
                that happened this month, and what's coming next.
              </p>
            </hgroup>
            <div class="layout-flex layout-gap-medium">
              <button class="primary medium">Read article</button>
              <button class="ghost medium">Share →</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="tight">
      <div class="container">
        <hr class="secondary" />
      </div>
    </section>

    <section>
      <div class="container layout-flex layout-columns layout-gap-extra-large">
        <hgroup>
          <span class="eyebrow">Latest news</span>
          <h2>From the community</h2>
        </hgroup>
        <div class="grid-2 layout-items-stretch">
          <article
            v-for="a in articles"
            :key="a.title"
            class="card layout-flex layout-columns layout-gap-large"
          >
            <div class="image-placeholder"></div>
            <span class="eyebrow">{{ a.date }}</span>
            <hgroup>
              <h3>{{ a.title }}</h3>
              <p class="measure">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
                Ipsum has been the industry's standard dummy text ever since the 1500s.
              </p>
            </hgroup>
          </article>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>
