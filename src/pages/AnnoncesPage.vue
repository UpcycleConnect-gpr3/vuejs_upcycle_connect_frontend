<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import AppModal from '@/components/AppModal.vue'
import { useObjectStore } from '@/stores/objectStore'
import { useToastsStore } from '@/stores/toasts'
import { uploadImage } from '@/api/clients/uploadClient'
import { getScoreConfig } from '@/api/clients/scoreClient'
import type { UpcycleObject } from '@/types'

const router = useRouter()
const objectStore = useObjectStore()
const toasts = useToastsStore()
const { objects, isLoading, error } = storeToRefs(objectStore)
const { t } = useI18n()

const UPCYCLE_URL = import.meta.env.VITE_UPCYCLE_URL ?? 'http://localhost:4343'

const CATEGORY_LABELS: Record<string, string> = {
  clothing: t('annonces.category.clothing'),
  electronics: t('annonces.category.electronics'),
  furniture: t('annonces.category.furniture'),
  books: t('annonces.category.books'),
  toys: t('annonces.category.toys'),
  appliances: t('annonces.category.appliances'),
  sports: t('annonces.category.sports'),
  other: t('annonces.category.other'),
}
const CONDITION_LABELS: Record<string, string> = {
  new: t('annonces.condition.new'),
  like_new: t('annonces.condition.likeNew'),
  good: t('annonces.condition.good'),
  used: t('annonces.condition.used'),
}

const categories = ref<string[]>(Object.keys(CATEGORY_LABELS))
const conditions = ref<string[]>(Object.keys(CONDITION_LABELS))

const categoryLabel = (c: string) => CATEGORY_LABELS[c] ?? c
const conditionLabel = (c: string) => CONDITION_LABELS[c] ?? c

const search = ref('')
const typeFilter = ref<'all' | 'vente' | 'don'>('all')

const isDon = (o: UpcycleObject) => !o.price

const imageUrl = (o: UpcycleObject) => {
  const first = (o.image_path ?? '').split(',')[0]?.trim()
  if (!first) return ''
  if (first.startsWith('http')) return first
  return `${UPCYCLE_URL}/${first.replace(/^\//, '')}`
}

const filteredObjects = computed(() =>
  objects.value.filter((o) => {
    const q = search.value.trim().toLowerCase()
    if (q && !`${o.name} ${o.description}`.toLowerCase().includes(q)) return false
    if (typeFilter.value === 'vente' && isDon(o)) return false
    if (typeFilter.value === 'don' && !isDon(o)) return false
    return true
  }),
)

const showCreate = ref(false)
const isSubmitting = ref(false)
const photoFiles = ref<File[]>([])
const photoInput = ref<HTMLInputElement | null>(null)

const createForm = reactive({
  name: '',
  description: '',
  type: 'don' as 'don' | 'vente',
  price: 0,
  quantity: 1,
  category: 'other',
  condition: 'good',
})

const resetCreateForm = () => {
  createForm.name = ''
  createForm.description = ''
  createForm.type = 'don'
  createForm.price = 0
  createForm.quantity = 1
  createForm.category = 'other'
  createForm.condition = 'good'
  photoFiles.value = []
  if (photoInput.value) photoInput.value.value = ''
}

const addPhotos = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const f of Array.from(files)) {
    if (f.size > 10 * 1024 * 1024) {
      toasts.error(t('annonces.form.photoTooLarge', { name: f.name }))
      continue
    }
    photoFiles.value.push(f)
  }
}

const removePhoto = (index: number) => {
  photoFiles.value.splice(index, 1)
}

const submitCreate = async () => {
  if (!createForm.name.trim()) return
  isSubmitting.value = true
  try {
    const paths: string[] = []
    for (const file of photoFiles.value) {
      paths.push(await uploadImage(file))
    }
    const created = await objectStore.addObject({
      id: '',
      name: createForm.name.trim(),
      description: createForm.description.trim(),
      price: createForm.type === 'vente' ? createForm.price : 0,
      image_path: paths.join(','),
      column_for_calc_the_score: '',
      category: createForm.category,
      condition: createForm.condition,
      quantity: createForm.quantity,
      user_id: '',
      score: 0,
      is_ad_validated: false,
    })
    if (created) {
      toasts.success(t('annonces.toast.published'))
      showCreate.value = false
      resetCreateForm()
      await objectStore.fetchObjects()
    }
  } catch {
    toasts.error(t('annonces.toast.uploadFailed'))
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  objectStore.fetchObjects()
  try {
    const config = await getScoreConfig()
    if (config.categories) categories.value = Object.keys(config.categories)
    if (config.conditions) conditions.value = Object.keys(config.conditions)
  } catch {

  }
})
</script>

<template>
  <AppHeader />

  <main>
    <section>
      <div class="container layout-flex layout-columns layout-gap-extra-large">
        <hgroup>
          <span class="eyebrow">{{ $t('annonces.eyebrow') }}</span>
          <h2>{{ $t('annonces.title') }}</h2>
        </hgroup>

        <div class="annonces-toolbar">
          <input
            v-model="search"
            type="search"
            class="primary medium"
            :placeholder="$t('annonces.search.placeholder')"
            style="flex: 1"
          />
          <div class="layout-flex layout-gap-small">
            <button
              class="medium"
              :class="typeFilter === 'all' ? 'primary' : 'secondary'"
              @click="typeFilter = 'all'"
            >
              {{ $t('annonces.filter.all') }}
            </button>
            <button
              class="medium"
              :class="typeFilter === 'don' ? 'primary' : 'secondary'"
              @click="typeFilter = 'don'"
            >
              {{ $t('annonces.filter.donations') }}
            </button>
            <button
              class="medium"
              :class="typeFilter === 'vente' ? 'primary' : 'secondary'"
              @click="typeFilter = 'vente'"
            >
              {{ $t('annonces.filter.sales') }}
            </button>
          </div>
          <button class="primary medium" @click="showCreate = true">
            + {{ $t('annonces.create.button') }}
          </button>
        </div>

        <p v-if="error" class="small" style="color: var(--destructive-color)">{{ error }}</p>
        <p v-else-if="isLoading && !objects.length" class="muted">{{ $t('annonces.loading') }}</p>
        <p v-else-if="!filteredObjects.length" class="muted center" style="padding: var(--space-8)">
          {{ $t('annonces.empty') }}
        </p>

        <div v-else class="annonces-grid layout-items-stretch">
          <article
            v-for="o in filteredObjects"
            :key="o.id"
            class="card layout-flex layout-columns layout-gap-medium annonce-card"
            @click="router.push(`/annonces/${o.id}`)"
          >
            <img v-if="imageUrl(o)" :src="imageUrl(o)" :alt="o.name" class="annonce-image" />
            <div v-else class="image-placeholder annonce-placeholder"></div>
            <span class="eyebrow"
              >{{ isDon(o) ? $t('annonces.card.donation') : $t('annonces.card.saleLabel', { price: o.price }) }} ·
              {{ $t('annonces.card.available', { count: o.quantity }) }}</span
            >
            <hgroup>
              <h3>{{ o.name }}</h3>
              <p class="measure annonce-description">{{ o.description }}</p>
            </hgroup>
            <span v-if="o.score > 0" class="annonce-score">
              {{ $t('annonces.card.scoreSaved', { score: o.score }) }}</span
            >
          </article>
        </div>
      </div>
    </section>
    <AppModal :open="showCreate" :title="$t('annonces.create.modalTitle')" @close="showCreate = false">
      <form
        id="create-annonce-form"
        class="layout-flex layout-columns layout-gap-medium"
        @submit.prevent="submitCreate"
      >
        <div class="form-group">
          <label class="uppercase">{{ $t('annonces.form.nameLabel') }}</label>
          <input
            v-model="createForm.name"
            type="text"
            class="primary medium full-width"
            :placeholder="$t('annonces.form.namePlaceholder')"
            required
          />
        </div>
        <div class="form-group">
          <label class="uppercase">{{ $t('annonces.form.descriptionLabel') }}</label>
          <textarea
            v-model="createForm.description"
            class="primary medium full-width"
            rows="3"
            :placeholder="$t('annonces.form.descriptionPlaceholder')"
          ></textarea>
        </div>
        <div class="layout-flex layout-gap-medium">
          <div class="form-group" style="flex: 1">
            <label class="uppercase">{{ $t('annonces.form.categoryLabel') }}</label>
            <select v-model="createForm.category" class="primary medium full-width">
              <option v-for="c in categories" :key="c" :value="c">{{ categoryLabel(c) }}</option>
            </select>
          </div>
          <div class="form-group" style="flex: 1">
            <label class="uppercase">{{ $t('annonces.form.conditionLabel') }}</label>
            <select v-model="createForm.condition" class="primary medium full-width">
              <option v-for="c in conditions" :key="c" :value="c">{{ conditionLabel(c) }}</option>
            </select>
          </div>
        </div>
        <p class="tiny muted">
          {{ $t('annonces.form.scoreHint') }}
        </p>
        <div class="form-group">
          <label class="uppercase">{{ $t('annonces.form.photosLabel') }}</label>
          <input
            ref="photoInput"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            class="primary medium full-width"
            @change="addPhotos"
          />
          <div v-if="photoFiles.length" class="layout-flex layout-gap-small" style="flex-wrap: wrap">
            <span v-for="(f, i) in photoFiles" :key="i" class="badge">
              {{ f.name }}
              <button
                type="button"
                class="ghost small"
                style="padding: 0 var(--space-1)"
                :aria-label="$t('annonces.form.removePhoto')"
                @click="removePhoto(i)"
              >

              </button>
            </span>
          </div>
        </div>
        <div class="layout-flex layout-gap-medium">
          <div class="form-group" style="flex: 1">
            <label class="uppercase">{{ $t('annonces.form.typeLabel') }}</label>
            <select v-model="createForm.type" class="primary medium full-width">
              <option value="don">{{ $t('annonces.form.optionDon') }}</option>
              <option value="vente">{{ $t('annonces.form.optionSale') }}</option>
            </select>
          </div>
          <div v-if="createForm.type === 'vente'" class="form-group" style="flex: 1">
            <label class="uppercase">{{ $t('annonces.form.priceLabel') }}</label>
            <input
              v-model.number="createForm.price"
              type="number"
              min="1"
              step="0.5"
              class="primary medium full-width"
              required
            />
          </div>
          <div class="form-group" style="flex: 1">
            <label class="uppercase">{{ $t('annonces.form.quantityLabel') }}</label>
            <input
              v-model.number="createForm.quantity"
              type="number"
              min="1"
              class="primary medium full-width"
              required
            />
          </div>
        </div>
        <p v-if="error" class="tiny" style="color: var(--destructive-color)">{{ error }}</p>
      </form>
      <template #footer>
        <button class="ghost medium" @click="showCreate = false">{{ $t('common.cancel') }}</button>
        <button
          type="submit"
          form="create-annonce-form"
          class="primary medium"
          :disabled="isSubmitting || !createForm.name.trim()"
        >
          {{ isSubmitting ? $t('annonces.form.publishing') : $t('annonces.form.publish') }}
        </button>
      </template>
    </AppModal>
  </main>

  <AppFooter />
</template>

<style scoped>
.annonces-toolbar {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  align-items: center;
}

.annonces-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-4);
}

.annonce-card {
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.annonce-card:hover {
  border-color: var(--primary-color);
}

.annonce-score {
  font-size: var(--font-size-small);
  font-weight: 700;
  color: var(--secondary-color);
}

.annonce-placeholder {
  --image-placeholder-min-height: 160px;
}

.annonce-image {
  height: 160px;
  width: 100%;
  object-fit: cover;
}

.annonce-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
