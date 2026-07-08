<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/components/DashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'
import { getObjects, createObject } from '@/services/upcycle'
import { useToastsStore } from '@/stores/toasts'

const toasts = useToastsStore()
const { t } = useI18n()

type Status = 'pending' | 'approved' | 'rejected' | 'sold'

interface Listing {
  id: number
  title: string
  type: 'don' | 'vente'
  category: string
  price: number | null
  status: Status
  views: number
  createdAt: string
  photoCount: number
}

const route = useRoute()
const router = useRouter()
const filter = ref<'all' | Status>('all')

const listings = ref<Listing[]>([
  {
    id: 1,
    title: t('dashListings.demo.1.title'),
    type: 'don',
    category: t('dashListings.demo.1.category'),
    price: null,
    status: 'approved',
    views: 142,
    createdAt: '2026-04-22',
    photoCount: 4,
  },
  {
    id: 2,
    title: t('dashListings.demo.2.title'),
    type: 'vente',
    category: t('dashListings.demo.2.category'),
    price: 35,
    status: 'pending',
    views: 0,
    createdAt: '2026-04-26',
    photoCount: 6,
  },
  {
    id: 3,
    title: t('dashListings.demo.3.title'),
    type: 'vente',
    category: t('dashListings.demo.3.category'),
    price: 80,
    status: 'approved',
    views: 87,
    createdAt: '2026-04-20',
    photoCount: 3,
  },
  {
    id: 4,
    title: t('dashListings.demo.4.title'),
    type: 'don',
    category: t('dashListings.demo.4.category'),
    price: null,
    status: 'rejected',
    views: 0,
    createdAt: '2026-04-18',
    photoCount: 1,
  },
  {
    id: 5,
    title: t('dashListings.demo.5.title'),
    type: 'vente',
    category: t('dashListings.demo.5.category'),
    price: 60,
    status: 'sold',
    views: 234,
    createdAt: '2026-04-10',
    photoCount: 5,
  },
])

const statusMeta: Record<Status, { label: string; badge: string }> = {
  pending: { label: t('dashListings.status.pending'), badge: 'badge--accent' },
  approved: { label: t('dashListings.status.approved'), badge: 'badge--success' },
  rejected: { label: t('dashListings.status.rejected'), badge: 'badge--danger' },
  sold: { label: t('dashListings.status.sold'), badge: 'badge--muted' },
}

const typeLabels: Record<'don' | 'vente', string> = {
  don: t('dashListings.type.don'),
  vente: t('dashListings.type.vente'),
}

onMounted(async () => {
  try {
    const objects = await getObjects()
    if (Array.isArray(objects) && objects.length) {
      listings.value = objects.map(
        (o): Listing => ({
          id: Number(o.id),
          title: o.title ?? o.name ?? t('dashListings.defaultObjectName'),
          type: (o.price ?? null) ? 'vente' : 'don',
          category: o.category ?? t('dashListings.otherCategory'),
          price: typeof o.price === 'number' ? o.price : null,
          status: ((o.status as Status) ?? 'pending') as Status,
          views: (o.views as number) ?? 0,
          createdAt: (o.created_at as string)?.slice(0, 10) ?? '',
          photoCount: (o.photo_count as number) ?? 0,
        }),
      )
    }
  } catch {
    toasts.error(t('dashListings.toastLoadError'))
  }
})

const filtered = computed(() =>
  filter.value === 'all' ? listings.value : listings.value.filter((l) => l.status === filter.value),
)

const showModal = ref(route.path.endsWith('/new'))
const step = ref(1)
const editingId = ref<number | null>(null)

const form = reactive({
  type: 'don' as 'don' | 'vente',
  title: '',
  description: '',
  category: '',
  condition: 'good',
  price: 0,
  photos: [] as { name: string; size: number }[],
})

function openEdit(l: Listing) {
  editingId.value = l.id
  form.type = l.type
  form.title = l.title
  form.category = l.category
  form.price = l.price ?? 0
  form.description = ''
  form.condition = 'good'
  form.photos = Array.from({ length: l.photoCount }, (_, i) => ({
    name: `photo-${i + 1}.jpg`,
    size: 0,
  }))
  step.value = 1
  showModal.value = true
}

function close() {
  showModal.value = false
  step.value = 1
  editingId.value = null
  if (route.path.endsWith('/new')) router.push('/dashboard/listings')
}

function addPhotos(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const f of Array.from(files)) {
    form.photos.push({ name: f.name, size: f.size })
  }
}

function removePhoto(i: number) {
  form.photos.splice(i, 1)
}

async function submitListing() {
  if (editingId.value === null) {
    try {
      await createObject({
        title: form.title,
        category: form.category,
        condition: form.condition,
        description: form.description,
        price: form.type === 'vente' ? form.price : null,
      })
      toasts.success(t('dashListings.toastSubmitted'))
    } catch {
      toasts.error(t('dashListings.toastSubmitError'))
    }
  }
  if (editingId.value !== null) {
    const idx = listings.value.findIndex((l) => l.id === editingId.value)
    const existing = listings.value[idx]
    if (idx >= 0 && existing) {
      listings.value[idx] = {
        ...existing,
        title: form.title,
        type: form.type,
        category: form.category,
        price: form.type === 'vente' ? form.price : null,
        photoCount: form.photos.length,
      }
    }
  } else {
    listings.value.unshift({
      id: Date.now(),
      title: form.title,
      type: form.type,
      category: form.category,
      price: form.type === 'vente' ? form.price : null,
      status: 'pending',
      views: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      photoCount: form.photos.length,
    })
  }
  Object.assign(form, {
    type: 'don',
    title: '',
    description: '',
    category: '',
    condition: 'good',
    price: 0,
    photos: [],
  })
  step.value = 1
  close()
}
</script>

<template>
  <DashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">{{ $t('dashListings.eyebrow') }}</span>
        <h1>{{ $t('dashListings.title') }}</h1>
        <p class="muted measure">
          {{ $t('dashListings.subtitle') }}
        </p>
      </div>
      <button class="primary medium" @click="showModal = true">{{ $t('dashListings.newListing') }}</button>
    </header>

    <div class="layout-flex layout-gap-small" style="flex-wrap: wrap">
      <button class="forum-tab" :class="{ active: filter === 'all' }" @click="filter = 'all'">
        {{ $t('dashListings.allCount', { count: listings.length }) }}
      </button>
      <button
        v-for="(meta, key) in statusMeta"
        :key="key"
        class="forum-tab"
        :class="{ active: filter === key }"
        @click="filter = key as Status"
      >
        {{ meta.label }}
      </button>
    </div>

    <div class="listings-grid">
      <article v-for="l in filtered" :key="l.id" class="listing-card">
        <div class="listing-photo">
          <span class="tiny muted">{{
            l.photoCount > 1
              ? $t('dashListings.photoCountPlural', { count: l.photoCount })
              : $t('dashListings.photoCountSingular', { count: l.photoCount })
          }}</span>
        </div>
        <div class="listing-body">
          <div class="layout-flex layout-gap-small layout-items-center" style="flex-wrap: wrap">
            <span class="badge" :class="statusMeta[l.status].badge">{{
              statusMeta[l.status].label
            }}</span>
            <span class="badge">{{ typeLabels[l.type] }}</span>
            <span class="badge">{{ l.category }}</span>
          </div>
          <h4>{{ l.title }}</h4>
          <div class="layout-flex layout-justify-between layout-items-end">
            <div>
              <div
                v-if="l.price"
                class="mono"
                style="font-size: var(--font-size-large); font-weight: 700"
              >
                {{ l.price }}€
              </div>
              <div v-else class="text-secondary" style="font-weight: 700">{{ $t('common.free') }}</div>
              <div class="tiny muted">{{ $t('dashListings.viewsCreatedAt', { views: l.views, date: l.createdAt }) }}</div>
            </div>
            <div class="layout-flex layout-gap-small">
              <button class="secondary small" @click="openEdit(l)">{{ $t('common.edit') }}</button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div v-if="filtered.length === 0" class="empty-state">
      <p>{{ $t('dashListings.emptyState') }}</p>
      <button class="primary medium" @click="showModal = true">
        {{ $t('dashListings.depositFirst') }}
      </button>
    </div>

    <AppModal :open="showModal" size="medium" @close="close">
      <template #header>
        <div class="layout-flex layout-columns" style="gap: 4px">
          <span class="eyebrow">{{ $t('dashListings.stepOf', { step }) }}</span>
          <h3>{{ $t('dashListings.modalTitle') }}</h3>
        </div>
      </template>

      <form
        v-if="step === 1"
        class="layout-flex layout-columns layout-gap-medium"
        @submit.prevent="step = 2"
      >
        <div class="form-group">
          <label class="uppercase">{{ $t('dashListings.form.type') }}</label>
          <div class="layout-flex layout-gap-small">
            <button
              type="button"
              class="forum-tab"
              :class="{ active: form.type === 'don' }"
              @click="form.type = 'don'"
            >
              {{ $t('dashListings.form.freeDonation') }}
            </button>
            <button
              type="button"
              class="forum-tab"
              :class="{ active: form.type === 'vente' }"
              @click="form.type = 'vente'"
            >
              {{ $t('dashListings.form.sale') }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="uppercase">{{ $t('dashListings.form.titleLabel') }}</label>
          <input
            v-model="form.title"
            type="text"
            class="primary medium full-width"
            :placeholder="$t('dashListings.form.titlePlaceholder')"
            required
          />
        </div>

        <div class="layout-flex layout-gap-medium">
          <div class="form-group" style="flex: 1">
            <label class="uppercase">{{ $t('dashListings.form.category') }}</label>
            <select v-model="form.category" class="primary medium full-width" required>
              <option value="" disabled>{{ $t('dashListings.form.choose') }}</option>
              <option>{{ $t('dashListings.categories.furniture') }}</option>
              <option>{{ $t('dashListings.categories.tools') }}</option>
              <option>{{ $t('dashListings.categories.electronics') }}</option>
              <option>{{ $t('dashListings.categories.textile') }}</option>
              <option>{{ $t('dashListings.categories.tableware') }}</option>
              <option>{{ $t('dashListings.categories.other') }}</option>
            </select>
          </div>
          <div class="form-group" style="flex: 1">
            <label class="uppercase">{{ $t('dashListings.form.condition') }}</label>
            <select v-model="form.condition" class="primary medium full-width">
              <option value="new">{{ $t('dashListings.condition.new') }}</option>
              <option value="good">{{ $t('dashListings.condition.good') }}</option>
              <option value="fair">{{ $t('dashListings.condition.fair') }}</option>
              <option value="repair">{{ $t('dashListings.condition.repair') }}</option>
            </select>
          </div>
          <div v-if="form.type === 'vente'" class="form-group" style="width: 140px">
            <label class="uppercase">{{ $t('dashListings.form.priceLabel') }}</label>
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              class="primary medium full-width"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="uppercase">{{ $t('dashListings.form.description') }}</label>
          <textarea
            v-model="form.description"
            class="primary full-width"
            rows="5"
            :placeholder="$t('dashListings.form.descriptionPlaceholder')"
            required
          ></textarea>
        </div>
      </form>

      <div v-else-if="step === 2" class="layout-flex layout-columns layout-gap-medium">
        <p class="muted">
          {{ $t('dashListings.form.photoHint') }}
        </p>
        <label class="dropzone">
          <input type="file" multiple accept="image/*" @change="addPhotos" hidden />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <span>{{ $t('dashListings.form.dropzoneLabel') }}</span>
          <span class="tiny muted">{{ $t('dashListings.form.dropzoneHint') }}</span>
        </label>
        <div v-if="form.photos.length" class="photo-list">
          <div v-for="(p, i) in form.photos" :key="i" class="photo-chip">
            <span class="tiny mono">{{ p.name }}</span>
            <button class="ghost small" :aria-label="$t('common.delete')" @click="removePhoto(i)"></button>
          </div>
        </div>
      </div>

      <div v-else-if="step === 3" class="layout-flex layout-columns layout-gap-medium">
        <div class="recap-row">
          <span class="tiny uppercase muted">{{ $t('dashListings.form.type') }}</span
          ><span>{{
            form.type === 'don'
              ? $t('dashListings.form.freeDonation')
              : $t('dashListings.form.saleAt', { price: form.price })
          }}</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">{{ $t('dashListings.form.titleLabel') }}</span><span>{{ form.title }}</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">{{ $t('dashListings.form.category') }}</span><span>{{ form.category }}</span>
        </div>
        <div class="recap-row">
          <span class="tiny uppercase muted">{{ $t('dashListings.form.photos') }}</span><span>{{ form.photos.length }}</span>
        </div>
        <p class="small muted">
          {{ $t('dashListings.form.reviewNotice') }}
        </p>
      </div>

      <template #footer>
        <button class="ghost medium" @click="close">{{ $t('common.cancel') }}</button>
        <div class="layout-flex layout-gap-small">
          <button v-if="step > 1" class="ghost medium" @click="step--"> {{ $t('dashListings.form.previous') }}</button>
          <button
            v-if="step < 3"
            class="primary medium"
            @click="step++"
            :disabled="step === 1 && !form.title"
          >
            {{ $t('dashListings.form.next') }}
          </button>
          <button v-else class="primary medium" @click="submitListing">{{ $t('dashListings.form.publish') }}</button>
        </div>
      </template>
    </AppModal>
  </DashboardLayout>
</template>
