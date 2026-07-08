<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import ProDashboardLayout from '@/components/ProDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'
import { getAds, createAd, updateAd, deleteAd } from '@/api/clients/adClient'
import { useToastsStore } from '@/stores/toasts'
import type { Ad } from '@/types'

const toasts = useToastsStore()

const ads = ref<Ad[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const showNewModal = ref(false)

const form = reactive({ title: '', description: '', budget: 100 })

const totalBudget = computed(() => ads.value.reduce((sum, a) => sum + a.budget, 0))
const activeCount = computed(() => ads.value.filter((a) => a.status === 'active').length)

const statusLabel = (s: string) => (s === 'active' ? 'Active' : 'En pause')

const load = async () => {
  isLoading.value = true
  try {
    ads.value = await getAds()
  } catch {
    toasts.error('Impossible de charger les publicités.')
  } finally {
    isLoading.value = false
  }
}

const submitCreate = async () => {
  if (!form.title.trim()) return
  isSaving.value = true
  try {
    await createAd({
      title: form.title.trim(),
      description: form.description.trim(),
      budget: form.budget,
      status: 'active',
    })
    toasts.success('Publicité créée')
    showNewModal.value = false
    Object.assign(form, { title: '', description: '', budget: 100 })
    await load()
  } catch {
    toasts.error('Création impossible.')
  } finally {
    isSaving.value = false
  }
}

const toggleStatus = async (ad: Ad) => {
  const next = ad.status === 'active' ? 'paused' : 'active'
  try {
    await updateAd(ad.id, {
      title: ad.title,
      description: ad.description,
      budget: ad.budget,
      status: next,
    })
    await load()
  } catch {
    toasts.error('Mise à jour impossible.')
  }
}

const remove = async (ad: Ad) => {
  try {
    await deleteAd(ad.id)
    toasts.success('Publicité supprimée')
    await load()
  } catch {
    toasts.error('Suppression impossible.')
  }
}

onMounted(load)
</script>

<template>
  <ProDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Publicité</span>
        <h1>Mes campagnes</h1>
        <p class="muted measure">
          Sponsorisez vos objets et projets pour gagner en visibilité auprès de la communauté.
        </p>
      </div>
      <button class="primary medium" @click="showNewModal = true">+ Nouvelle campagne</button>
    </header>

    <div class="stats-row">
      <div class="stat-tile">
        <span class="stat-tile-label">Campagnes actives</span>
        <span class="stat-tile-value">{{ activeCount }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">Budget total</span>
        <span class="stat-tile-value">{{ totalBudget }}€</span>
      </div>
    </div>

    <p v-if="isLoading && !ads.length" class="muted">Chargement…</p>

    <div v-else-if="ads.length" class="dashboard-grid">
      <article v-for="ad in ads" :key="ad.id" class="dashboard-card">
        <div class="card-header">
          <div class="layout-flex layout-gap-small">
            <span class="badge" :class="ad.status === 'active' ? 'badge--success' : 'badge--muted'">
              {{ statusLabel(ad.status) }}
            </span>
          </div>
          <h4 style="margin-top: var(--space-1)">{{ ad.title }}</h4>
        </div>
        <p class="small muted">{{ ad.description || 'Sans description' }}</p>
        <div class="tiny muted" style="margin-top: var(--space-2)">Budget : {{ ad.budget }}€</div>
        <div class="layout-flex layout-gap-small" style="margin-top: var(--space-3); flex-wrap: wrap">
          <button class="ghost small" @click="toggleStatus(ad)">
            {{ ad.status === 'active' ? ' Mettre en pause' : '▶ Activer' }}
          </button>
          <button class="ghost small" @click="remove(ad)">Supprimer</button>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <p>Aucune campagne pour l'instant.</p>
      <button class="primary medium" @click="showNewModal = true">
        + Créer ma première campagne
      </button>
    </div>

    <AppModal
      :open="showNewModal"
      size="medium"
      title="Nouvelle campagne"
      @close="showNewModal = false"
    >
      <form
        id="new-ad-form"
        class="layout-flex layout-columns layout-gap-medium"
        @submit.prevent="submitCreate"
      >
        <div class="form-group">
          <label class="uppercase">Titre de la campagne</label>
          <input
            v-model="form.title"
            type="text"
            class="primary medium full-width"
            placeholder="Ex : Mise en avant chaise design"
            required
          />
        </div>
        <div class="form-group">
          <label class="uppercase">Description</label>
          <textarea
            v-model="form.description"
            class="primary full-width"
            rows="3"
            placeholder="Objet ou projet sponsorisé, message…"
          ></textarea>
        </div>
        <div class="form-group">
          <label class="uppercase">Budget (€)</label>
          <input
            v-model.number="form.budget"
            type="number"
            min="0"
            step="10"
            class="primary medium full-width"
          />
        </div>
      </form>
      <template #footer>
        <button class="ghost medium" @click="showNewModal = false">Annuler</button>
        <button
          type="submit"
          form="new-ad-form"
          class="primary medium"
          :disabled="isSaving || !form.title.trim()"
        >
          {{ isSaving ? 'Création…' : 'Lancer la campagne' }}
        </button>
      </template>
    </AppModal>
  </ProDashboardLayout>
</template>
