<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

interface Step {
  selector: string | null
  title: string
  description: string
}

const steps: Step[] = [
  {
    selector: null,
    title: 'Bienvenue sur UpcycleConnect ',
    description:
      'Visite express en 5 étapes pour prendre vos repères. Vous pouvez passer à tout moment.',
  },
  {
    selector: '[data-tour="listings"]',
    title: 'Vos annonces',
    description:
      'Déposez une annonce de don ou de vente. Elles passent en validation rapide par notre équipe.',
  },
  {
    selector: '[data-tour="deposits"]',
    title: 'Dépôt conteneur',
    description:
      'Demandez un dépôt en conteneur. Une fois validé, vous recevez un code et un QR pour le retrait.',
  },
  {
    selector: '[data-tour="catalog"]',
    title: 'Catalogue',
    description: 'Parcourez les services, formations et événements achetables ou réservables.',
  },
  {
    selector: '[data-tour="score"]',
    title: 'Upcycling Score',
    description:
      'Suivez votre impact circulaire et débloquez des badges au fil de vos contributions.',
  },
]

const visible = ref(false)
const stepIdx = ref(0)
const target = ref<{ top: number; left: number; width: number; height: number } | null>(null)

const current = computed(() => steps[stepIdx.value] as Step)
const isLast = computed(() => stepIdx.value === steps.length - 1)

async function updateTarget() {
  await nextTick()
  const sel = current.value.selector
  if (!sel) {
    target.value = null
    return
  }
  const el = document.querySelector(sel) as HTMLElement | null
  if (!el) {
    target.value = null
    return
  }
  const r = el.getBoundingClientRect()
  target.value = { top: r.top, left: r.left, width: r.width, height: r.height }
}

function next() {
  if (isLast.value) finish()
  else {
    stepIdx.value++
    updateTarget()
  }
}

function prev() {
  if (stepIdx.value > 0) stepIdx.value--
  updateTarget()
}

function finish() {
  visible.value = false
  localStorage.setItem('uc_onboarded', 'true')
}

function start() {
  stepIdx.value = 0
  visible.value = true
  updateTarget()
}

defineExpose({ start })

onMounted(() => {
  if (localStorage.getItem('uc_onboarded') !== 'true') {
    setTimeout(() => start(), 300)
  }
  window.addEventListener('resize', updateTarget)
  window.addEventListener('scroll', updateTarget, true)
})

const spotStyle = computed(() => {
  if (!target.value) return {}
  const pad = 8
  return {
    top: `${target.value.top - pad}px`,
    left: `${target.value.left - pad}px`,
    width: `${target.value.width + pad * 2}px`,
    height: `${target.value.height + pad * 2}px`,
  }
})

const tooltipStyle = computed(() => {
  if (!target.value) {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }
  return {
    top: `${target.value.top + target.value.height + 16}px`,
    left: `${Math.min(target.value.left, window.innerWidth - 380)}px`,
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="onboarding">
      <div v-if="visible" class="onboarding-overlay">
        <div v-if="target" class="onboarding-spot" :style="spotStyle"></div>
        <div class="onboarding-tooltip" :style="tooltipStyle">
          <div class="onboarding-step">{{ stepIdx + 1 }} / {{ steps.length }}</div>
          <h4>{{ current.title }}</h4>
          <p>{{ current.description }}</p>
          <div class="onboarding-actions">
            <button class="ghost small" @click="finish">Passer</button>
            <div class="layout-flex layout-gap-small">
              <button v-if="stepIdx > 0" class="ghost small" @click="prev"> Précédent</button>
              <button class="primary small" @click="next">
                {{ isLast ? 'Terminer' : 'Suivant ' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
