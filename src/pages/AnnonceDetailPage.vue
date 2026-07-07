<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useObjectStore } from '@/stores/objectStore'
import { useConversationStore } from '@/stores/conversationStore'
import { useCurrentUser } from '@/composables/useCurrentUser'
import { useToastsStore } from '@/stores/toasts'

const route = useRoute()
const router = useRouter()
const objectStore = useObjectStore()
const conversationStore = useConversationStore()
const toasts = useToastsStore()
const { currentObject, currentObjectDeliveryMethods, currentObjectUsers, isLoading, error } =
  storeToRefs(objectStore)
const { currentUserId } = useCurrentUser()

const UPCYCLE_URL = import.meta.env.VITE_UPCYCLE_URL ?? 'http://localhost:4343'

const CATEGORY_LABELS: Record<string, string> = {
  clothing: 'Vêtements',
  electronics: 'Électronique',
  furniture: 'Mobilier',
  books: 'Livres',
  toys: 'Jouets',
  appliances: 'Électroménager',
  sports: 'Sport',
  other: 'Autre',
}
const CONDITION_LABELS: Record<string, string> = {
  new: 'Neuf',
  like_new: 'Comme neuf',
  good: 'Bon état',
  used: 'Usagé',
}
const categoryLabel = (c?: string) => (c ? (CATEGORY_LABELS[c] ?? c) : '—')
const conditionLabel = (c?: string) => (c ? (CONDITION_LABELS[c] ?? c) : '—')

const objectId = computed(() => String(route.params.id))
const isContacting = ref(false)

const isDon = computed(() => !currentObject.value?.price)

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
    return { id: ownerId, username: 'le vendeur' }
  }
  return null
})

const contactSeller = async () => {
  if (!seller.value || !currentObject.value) return
  isContacting.value = true
  const conversation = await conversationStore.startConversation(
    seller.value.id,
    `Annonce : ${currentObject.value.name}`,
  )
  isContacting.value = false
  if (conversation) {
    await router.push('/dashboard/messages')
  } else {
    toasts.error('Impossible de contacter le vendeur pour le moment.')
  }
}

onMounted(() => {
  objectStore.fetchObjectById(objectId.value)
  objectStore.fetchObjectDeliveryMethods(objectId.value)
  objectStore.fetchObjectUsers(objectId.value)
})
</script>

<template>
  <AppHeader />

  <main>
    <section>
      <div class="container layout-flex layout-columns layout-gap-large">
        <RouterLink to="/annonces" class="ghost" style="align-self: flex-start"
          >← Retour aux annonces</RouterLink
        >

        <p v-if="error" class="small" style="color: var(--destructive-color)">{{ error }}</p>
        <p v-else-if="isLoading && !currentObject" class="muted">Chargement de l'annonce…</p>

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
              >{{ isDon ? 'Don' : 'Vente' }} · {{ currentObject.quantity }} disponible(s)</span
            >
            <hgroup>
              <h1>{{ currentObject.name }}</h1>
              <p class="lead measure">{{ currentObject.description }}</p>
            </hgroup>

            <div class="annonce-detail-meta">
              <div>
                <span class="tiny uppercase muted">Prix</span>
                <span class="annonce-detail-price">{{
                  isDon ? 'Gratuit' : `${currentObject.price}€`
                }}</span>
              </div>
              <div>
                <span class="tiny uppercase muted">Upcycler Score</span>
                <span class="annonce-detail-score">{{
                  currentObject.score > 0 ? `🌱 ${currentObject.score} kg CO₂` : '—'
                }}</span>
              </div>
              <div>
                <span class="tiny uppercase muted">Catégorie / État</span>
                <span>{{ categoryLabel(currentObject.category) }} · {{ conditionLabel(currentObject.condition) }}</span>
              </div>
              <div>
                <span class="tiny uppercase muted">Livraison</span>
                <span>{{
                  currentObjectDeliveryMethods.length
                    ? currentObjectDeliveryMethods.map((d) => d.name).join(', ')
                    : 'À convenir'
                }}</span>
              </div>
              <div>
                <span class="tiny uppercase muted">Proposé par</span>
                <span>{{ seller?.username ?? '—' }}</span>
              </div>
            </div>

            <div class="layout-flex layout-gap-medium">
              <button
                v-if="seller"
                class="primary medium"
                :disabled="isContacting"
                @click="contactSeller"
              >
                {{ isContacting ? 'Ouverture…' : 'Contacter le vendeur' }}
              </button>
              <RouterLink to="/annonces" class="ghost medium">Voir d'autres annonces</RouterLink>
            </div>
          </div>
        </div>

        <p v-else class="muted center" style="padding: var(--space-8)">Annonce introuvable.</p>
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
