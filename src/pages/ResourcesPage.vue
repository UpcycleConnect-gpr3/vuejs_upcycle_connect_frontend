<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { getTrainingContents } from '@/services/training'
import { useToastsStore } from '@/stores/toasts'

const toasts = useToastsStore()
const { t } = useI18n()

const resources = ref([
  {
    type: t('resourcesPage.types.guide'),
    title: t('resourcesPage.items.beginnerGuide.title'),
    date: t('resourcesPage.items.beginnerGuide.date'),
  },
  {
    type: t('resourcesPage.types.tutorial'),
    title: t('resourcesPage.items.furnitureTransform.title'),
    date: t('resourcesPage.items.furnitureTransform.date'),
  },
  {
    type: t('resourcesPage.types.case_study'),
    title: t('resourcesPage.items.caseStudyWaste.title'),
    date: t('resourcesPage.items.caseStudyWaste.date'),
  },
  {
    type: t('resourcesPage.types.report'),
    title: t('resourcesPage.items.circularEconomyReport.title'),
    date: t('resourcesPage.items.circularEconomyReport.date'),
  },
  {
    type: t('resourcesPage.types.guide'),
    title: t('resourcesPage.items.materialSourcing.title'),
    date: t('resourcesPage.items.materialSourcing.date'),
  },
  {
    type: t('resourcesPage.types.tutorial'),
    title: t('resourcesPage.items.sustainablePackaging.title'),
    date: t('resourcesPage.items.sustainablePackaging.date'),
  },
])

onMounted(async () => {
  try {
    const contents = await getTrainingContents()
    if (Array.isArray(contents) && contents.length) {
      resources.value = contents.map((c) => ({
        type: ((c.type as string) ?? 'GUIDE').toUpperCase(),
        title: (c.name as string) ?? t('resourcesPage.fallbackTitle'),
        date: '',
      }))
    }
  } catch {
    toasts.error(t('resourcesPage.error'))
  }
})
</script>

<template>
  <AppHeader />

  <main>
    <section class="loose">
      <div class="container layout-flex layout-columns layout-items-center layout-gap-large">
        <span class="eyebrow">{{ $t('resourcesPage.hero.eyebrow') }}</span>
        <hgroup class="center">
          <h1 class="center">{{ $t('resourcesPage.hero.title') }}</h1>
          <p class="lead center measure" style="margin-inline: auto">
            {{ $t('resourcesPage.hero.subtitle') }}
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
