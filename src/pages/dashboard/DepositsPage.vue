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
import type { DeliverySummary, Locker, UpcycleObject } from '@/types'

const toasts = useToastsStore()
const { currentUserId } = useCurrentUser()

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
    toasts.success('Objet déposé — le casier est ouvert')
    await loadDeliveries()
  } catch {
    toasts.error('Dépôt impossible.')
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
    toasts.success('Objet récupéré — le casier est ouvert')
    await loadDeliveries()
  } catch {
    toasts.error('Récupération impossible.')
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
    toasts.error('Impossible de charger vos objets et les conteneurs disponibles.')
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
      objectName: obj?.name ?? 'Objet',
      lockerName: locker?.name ?? 'Conteneur',
      expiry: result.expiry_date,
      score: result.score,
    })
    toasts.success('Objet déposé — voici votre code de récupération')
    showDeposit.value = false
    codeOpen.value = myDeposits.value[0] ?? null
    await load()
  } catch (e) {
    const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message
    toasts.error(msg === 'Locker is full' ? 'Ce conteneur est plein.' : 'Dépôt impossible.')
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
    toasts.success('Objet récupéré avec succès !')
    showRetrieve.value = false
    retrieveCode.value = ''
    await load()
  } catch (e) {
    const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message
    const label =
      msg === 'Package has expired'
        ? 'Ce code a expiré.'
        : msg === 'Package already retrieved'
          ? 'Cet objet a déjà été récupéré.'
          : 'Code invalide.'
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
        <span class="eyebrow">Dépôt en conteneur</span>
        <h1>Conteneurs</h1>
        <p class="muted measure">
          Déposez un de vos objets dans un conteneur et recevez un code. Un professionnel peut
          ensuite le récupérer avec ce code.
        </p>
      </div>
      <div class="layout-flex layout-gap-small">
        <button class="ghost medium" @click="showRetrieve = true">Récupérer un objet</button>
        <button class="primary medium" :disabled="!myObjects.length || !lockers.length" @click="openDeposit">
          + Déposer un objet
        </button>
      </div>
    </header>

    <p v-if="isLoading && !lockers.length" class="muted">Chargement…</p>

    <section v-if="sales.length" class="layout-flex layout-columns layout-gap-medium">
      <h3>Mes ventes à déposer</h3>
      <p class="small muted">
        Objets vendus : déposez-les dans le casier choisi par l'acheteur avec votre code de dépôt.
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
            <button class="ghost small" @click="openDeliveryCode(d, 'deposit')">Code + QR</button>
            <button class="primary small" @click="confirmSaleDeposit(d)">J'ai déposé</button>
          </div>
        </article>
      </div>
    </section>

    <section v-if="purchases.length" class="layout-flex layout-columns layout-gap-medium">
      <h3>Mes achats à récupérer</h3>
      <p class="small muted">
        Objets achetés, déposés en casier : récupérez-les avec votre code de retrait.
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
            <button class="ghost small" @click="openDeliveryCode(d, 'retrieve')">Code + QR</button>
            <button class="primary small" @click="retrievePurchase(d)">Récupérer</button>
          </div>
        </article>
      </div>
    </section>

    <section v-if="myDeposits.length" class="layout-flex layout-columns layout-gap-medium">
      <h3>Mes dépôts récents</h3>
      <div class="layout-flex layout-columns layout-gap-small">
        <article
          v-for="d in myDeposits"
          :key="d.code"
          class="dashboard-card layout-flex layout-justify-between layout-items-center"
          style="flex-wrap: wrap; gap: var(--space-3)"
        >
          <div>
            <h4 style="margin: 0">{{ d.objectName }}</h4>
            <span class="tiny muted">{{ d.lockerName }} · +{{ d.score }} kg CO₂ · expire le {{ d.expiry.slice(0, 10) }}</span>
          </div>
          <button class="primary small" @click="codeOpen = d">Voir le code</button>
        </article>
      </div>
    </section>

    <section class="layout-flex layout-columns layout-gap-medium">
      <h3>Conteneurs disponibles</h3>
      <p v-if="!lockers.length" class="muted small">Aucun conteneur disponible pour le moment.</p>
      <div v-else class="dashboard-grid">
        <article v-for="l in lockers" :key="l.id" class="dashboard-card">
          <h4 style="margin: 0">{{ l.name }}</h4>
          <span class="tiny muted">{{ l.street }}, {{ l.zip_code }} {{ l.city }}</span>
          <div class="tiny" style="margin-top: var(--space-2)">
             {{ l.available_slots }} / {{ l.capacity }} places libres
          </div>
        </article>
      </div>
    </section>

    <AppModal :open="showDeposit" title="Déposer un objet" @close="showDeposit = false">
      <form id="deposit-form" class="layout-flex layout-columns layout-gap-medium" @submit.prevent="submitDeposit">
        <div class="form-group">
          <label class="uppercase">Objet</label>
          <select v-model="form.objectId" class="primary medium full-width" required>
            <option v-for="o in myObjects" :key="o.id" :value="o.id">{{ o.name }}</option>
          </select>
          <p v-if="!myObjects.length" class="tiny muted">Vous n'avez aucun objet disponible à déposer.</p>
        </div>
        <div class="form-group">
          <label class="uppercase">Conteneur</label>
          <select v-model="form.lockerId" class="primary medium full-width" required>
            <option v-for="l in lockers" :key="l.id" :value="l.id">
              {{ l.name }} — {{ l.city }} ({{ l.available_slots }} libres)
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="uppercase">Poids (kg) — optionnel</label>
          <input v-model.number="form.weight" type="number" min="0" class="primary medium full-width" />
        </div>
        <p v-if="selectedLocker" class="small muted">
          Après validation, un code s'affichera pour ouvrir le tiroir du conteneur. Le code expire
          sous 7 jours.
        </p>
      </form>
      <template #footer>
        <button class="ghost medium" @click="showDeposit = false">Annuler</button>
        <button
          type="submit"
          form="deposit-form"
          class="primary medium"
          :disabled="isDepositing || !form.objectId || !form.lockerId"
        >
          {{ isDepositing ? 'Dépôt…' : 'Déposer' }}
        </button>
      </template>
    </AppModal>

    <AppModal :open="!!codeOpen" size="small" @close="codeOpen = null">
      <template #header>
        <div class="layout-flex layout-columns" style="gap: 4px">
          <span class="eyebrow">Code de récupération</span>
          <h3>{{ codeOpen?.objectName }}</h3>
        </div>
      </template>
      <div v-if="codeOpen" class="layout-flex layout-columns layout-items-center layout-gap-large">
        <div class="container-code">
          <span class="eyebrow">Code conteneur</span>
          <div class="container-code-digits">{{ codeOpen.code }}</div>
          <p class="small muted">Tapez ce code sur le clavier du conteneur pour ouvrir le tiroir.</p>
        </div>
        <QrCode ref="qrRef" :value="codeOpen.code" :size="160" />
        <p class="small muted center">
          Le professionnel scanne ce QR (ou saisit le code) pour récupérer l'objet.
        </p>
      </div>
      <template #footer>
        <button class="ghost medium" @click="codeOpen = null">Fermer</button>
        <button class="primary medium" @click="downloadQr">Imprimer / Télécharger</button>
      </template>
    </AppModal>

    <AppModal :open="showRetrieve" title="Récupérer un objet" @close="showRetrieve = false">
      <form id="retrieve-form" class="layout-flex layout-columns layout-gap-medium" @submit.prevent="submitRetrieve">
        <div class="form-group">
          <label class="uppercase">Code de récupération</label>
          <input
            v-model="retrieveCode"
            type="text"
            class="primary medium full-width mono"
            placeholder="Ex : XSWFVMVX"
            style="text-transform: uppercase"
            required
          />
        </div>
        <p class="small muted">Saisissez le code fourni au dépôt pour récupérer l'objet.</p>
      </form>
      <template #footer>
        <button class="ghost medium" @click="showRetrieve = false">Annuler</button>
        <button
          type="submit"
          form="retrieve-form"
          class="primary medium"
          :disabled="isRetrieving || !retrieveCode.trim()"
        >
          {{ isRetrieving ? 'Récupération…' : 'Récupérer' }}
        </button>
      </template>
    </AppModal>

    <AppModal :open="!!deliveryCodeOpen" size="small" @close="deliveryCodeOpen = null">
      <template #header>
        <div class="layout-flex layout-columns" style="gap: 4px">
          <span class="eyebrow">{{
            deliveryCodeKind === 'deposit' ? 'Code de dépôt' : 'Code de retrait'
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
            deliveryCodeKind === 'deposit' ? 'Ouvrir le casier pour déposer' : 'Ouvrir le casier pour récupérer'
          }}</span>
          <div class="container-code-digits">{{ deliveryCodeValue }}</div>
          <p class="small muted">{{ deliveryCodeOpen.locker_name }} · {{ deliveryCodeOpen.locker_city }}</p>
        </div>
        <QrCode :value="deliveryCodeValue" :size="160" />
        <p class="small muted center">Tapez le code ou scannez le QR sur le casier.</p>
      </div>
      <template #footer>
        <button class="ghost medium" @click="deliveryCodeOpen = null">Fermer</button>
      </template>
    </AppModal>
  </DashboardLayout>
</template>
