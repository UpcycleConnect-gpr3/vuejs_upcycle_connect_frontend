<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'

const route = useRoute()
const router = useRouter()

// Mock detail
const item = ref({
  id: Number(route.params.id),
  kind: 'training' as const,
  title: 'Initiation à l\'upcycling — Niveau 1',
  description: 'Workshop d\'introduction sur 3h pour découvrir les bases de l\'upcycling : matériaux, outils, techniques fondamentales.',
  category: 'Débutant',
  price: 35,
  duration: '3h',
  location: 'Atelier Paris 11',
  trainer: 'Marie L.',
  longText: 'Cette formation s\'adresse à toutes les personnes qui souhaitent débuter dans l\'upcycling. Vous découvrirez les outils essentiels, apprendrez les techniques de base de ponçage et de finition, et repartirez avec un petit objet que vous aurez transformé.\n\nLe matériel est fourni. Apportez juste vos vêtements de travail.',
  slots: [
    { id: 1, date: '2026-05-12 14:00', spotsLeft: 4, capacity: 12 },
    { id: 2, date: '2026-05-19 14:00', spotsLeft: 8, capacity: 12 },
    { id: 3, date: '2026-06-02 10:00', spotsLeft: 12, capacity: 12 },
  ],
})

const selectedSlot = ref<number | null>(item.value.slots[0]?.id ?? null)
const showCheckout = ref(false)

const slot = computed(() => item.value.slots.find((s) => s.id === selectedSlot.value))

const card = reactive({
  number: '',
  expiry: '',
  cvc: '',
  name: '',
})

const isProcessing = ref(false)
const isPaid = ref(false)

async function pay() {
  isProcessing.value = true
  setTimeout(() => {
    isProcessing.value = false
    isPaid.value = true
  }, 1200)
}

function close() {
  showCheckout.value = false
  if (isPaid.value) router.push('/dashboard/planning')
}
</script>

<template>
  <DashboardLayout>
    <RouterLink to="/dashboard/catalog" class="ghost" style="align-self: flex-start;">← Retour au catalogue</RouterLink>

    <article class="catalog-detail">
      <div class="catalog-detail-image"></div>

      <div class="catalog-detail-body">
        <div class="layout-flex layout-gap-small layout-items-center">
          <span class="badge">Formation</span>
          <span class="badge">{{ item.category }}</span>
        </div>
        <h1>{{ item.title }}</h1>
        <p class="lead muted measure">{{ item.description }}</p>

        <div class="catalog-detail-meta">
          <div><span class="tiny uppercase muted">Durée</span><span>{{ item.duration }}</span></div>
          <div><span class="tiny uppercase muted">Lieu</span><span>{{ item.location }}</span></div>
          <div><span class="tiny uppercase muted">Formateur</span><span>{{ item.trainer }}</span></div>
        </div>

        <h3 style="margin-top: var(--space-5);">Description</h3>
        <p v-for="(p, i) in item.longText.split('\n\n')" :key="i" style="white-space: pre-wrap;">{{ p }}</p>

        <h3 style="margin-top: var(--space-8);">Choisissez votre créneau</h3>
        <div class="slots-grid">
          <button
            v-for="s in item.slots"
            :key="s.id"
            class="slot-card"
            :class="{ active: selectedSlot === s.id, disabled: s.spotsLeft === 0 }"
            :disabled="s.spotsLeft === 0"
            @click="selectedSlot = s.id"
          >
            <span style="font-weight: 700;">{{ s.date }}</span>
            <span class="tiny muted">{{ s.spotsLeft }} / {{ s.capacity }} places</span>
          </button>
        </div>
      </div>

      <aside class="catalog-detail-cta">
        <div v-if="item.price === 0" class="text-secondary" style="font-size: var(--font-size-xxlarge); font-weight: 900;">Gratuit</div>
        <div v-else class="mono" style="font-size: var(--font-size-xxxlarge); font-weight: 900; line-height: 1;">{{ item.price }}€</div>
        <p class="small muted">par participant</p>
        <button class="primary medium full-width" :disabled="!selectedSlot" @click="showCheckout = true">
          {{ item.price === 0 ? 'Réserver gratuitement' : 'Réserver ma place' }}
        </button>
        <p class="tiny muted center">Annulation gratuite jusqu'à 48h avant.</p>
      </aside>
    </article>

    <!-- Checkout modal -->
    <AppModal :open="showCheckout" :title="isPaid ? '' : 'Paiement sécurisé'" @close="close">
      <div v-if="!isPaid" class="layout-flex layout-columns layout-gap-large">
        <div class="checkout-summary">
          <div class="layout-flex layout-justify-between">
            <span class="muted">{{ item.title }}</span>
            <span class="mono">{{ item.price }}€</span>
          </div>
          <div class="layout-flex layout-justify-between tiny muted">
            <span>{{ slot?.date }}</span>
            <span>{{ item.location }}</span>
          </div>
          <div class="divider"></div>
          <div class="layout-flex layout-justify-between" style="font-weight: 700;">
            <span>Total</span>
            <span class="mono">{{ item.price }}€</span>
          </div>
        </div>

        <form class="layout-flex layout-columns layout-gap-medium" @submit.prevent="pay">
          <div class="form-group">
            <label class="uppercase">Numéro de carte</label>
            <input v-model="card.number" type="text" class="primary medium full-width" placeholder="4242 4242 4242 4242" />
          </div>
          <div class="layout-flex layout-gap-medium">
            <div class="form-group" style="flex: 1;">
              <label class="uppercase">Expiration</label>
              <input v-model="card.expiry" type="text" class="primary medium full-width" placeholder="MM / AA" />
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="uppercase">CVC</label>
              <input v-model="card.cvc" type="text" class="primary medium full-width" placeholder="123" />
            </div>
          </div>
          <div class="form-group">
            <label class="uppercase">Nom sur la carte</label>
            <input v-model="card.name" type="text" class="primary medium full-width" placeholder="JEAN DUPONT" />
          </div>
        </form>
      </div>

      <div v-else class="layout-flex layout-columns layout-items-center layout-gap-large" style="padding: var(--space-8) 0;">
        <div class="success-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5L20 7"/></svg>
        </div>
        <h3 class="center">Réservation confirmée 🎉</h3>
        <p class="center muted measure">Un email de confirmation vient de vous être envoyé. La session a été ajoutée à votre planning.</p>
      </div>

      <template #footer>
        <button v-if="!isPaid" class="ghost medium" @click="close">Annuler</button>
        <button v-if="!isPaid" class="primary medium" :disabled="isProcessing" @click="pay">
          {{ isProcessing ? 'Traitement…' : `Payer ${item.price}€` }}
        </button>
        <button v-else class="primary medium" @click="close">Voir mon planning →</button>
      </template>
    </AppModal>
  </DashboardLayout>
</template>
