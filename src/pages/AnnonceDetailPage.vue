<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useObjectStore } from '@/stores/objectStore'
import { useConversationStore } from '@/stores/conversationStore'
import { useCurrentUser } from '@/composables/useCurrentUser'
import { useToastsStore } from '@/stores/toasts'
import { createObjectPayment } from '@/services/billing'
import { getAvailableLockers } from '@/api/clients/depositClient'
import type { Locker } from '@/types'

const route = useRoute()
const router = useRouter()
const objectStore = useObjectStore()
const conversationStore = useConversationStore()
const toasts = useToastsStore()
const { currentObject, currentObjectDeliveryMethods, currentObjectUsers, isLoading, error } =
  storeToRefs(objectStore)
const { currentUserId } = useCurrentUser()
const { t } = useI18n()

const UPCYCLE_URL = import.meta.env.VITE_UPCYCLE_URL ?? 'http://localhost:4343'

const CATEGORY_LABELS: Record<string, string> = {
  clothing: t('annonceDetail.category.clothing'),
  electronics: t('annonceDetail.category.electronics'),
  furniture: t('annonceDetail.category.furniture'),
  books: t('annonceDetail.category.books'),
  toys: t('annonceDetail.category.toys'),
  appliances: t('annonceDetail.category.appliances'),
  sports: t('annonceDetail.category.sports'),
  other: t('annonceDetail.category.other'),
}
const CONDITION_LABELS: Record<string, string> = {
  new: t('annonceDetail.condition.new'),
  like_new: t('annonceDetail.condition.likeNew'),
  good: t('annonceDetail.condition.good'),
  used: t('annonceDetail.condition.used'),
}
const categoryLabel = (c?: string) => (c ? (CATEGORY_LABELS[c] ?? c) : t('annonceDetail.meta.noValue'))
const conditionLabel = (c?: string) => (c ? (CONDITION_LABELS[c] ?? c) : t('annonceDetail.meta.noValue'))

const objectId = computed(() => String(route.params.id))
const isContacting = ref(false)
const isBuying = ref(false)

const isDon = computed(() => !currentObject.value?.price)

const canBuy = computed(
  () =>
    !isDon.value &&
    !!currentObject.value &&
    currentObject.value.user_id !== currentUserId.value,
)

const lockers = ref<Locker[]>([])
const selectedLocker = ref<string>('')

const loadLockers = async () => {
  try {
    lockers.value = await getAvailableLockers()
    selectedLocker.value = lockers.value[0]?.id ?? ''
  } catch {
    lockers.value = []
  }
}

const buyObject = async () => {
  if (!currentObject.value) return
  if (!currentUserId.value) {
    await router.push('/login')
    return
  }
  if (!selectedLocker.value) {
    toasts.error(t('annonceDetail.toast.chooseLocker'))
    return
  }
  isBuying.value = true
  try {
    const { url } = await createObjectPayment(String(currentObject.value.id), selectedLocker.value)
    window.location.href = url
  } catch {
    toasts.error(t('annonceDetail.toast.paymentError'))
    isBuying.value = false
  }
}

const imageUrls = computed(() => {
  const raw = currentObject.value?.image_path
  if (!raw) return []
  return raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (p.startsWith('http') ? p : `${UPCYCLE_URL}/${p.replace(/^\//, '')}`))
})

const seller = computed(() => {
  const linked = currentObjectUsers.value.find((u) => u.id !== currentUserId.value)
  if (linked) return linked
  const ownerId = currentObject.value?.user_id
  if (ownerId && ownerId !== currentUserId.value) {
    return { id: ownerId, username: t('annonceDetail.fallbackSellerName') }
  }
  return null
})

const contactSeller = async () => {
  if (!seller.value || !currentObject.value) return
  isContacting.value = true
  const conversation = await conversationStore.startConversation(
    seller.value.id,
    t('annonceDetail.conversationTitlePrefix', { name: currentObject.value.name }),
  )
  isContacting.value = false
  if (conversation) {
    await router.push('/dashboard/messages')
  } else {
    toasts.error(t('annonceDetail.toast.contactError'))
  }
}

onMounted(() => {
  objectStore.fetchObjectById(objectId.value)
  objectStore.fetchObjectDeliveryMethods(objectId.value)
  objectStore.fetchObjectUsers(objectId.value)
  loadLockers()
})
</script>

<template>
  <AppHeader />

  <main>
    <section>
      <div class="container layout-flex layout-columns layout-gap-large">
        <RouterLink to="/annonces" class="ghost" style="align-self: flex-start"
          > {{ $t('annonceDetail.backToListings') }}</RouterLink
        >

        <p v-if="error" class="small" style="color: var(--destructive-color)">{{ error }}</p>
        <p v-else-if="isLoading && !currentObject" class="muted">{{ $t('annonceDetail.loading') }}</p>

        <div v-else-if="currentObject" class="card" style="padding: 0; overflow: hidden">
          <div class="annonce-gallery">
            <template v-if="imageUrls.length">
              <img
                v-for="(src, i) in imageUrls"
                :key="i"
                :src="src"
                :alt="`${currentObject.name} — photo ${i + 1}`"
                class="annonce-detail-image"
              />
            </template>
            <div v-else class="image-placeholder annonce-gallery-placeholder"></div>
          </div>

          <div class="layout-flex layout-columns layout-gap-large" style="padding: var(--space-12)">
            <span class="eyebrow"
              >{{ isDon ? $t('annonceDetail.donationLabel') : $t('annonceDetail.saleLabel') }} ·
              {{ $t('annonceDetail.available', { count: currentObject.quantity }) }}</span
            >
            <hgroup>
              <h1>{{ currentObject.name }}</h1>
              <p class="lead measure">{{ currentObject.description }}</p>
            </hgroup>

            <div class="annonce-detail-meta">
              <div>
                <span class="tiny uppercase muted">{{ $t('annonceDetail.meta.price') }}</span>
                <span class="annonce-detail-price">{{
                  isDon ? $t('common.free') : `${currentObject.price}€`
                }}</span>
              </div>
              <div>
                <span class="tiny uppercase muted">{{ $t('annonceDetail.meta.score') }}</span>
                <span class="annonce-detail-score">{{
                  currentObject.score > 0
                    ? ` ${$t('annonceDetail.meta.scoreValue', { score: currentObject.score })}`
                    : $t('annonceDetail.meta.noValue')
                }}</span>
              </div>
              <div>
                <span class="tiny uppercase muted">{{ $t('annonceDetail.meta.categoryCondition') }}</span>
                <span>{{ categoryLabel(currentObject.category) }} · {{ conditionLabel(currentObject.condition) }}</span>
              </div>
              <div>
                <span class="tiny uppercase muted">{{ $t('annonceDetail.meta.delivery') }}</span>
                <span>{{
                  currentObjectDeliveryMethods.length
                    ? currentObjectDeliveryMethods.map((d) => d.name).join(', ')
                    : $t('annonceDetail.meta.deliveryTBD')
                }}</span>
              </div>
              <div>
                <span class="tiny uppercase muted">{{ $t('annonceDetail.meta.proposedBy') }}</span>
                <span>{{ seller?.username ?? $t('annonceDetail.meta.noValue') }}</span>
              </div>
            </div>

            <div v-if="canBuy" class="form-group" style="margin-bottom: var(--space-3)">
              <label class="uppercase tiny">{{ $t('annonceDetail.locker.label') }}</label>
              <select v-model="selectedLocker" class="primary medium full-width">
                <option v-for="l in lockers" :key="l.id" :value="l.id">
                  {{ l.name }} — {{ l.city }} ({{ $t('annonceDetail.locker.slotsFree', { count: l.available_slots }) }})
                </option>
              </select>
              <p v-if="!lockers.length" class="tiny muted">{{ $t('annonceDetail.locker.none') }}</p>
            </div>

            <div class="layout-flex layout-gap-medium">
              <button
                v-if="canBuy"
                class="primary medium"
                :disabled="isBuying || !selectedLocker"
                @click="buyObject"
              >
                {{ isBuying ? $t('annonceDetail.buy.redirecting') : $t('annonceDetail.buy.cta', { price: currentObject.price }) }}
              </button>
              <button
                v-if="seller"
                :class="canBuy ? 'secondary medium' : 'primary medium'"
                :disabled="isContacting"
                @click="contactSeller"
              >
                {{ isContacting ? $t('annonceDetail.contact.opening') : $t('annonceDetail.contact.cta') }}
              </button>
              <RouterLink to="/annonces" class="ghost medium">{{ $t('annonceDetail.seeOthers') }}</RouterLink>
            </div>
          </div>
        </div>

        <p v-else class="muted center" style="padding: var(--space-8)">{{ $t('annonceDetail.notFound') }}</p>
      </div>
    </section>
  </main>

  <AppFooter />
</template>

<style scoped>
.annonce-gallery {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
}

.annonce-detail-image {
  height: 360px;
  flex: 1 1 0;
  min-width: 280px;
  object-fit: cover;
}

.annonce-gallery-placeholder {
  flex: 1;
  --image-placeholder-min-height: 360px;
}

.annonce-detail-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.annonce-detail-meta > div {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.annonce-detail-price {
  font-weight: 900;
  font-size: var(--font-size-xlarge);
}
</style>
