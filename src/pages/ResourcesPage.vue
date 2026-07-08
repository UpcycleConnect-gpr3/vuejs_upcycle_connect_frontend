<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { getTrainingContents } from '@/services/training'
import { useToastsStore } from '@/stores/toasts'

const toasts = useToastsStore()

const resources = ref([
  { type: 'GUIDE', title: "Beginner's guide to upcycling", date: '28 Février 2026' },
  { type: 'TUTORIAL', title: 'Transform old furniture in 5 steps', date: '12 Mars 2026' },
  { type: 'CASE STUDY', title: 'How Company X reduced waste by 80%', date: '20 Mars 2026' },
  { type: 'REPORT', title: 'State of the circular economy 2026', date: '1 Avril 2026' },
  { type: 'GUIDE', title: 'Sustainable material sourcing', date: '8 Avril 2026' },
  { type: 'TUTORIAL', title: "Packaging that doesn't cost the earth", date: '15 Avril 2026' },
])

onMounted(async () => {
  try {
    const contents = await getTrainingContents()
    if (Array.isArray(contents) && contents.length) {
      resources.value = contents.map((c) => ({
        type: ((c.type as string) ?? 'GUIDE').toUpperCase(),
        title: (c.name as string) ?? 'Ressource',
        date: '',
      }))
    }
  } catch {
    toasts.error('Ressources indisponibles, affichage des données de démonstration.')
  }
})
</script>

<template>
  <AppHeader />

  <main>
    <section class="loose">
      <div class="container layout-flex layout-columns layout-items-center layout-gap-large">
        <span class="eyebrow">Resources</span>
        <hgroup class="center">
          <h1 class="center">Guides, tutorials &amp; reports</h1>
          <p class="lead center measure" style="margin-inline: auto">
            Curated knowledge from the UpcycleConnect community, ready to apply.
          </p>
        </hgroup>
      </div>
    </section>

    <section>
      <div class="container">
        <div class="grid-3 layout-items-stretch">
          <article
            v-for="r in resources"
            :key="r.title"
            class="card layout-flex layout-columns layout-gap-large"
          >
            <div class="image-placeholder"></div>
            <div class="layout-flex layout-gap-small layout-items-center">
              <span class="badge">{{ r.type }}</span>
              <span class="small muted">· {{ r.date }}</span>
            </div>
            <h4>{{ r.title }}</h4>
          </article>
        </div>
      </div>
    </section>
  </main>

  <AppFooter />
</template>
