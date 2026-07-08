<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'
import QrCode from '@/components/QrCode.vue'
import { getObjects } from '@/api/clients/objectClient'
import {
  getAvailableLockers,
  depositObject,
  retrievePackage,
  getSellerDeliveries,
  getBuyerDeliveries,
  confirmDeposit,
} from '@/api/clients/depositClient'
import { useCurrentUser } from '@/composables/useCurrentUser'
import { useToastsStore } from '@/stores/toasts'
import { useI18n } from 'vue-i18n'
import type { DeliverySummary, Locker, UpcycleObject } from '@/types'

const toasts = useToastsStore()
const { currentUserId } = useCurrentUser()
const { t } = useI18n()

const myObjects = ref<UpcycleObject[]>([])
const lockers = ref<Locker[]>([])
const isLoading = ref(false)

const sales = ref<DeliverySummary[]>([])
const purchases = ref<DeliverySummary[]>([])

const loadDeliveries = async () => {
  try {
    const [s, p] = await Promise.all([getSellerDeliveries(), getBuyerDeliveries()])
    sales.value = s
    purchases.value = p
  } catch {
    sales.value = []
    purchases.value = []
  }
}

const confirmSaleDeposit = async (d: DeliverySummary) => {
  try {
    await confirmDeposit(d.code)
    toasts.success(t('dashDeposits.toastDeposited'))
    await loadDeliveries()
  } catch {
    toasts.error(t('dashDeposits.toastDepositError'))
  }
}

const deliveryCodeOpen = ref<DeliverySummary | null>(null)
const deliveryCodeKind = ref<'deposit' | 'retrieve'>('deposit')
const openDeliveryCode = (d: DeliverySummary, kind: 'deposit' | 'retrieve') => {
  deliveryCodeOpen.value = d
  deliveryCodeKind.value = kind
}
const deliveryCodeValue = computed(() =>
  deliveryCodeKind.value === 'deposit'
    ? (deliveryCodeOpen.value?.code ?? '')
    : (deliveryCodeOpen.value?.retrieve_code ?? ''),
)

const retrievePurchase = async (d: DeliverySummary) => {
  try {
    await retrievePackage(d.retrieve_code)
    toasts.success(t('dashDeposits.toastRetrieved'))
    await loadDeliveries()
  } catch {
    toasts.error(t('dashDeposits.toastRetrieveError'))
  }
}

interface DepositedItem {
  code: string
  objectName: string
  lockerName: string
  expiry: string
  score: number
}
const myDeposits = ref<DepositedItem[]>([])

const load = async () => {
  isLoading.value = true
  try {
    const [objects, avail] = await Promise.all([getObjects(), getAvailableLockers()])
    const me = currentUserId.value

    myObjects.value = objects.filter(
      (o) => o.user_id === me && (!o.status || o.status === 'available'),
    )
    lockers.value = avail
  } catch {
    toasts.error(t('dashDeposits.toastLoadError'))
  } finally {
    isLoading.value = false
  }
}

const showDeposit = ref(false)
const isDepositing = ref(false)
const form = reactive({ objectId: '', lockerId: '', weight: 0 })

const openDeposit = () => {
  form.objectId = myObjects.value[0]?.id ?? ''
  form.lockerId = lockers.value[0]?.id ?? ''
  form.weight = 0
  showDeposit.value = true
}

const submitDeposit = async () => {
  if (!form.objectId || !form.lockerId) return
  isDepositing.value = true
  try {
    const result = await depositObject({
      object_id: form.objectId,
      locker_id: form.lockerId,
      weight: form.weight || 0,
    })
    const obj = myObjects.value.find((o) => o.id === form.objectId)
    const locker = lockers.value.find((l) => l.id === form.lockerId)
    myDeposits.value.unshift({
      code: result.code,
      objectName: obj?.name ?? t('dashDeposits.defaultObjectName'),
      lockerName: locker?.name ?? t('dashDeposits.defaultLockerName'),
      expiry: result.expiry_date,
      score: result.score,
    })
    toasts.success(t('dashDeposits.toastDepositedWithCode'))
    showDeposit.value = false
    codeOpen.value = myDeposits.value[0] ?? null
    await load()
  } catch (e) {
    const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message
    toasts.error(msg === 'Locker is full' ? t('dashDeposits.toastLockerFull') : t('dashDeposits.toastDepositError'))
  } finally {
    isDepositing.value = false
  }
}

const codeOpen = ref<DepositedItem | null>(null)
const qrRef = ref<InstanceType<typeof QrCode> | null>(null)
const downloadQr = () => qrRef.value?.download()

const showRetrieve = ref(false)
const isRetrieving = ref(false)
const retrieveCode = ref('')

const submitRetrieve = async () => {
  const code = retrieveCode.value.trim().toUpperCase()
  if (!code) return
  isRetrieving.value = true
  try {
    await retrievePackage(code)
    toasts.success(t('dashDeposits.toastRetrievedSuccess'))
    showRetrieve.value = false
    retrieveCode.value = ''
    await load()
  } catch (e) {
    const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message
    const label =
      msg === 'Package has expired'
        ? t('dashDeposits.toastCodeExpired')
        : msg === 'Package already retrieved'
          ? t('dashDeposits.toastAlreadyRetrieved')
          : t('dashDeposits.toastInvalidCode')
    toasts.error(label)
  } finally {
    isRetrieving.value = false
  }
}

const selectedLocker = computed(() => lockers.value.find((l) => l.id === form.lockerId))

onMounted(() => {
  load()
  loadDeliveries()
})
</script>

<template>
  <DashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">{{ $t('dashDeposits.eyebrow') }}</span>
        <h1>{{ $t('dashDeposits.title') }}</h1>
        <p class="muted measure">
          {{ $t('dashDeposits.subtitle') }}
        </p>
      </div>
      <div class="layout-flex layout-gap-small">
        <button class="ghost medium" @click="showRetrieve = true">{{ $t('dashDeposits.retrieveObject') }}</button>
        <button class="primary medium" :disabled="!myObjects.length || !lockers.length" @click="openDeposit">
          {{ $t('dashDeposits.depositObject') }}
        </button>
      </div>
    </header>

    <p v-if="isLoading && !lockers.length" class="muted">{{ $t('common.loading') }}</p>

    <section v-if="sales.length" class="layout-flex layout-columns layout-gap-medium">
      <h3>{{ $t('dashDeposits.salesToDeposit') }}</h3>
      <p class="small muted">
        {{ $t('dashDeposits.salesHint') }}
      </p>
      <div class="layout-flex layout-columns layout-gap-small">
        <article
          v-for="d in sales"
          :key="d.package_id"
          class="dashboard-card layout-flex layout-justify-between layout-items-center"
          style="flex-wrap: wrap; gap: var(--space-3)"
        >
          <div>
            <h4 style="margin: 0">{{ d.object_name }}</h4>
            <span class="tiny muted">{{ d.locker_name }} · {{ d.locker_city }} · {{ d.price }}€</span>
          </div>
          <div class="layout-flex layout-gap-small">
            <button class="ghost small" @click="openDeliveryCode(d, 'deposit')">{{ $t('dashDeposits.codeAndQr') }}</button>
            <button class="primary small" @click="confirmSaleDeposit(d)">{{ $t('dashDeposits.iDeposited') }}</button>
          </div>
        </article>
      </div>
    </section>

    <section v-if="purchases.length" class="layout-flex layout-columns layout-gap-medium">
      <h3>{{ $t('dashDeposits.purchasesToRetrieve') }}</h3>
      <p class="small muted">
        {{ $t('dashDeposits.purchasesHint') }}
      </p>
      <div class="layout-flex layout-columns layout-gap-small">
        <article
          v-for="d in purchases"
          :key="d.package_id"
          class="dashboard-card layout-flex layout-justify-between layout-items-center"
          style="flex-wrap: wrap; gap: var(--space-3)"
        >
          <div>
            <h4 style="margin: 0">{{ d.object_name }}</h4>
            <span class="tiny muted">{{ d.locker_name }} · {{ d.locker_city }}</span>
          </div>
          <div class="layout-flex layout-gap-small">
            <button class="ghost small" @click="openDeliveryCode(d, 'retrieve')">{{ $t('dashDeposits.codeAndQr') }}</button>
            <button class="primary small" @click="retrievePurchase(d)">{{ $t('dashDeposits.retrieve') }}</button>
          </div>
        </article>
      </div>
    </section>

    <section v-if="myDeposits.length" class="layout-flex layout-columns layout-gap-medium">
      <h3>{{ $t('dashDeposits.recentDeposits') }}</h3>
      <div class="layout-flex layout-columns layout-gap-small">
        <article
          v-for="d in myDeposits"
          :key="d.code"
          class="dashboard-card layout-flex layout-justify-between layout-items-center"
          style="flex-wrap: wrap; gap: var(--space-3)"
        >
          <div>
            <h4 style="margin: 0">{{ d.objectName }}</h4>
            <span class="tiny muted">{{ $t('dashDeposits.depositMeta', { locker: d.lockerName, score: d.score, expiry: d.expiry.slice(0, 10) }) }}</span>
          </div>
          <button class="primary small" @click="codeOpen = d">{{ $t('dashDeposits.seeCode') }}</button>
        </article>
      </div>
    </section>

    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>{{ $t('dashDeposits.availableLockers') }}</h3>
      <p v-if="!lockers.length" class="muted small">{{ $t('dashDeposits.noLockersAvailable') }}</p>
      <div v-else class="dashboard-grid">
        <article v-for="l in lockers" :key="l.id" class="dashboard-card">
          <h4 style="margin: 0">{{ l.name }}</h4>
          <span class="tiny muted">{{ l.street }}, {{ l.zip_code }} {{ l.city }}</span>
          <div class="tiny" style="margin-top: var(--space-2)">
             {{ $t('dashDeposits.freeSlots', { available: l.available_slots, capacity: l.capacity }) }}
          </div>
        </article>
      </div>
    </section>

    <AppModal :open="showDeposit" :title="$t('dashDeposits.depositModalTitle')" @close="showDeposit = false">
      <form id="deposit-form" class="layout-flex layout-columns layout-gap-medium" @submit.prevent="submitDeposit">
        <div class="form-group">
          <label class="uppercase">{{ $t('dashDeposits.form.object') }}</label>
          <select v-model="form.objectId" class="primary medium full-width" required>
            <option v-for="o in myObjects" :key="o.id" :value="o.id">{{ o.name }}</option>
          </select>
          <p v-if="!myObjects.length" class="tiny muted">{{ $t('dashDeposits.form.noObjectAvailable') }}</p>
        </div>
        <div class="form-group">
          <label class="uppercase">{{ $t('dashDeposits.form.locker') }}</label>
          <select v-model="form.lockerId" class="primary medium full-width" required>
            <option v-for="l in lockers" :key="l.id" :value="l.id">
              {{ $t('dashDeposits.form.lockerOption', { name: l.name, city: l.city, available: l.available_slots }) }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="uppercase">{{ $t('dashDeposits.form.weight') }}</label>
          <input v-model.number="form.weight" type="number" min="0" class="primary medium full-width" />
        </div>
        <p v-if="selectedLocker" class="small muted">
          {{ $t('dashDeposits.form.codeExpiryNotice') }}
        </p>
      </form>
      <template #footer>
        <button class="ghost medium" @click="showDeposit = false">{{ $t('common.cancel') }}</button>
        <button
          type="submit"
          form="deposit-form"
          class="primary medium"
          :disabled="isDepositing || !form.objectId || !form.lockerId"
        >
          {{ isDepositing ? $t('dashDeposits.depositing') : $t('dashDeposits.depositAction') }}
        </button>
      </template>
    </AppModal>

    <AppModal :open="!!codeOpen" size="small" @close="codeOpen = null">
      <template #header>
        <div class="layout-flex layout-columns" style="gap: 4px">
          <span class="eyebrow">{{ $t('dashDeposits.retrievalCode') }}</span>
          <h3>{{ codeOpen?.objectName }}</h3>
        </div>
      </template>
      <div v-if="codeOpen" class="layout-flex layout-columns layout-items-center layout-gap-large">
        <div class="container-code">
          <span class="eyebrow">{{ $t('dashDeposits.containerCode') }}</span>
          <div class="container-code-digits">{{ codeOpen.code }}</div>
          <p class="small muted">{{ $t('dashDeposits.typeCodeOnKeypad') }}</p>
        </div>
        <QrCode ref="qrRef" :value="codeOpen.code" :size="160" />
        <p class="small muted center">
          {{ $t('dashDeposits.professionalScanNotice') }}
        </p>
      </div>
      <template #footer>
        <button class="ghost medium" @click="codeOpen = null">{{ $t('dashDeposits.close') }}</button>
        <button class="primary medium" @click="downloadQr">{{ $t('dashDeposits.printDownload') }}</button>
      </template>
    </AppModal>

    <AppModal :open="showRetrieve" :title="$t('dashDeposits.retrieveModalTitle')" @close="showRetrieve = false">
      <form id="retrieve-form" class="layout-flex layout-columns layout-gap-medium" @submit.prevent="submitRetrieve">
        <div class="form-group">
          <label class="uppercase">{{ $t('dashDeposits.form.retrievalCodeLabel') }}</label>
          <input
            v-model="retrieveCode"
            type="text"
            class="primary medium full-width mono"
            :placeholder="$t('dashDeposits.form.retrievalCodePlaceholder')"
            style="text-transform: uppercase"
            required
          />
        </div>
        <p class="small muted">{{ $t('dashDeposits.form.retrievalCodeHint') }}</p>
      </form>
      <template #footer>
        <button class="ghost medium" @click="showRetrieve = false">{{ $t('common.cancel') }}</button>
        <button
          type="submit"
          form="retrieve-form"
          class="primary medium"
          :disabled="isRetrieving || !retrieveCode.trim()"
        >
          {{ isRetrieving ? $t('dashDeposits.retrieving') : $t('dashDeposits.retrieve') }}
        </button>
      </template>
    </AppModal>

    <AppModal :open="!!deliveryCodeOpen" size="small" @close="deliveryCodeOpen = null">
      <template #header>
        <div class="layout-flex layout-columns" style="gap: 4px">
          <span class="eyebrow">{{
            deliveryCodeKind === 'deposit' ? $t('dashDeposits.depositCode') : $t('dashDeposits.withdrawalCode')
          }}</span>
          <h3>{{ deliveryCodeOpen?.object_name }}</h3>
        </div>
      </template>
      <div
        v-if="deliveryCodeOpen"
        class="layout-flex layout-columns layout-items-center layout-gap-large"
      >
        <div class="container-code">
          <span class="eyebrow">{{
            deliveryCodeKind === 'deposit' ? $t('dashDeposits.openLockerToDeposit') : $t('dashDeposits.openLockerToRetrieve')
          }}</span>
          <div class="container-code-digits">{{ deliveryCodeValue }}</div>
          <p class="small muted">{{ deliveryCodeOpen.locker_name }} · {{ deliveryCodeOpen.locker_city }}</p>
        </div>
        <QrCode :value="deliveryCodeValue" :size="160" />
        <p class="small muted center">{{ $t('dashDeposits.typeOrScanCode') }}</p>
      </div>
      <template #footer>
        <button class="ghost medium" @click="deliveryCodeOpen = null">{{ $t('dashDeposits.close') }}</button>
      </template>
    </AppModal>
  </DashboardLayout>
</template>
