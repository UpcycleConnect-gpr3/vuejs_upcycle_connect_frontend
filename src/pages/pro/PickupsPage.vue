<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'
import {
  getDepositedPackages,
  getPackageByCode,
  retrievePackage,
} from '@/api/clients/depositClient'
import { useToastsStore } from '@/stores/toasts'
import type { DepositedPackage, PackageInfo } from '@/types'

const toasts = useToastsStore()
const { t } = useI18n()

const deposited = ref<DepositedPackage[]>([])
const isLoading = ref(false)
const search = ref('')

const load = async () => {
  isLoading.value = true
  try {
    deposited.value = await getDepositedPackages()
  } catch {
    toasts.error(t('proPickups.errors.loadFailed'))
  } finally {
    isLoading.value = false
  }
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return deposited.value
  return deposited.value.filter((d) =>
    `${d.object_name} ${d.category} ${d.locker_city} ${d.locker_name}`.toLowerCase().includes(q),
  )
})

const showRetrieve = ref(false)
const code = ref('')
const isChecking = ref(false)
const isRetrieving = ref(false)
const found = ref<PackageInfo | null>(null)

const openRetrieve = (prefill = '') => {
  code.value = prefill
  found.value = null
  showRetrieve.value = true
}

const check = async () => {
  const c = code.value.trim().toUpperCase()
  if (!c) return
  isChecking.value = true
  found.value = null
  try {
    const pkg = await getPackageByCode(c)
    if (pkg.status !== 'deposited') {
      toasts.error(t('proPickups.errors.alreadyTaken'))
      return
    }
    found.value = pkg
  } catch {
    toasts.error(t('proPickups.errors.codeNotFound'))
  } finally {
    isChecking.value = false
  }
}

const confirmPickup = async () => {
  if (!found.value) return
  isRetrieving.value = true
  try {
    await retrievePackage(found.value.code)
    toasts.success(t('proPickups.success.retrieved'))
    showRetrieve.value = false
    found.value = null
    code.value = ''
    await load()
  } catch (e) {
    const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message
    toasts.error(
      msg === 'Package has expired'
        ? t('proPickups.errors.codeExpired')
        : t('proPickups.errors.retrieveFailed'),
    )
  } finally {
    isRetrieving.value = false
  }
}

onMounted(load)
</script>

<template>
  <ProDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">{{ $t('proPickups.eyebrow') }}</span>
        <h1>{{ $t('proPickups.title') }}</h1>
        <p class="muted measure">
          {{ $t('proPickups.subtitle') }}
        </p>
      </div>
      <button class="primary medium" @click="openRetrieve()">{{ $t('proPickups.retrieveWithCode') }}</button>
    </header>

    <input
      v-model="search"
      type="search"
      class="primary medium"
      :placeholder="$t('proPickups.searchPlaceholder')"
      style="max-width: 340px"
    />

    <p v-if="isLoading && !deposited.length" class="muted">{{ $t('common.loading') }}</p>
    <p v-else-if="!filtered.length" class="muted center" style="padding: var(--space-8)">
      {{ $t('proPickups.empty') }}
    </p>

    <div v-else class="dashboard-grid">
      <article v-for="d in filtered" :key="d.package_id" class="dashboard-card">
        <div class="card-header">
          <div class="layout-flex layout-gap-small" style="flex-wrap: wrap">
            <span class="badge">{{ d.category }}</span>
            <span class="badge badge--success">+{{ d.score }} kg CO₂</span>
          </div>
          <h4 style="margin-top: var(--space-1)">{{ d.object_name }}</h4>
        </div>
        <div class="tiny muted" style="margin-top: var(--space-2)">
           {{ $t('proPickups.locker', { name: d.locker_name, city: d.locker_city }) }}
        </div>
        <div class="tiny muted"> {{ $t('proPickups.expiresOn', { date: d.expiry_date.slice(0, 10) }) }}</div>
        <button class="primary small" style="margin-top: var(--space-3)" @click="openRetrieve()">
          {{ $t('proPickups.retrieve') }}
        </button>
      </article>
    </div>

    <AppModal :open="showRetrieve" :title="$t('proPickups.modal.title')" @close="showRetrieve = false">
      <form class="layout-flex layout-columns layout-gap-medium" @submit.prevent="check">
        <div class="form-group">
          <label class="uppercase">{{ $t('proPickups.modal.codeLabel') }}</label>
          <div class="layout-flex layout-gap-small">
            <input
              v-model="code"
              type="text"
              class="primary medium full-width mono"
              :placeholder="$t('proPickups.modal.codePlaceholder')"
              style="text-transform: uppercase"
              required
            />
            <button type="submit" class="ghost medium" :disabled="isChecking || !code.trim()">
              {{ isChecking ? '…' : $t('proPickups.modal.verify') }}
            </button>
          </div>
        </div>
      </form>

      <div v-if="found" class="alert alert--success" style="margin-top: var(--space-3)">
        <span>
          {{ $t('proPickups.modal.foundPrefix') }} <span class="mono">{{ found.code }}</span
          >{{ $t('proPickups.modal.foundSuffix', { date: found.expiry_date.slice(0, 10) }) }}
        </span>
      </div>

      <template #footer>
        <button class="ghost medium" @click="showRetrieve = false">{{ $t('common.cancel') }}</button>
        <button
          v-if="found"
          class="primary medium"
          :disabled="isRetrieving"
          @click="confirmPickup"
        >
          {{ isRetrieving ? $t('proPickups.modal.opening') : $t('proPickups.modal.confirm') }}
        </button>
      </template>
    </AppModal>
  </ProDashboardLayout>
</template>
