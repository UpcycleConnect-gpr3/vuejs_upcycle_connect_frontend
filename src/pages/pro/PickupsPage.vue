<script setup lang="ts">
import { ref } from 'vue'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'
import { getPackageByCode, retrievePackage } from '@/api/clients/depositClient'
import { useToastsStore } from '@/stores/toasts'
import type { PackageInfo } from '@/types'

const toasts = useToastsStore()

const code = ref('')
const isChecking = ref(false)
const isRetrieving = ref(false)
const found = ref<PackageInfo | null>(null)

// Historique des récupérations de cette session.
const collected = ref<{ code: string; objectId: string }[]>([])

const check = async () => {
  const c = code.value.trim().toUpperCase()
  if (!c) return
  isChecking.value = true
  found.value = null
  try {
    const pkg = await getPackageByCode(c)
    if (pkg.status !== 'deposited') {
      toasts.error('Cet objet a déjà été récupéré ou n\'est plus disponible.')
      return
    }
    found.value = pkg
  } catch {
    toasts.error('Code introuvable.')
  } finally {
    isChecking.value = false
  }
}

const confirmPickup = async () => {
  if (!found.value) return
  isRetrieving.value = true
  try {
    await retrievePackage(found.value.code)
    collected.value.unshift({ code: found.value.code, objectId: found.value.object_id })
    toasts.success('Objet récupéré — le conteneur s\'ouvre.')
    found.value = null
    code.value = ''
  } catch (e) {
    const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message
    toasts.error(msg === 'Package has expired' ? 'Ce code a expiré.' : 'Récupération impossible.')
  } finally {
    isRetrieving.value = false
  }
}
</script>

<template>
  <ProDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Conteneurs & boîtes</span>
        <h1>Récupérations</h1>
        <p class="muted measure">
          Saisissez le code du conteneur (fourni par le déposant) pour récupérer l'objet et ouvrir
          le tiroir.
        </p>
      </div>
    </header>

    <section class="dashboard-card" style="max-width: 520px">
      <form class="layout-flex layout-columns layout-gap-medium" @submit.prevent="check">
        <div class="form-group">
          <label class="uppercase">Code du conteneur</label>
          <div class="layout-flex layout-gap-small">
            <input
              v-model="code"
              type="text"
              class="primary medium full-width mono"
              placeholder="Ex : XSWFVMVX"
              style="text-transform: uppercase"
              required
            />
            <button type="submit" class="ghost medium" :disabled="isChecking || !code.trim()">
              {{ isChecking ? '…' : 'Vérifier' }}
            </button>
          </div>
        </div>
      </form>

      <div v-if="found" class="layout-flex layout-columns layout-gap-medium" style="margin-top: var(--space-4)">
        <div class="alert alert--success">
          <span>
            Objet trouvé dans le conteneur — code <span class="mono">{{ found.code }}</span
            >, expire le {{ found.expiry_date.slice(0, 10) }}.
          </span>
        </div>
        <button class="primary medium" :disabled="isRetrieving" @click="confirmPickup">
          {{ isRetrieving ? 'Ouverture…' : 'Récupérer et ouvrir le conteneur' }}
        </button>
      </div>
    </section>

    <section v-if="collected.length" class="layout-flex layout-columns layout-gap-medium">
      <h3>Récupérés dans cette session</h3>
      <ul class="layout-flex layout-columns layout-gap-small">
        <li v-for="c in collected" :key="c.code" class="dashboard-card">
          <span class="mono">{{ c.code }}</span> — objet <span class="mono">{{ c.objectId.slice(0, 8) }}…</span> récupéré ✅
        </li>
      </ul>
    </section>
  </ProDashboardLayout>
</template>
