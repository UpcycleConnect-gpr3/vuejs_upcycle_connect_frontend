<script setup lang="ts">
import { ref, computed } from 'vue'
import StaffDashboardLayout from '@/components/StaffDashboardLayout.vue'
import AppModal from '@/components/AppModal.vue'

type ReportStatus = 'signale' | 'en_attente' | 'traite'
type ReportAction = 'masque' | 'supprime' | 'ignore'

interface Report {
  id: number
  author: string
  excerpt: string
  reason: string
  reportedAt: string
  status: ReportStatus
  action: ReportAction | null
  thread: string
}

const activeTab = ref<ReportStatus>('signale')

const reports = ref<Report[]>([
  {
    id: 1,
    author: 'user#482',
    excerpt: 'Ce forum est nul, personne ne répond jamais et les conseils sont...',
    reason: 'Propos offensants',
    reportedAt: '2026-06-29',
    status: 'signale',
    action: null,
    thread: 'Discussion : Démarrer avec peu de budget',
  },
  {
    id: 2,
    author: 'user#117',
    excerpt: 'Achetez mes services sur ce lien [URL supprimé] pour obtenir des...',
    reason: 'Publicité non autorisée',
    reportedAt: '2026-06-28',
    status: 'signale',
    action: null,
    thread: 'Forum général : Ressources utiles',
  },
  {
    id: 3,
    author: 'user#305',
    excerpt: 'Je vends mes chutes de bois, contactez-moi en privé...',
    reason: 'Hors-sujet',
    reportedAt: '2026-06-27',
    status: 'signale',
    action: null,
    thread: 'Techniques : ponçage et finitions',
  },
  {
    id: 4,
    author: 'user#219',
    excerpt: "Quelqu'un peut m'aider à identifier ce meuble ? Photo en PJ.",
    reason: 'Doublon signalé',
    reportedAt: '2026-06-26',
    status: 'en_attente',
    action: null,
    thread: 'Identification de meubles anciens',
  },
  {
    id: 5,
    author: 'user#088',
    excerpt: "Attention arnaque ! Ce vendeur m'a escroqué de 150€...",
    reason: 'Fausses informations',
    reportedAt: '2026-06-25',
    status: 'en_attente',
    action: null,
    thread: "Retours d'expérience : achats",
  },
  {
    id: 6,
    author: 'user#341',
    excerpt: "Regardez mon magnifique projet : j'ai transformé une palette en...",
    reason: 'Spam',
    reportedAt: '2026-06-20',
    status: 'traite',
    action: 'ignore',
    thread: 'Vitrine projets communauté',
  },
  {
    id: 7,
    author: 'user#007',
    excerpt: "Ce n'est qu'un tas de vieilles ordures, pourquoi vous appelez ça...",
    reason: 'Propos offensants',
    reportedAt: '2026-06-18',
    status: 'traite',
    action: 'masque',
    thread: 'Débat : réemploi vs recyclage',
  },
  {
    id: 8,
    author: 'user#192',
    excerpt: 'Achetez maintenant au meilleur prix ce kit complet pour débuter...',
    reason: 'Publicité non autorisée',
    reportedAt: '2026-06-15',
    status: 'traite',
    action: 'supprime',
    thread: 'Forum général : Ressources utiles',
  },
])

const tabMeta: Record<ReportStatus, { label: string; badge: string }> = {
  signale: { label: 'Signalés', badge: 'badge--danger' },
  en_attente: { label: 'En attente', badge: 'badge--accent' },
  traite: { label: 'Traités', badge: 'badge--muted' },
}

const actionLabel: Record<ReportAction, string> = {
  masque: 'Masqué',
  supprime: 'Supprimé',
  ignore: 'Ignoré',
}

const actionBadge: Record<ReportAction, string> = {
  masque: 'badge--accent',
  supprime: 'badge--danger',
  ignore: 'badge--muted',
}

const filtered = computed(() => reports.value.filter((r) => r.status === activeTab.value))

function tabCount(status: ReportStatus): number {
  return reports.value.filter((r) => r.status === status).length
}

const confirmReport = ref<Report | null>(null)
const pendingAction = ref<ReportAction | null>(null)

function askAction(r: Report, action: ReportAction) {
  confirmReport.value = r
  pendingAction.value = action
}

function applyAction() {
  const r = confirmReport.value
  const action = pendingAction.value
  if (!r || !action) return
  const idx = reports.value.findIndex((x) => x.id === r.id)
  const existing = reports.value[idx]
  if (idx >= 0 && existing) {
    reports.value[idx] = { ...existing, status: 'traite', action }
  }
  confirmReport.value = null
  pendingAction.value = null
}

function cancelAction() {
  confirmReport.value = null
  pendingAction.value = null
}

const actionLabels: Record<ReportAction, string> = {
  masque: 'Masquer',
  supprime: 'Supprimer',
  ignore: 'Ignorer',
}

const confirmMessage = computed(() => {
  if (!confirmReport.value || !pendingAction.value) return ''
  const label = actionLabels[pendingAction.value]
  return `Confirmer l'action "${label}" pour le signalement de ${confirmReport.value.author} ?`
})
</script>

<template>
  <StaffDashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Forums</span>
        <h1>Modération des forums</h1>
        <p class="muted measure">Examinez et traitez les messages signalés par la communauté.</p>
      </div>
      <div class="layout-flex layout-gap-small">
        <span class="stat-tile" style="padding: var(--space-2) var(--space-4)">
          <span class="stat-tile-label">Signalés</span>
          <span class="stat-tile-value">{{ tabCount('signale') }}</span>
        </span>
        <span class="stat-tile" style="padding: var(--space-2) var(--space-4)">
          <span class="stat-tile-label">En attente</span>
          <span class="stat-tile-value">{{ tabCount('en_attente') }}</span>
        </span>
      </div>
    </header>

    <div class="layout-flex layout-gap-small">
      <button
        v-for="(meta, key) in tabMeta"
        :key="key"
        class="forum-tab"
        :class="{ active: activeTab === key }"
        @click="activeTab = key as ReportStatus"
      >
        {{ meta.label }}
        <span class="forum-tab-count">{{ tabCount(key as ReportStatus) }}</span>
      </button>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Auteur</th>
            <th>Fil de discussion</th>
            <th>Extrait du message</th>
            <th>Motif</th>
            <th>Date</th>
            <th v-if="activeTab === 'traite'">Action</th>
            <th v-else>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="6" style="text-align: center; padding: var(--space-8)">
              <span class="muted">Aucun signalement dans cet onglet.</span>
            </td>
          </tr>
          <tr v-for="r in filtered" :key="r.id">
            <td>
              <span class="mono small">{{ r.author }}</span>
            </td>
            <td class="small muted" style="max-width: 180px">{{ r.thread }}</td>
            <td style="max-width: 260px">
              <p
                class="small muted"
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
              >
                {{ r.excerpt }}
              </p>
            </td>
            <td>
              <span class="badge badge--danger">{{ r.reason }}</span>
            </td>
            <td class="mono small">{{ r.reportedAt }}</td>

            <td v-if="activeTab === 'traite'">
              <span v-if="r.action" class="badge" :class="actionBadge[r.action]">
                {{ actionLabel[r.action] }}
              </span>
            </td>

            <td v-else>
              <div class="layout-flex layout-gap-small">
                <button class="ghost small" @click="askAction(r, 'masque')">Masquer</button>
                <button
                  class="ghost small"
                  style="color: var(--destructive-color)"
                  @click="askAction(r, 'supprime')"
                >
                  Supprimer
                </button>
                <button class="ghost small" @click="askAction(r, 'ignore')">Ignorer</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppModal :open="!!confirmReport" size="small" @close="cancelAction">
      <template #header>
        <h3>Confirmer l'action</h3>
      </template>

      <div class="layout-flex layout-columns layout-gap-medium">
        <p>{{ confirmMessage }}</p>
        <div v-if="confirmReport" class="dashboard-card" style="padding: var(--space-3)">
          <div class="tiny uppercase muted" style="margin-bottom: var(--space-1)">Extrait</div>
          <p class="small">"{{ confirmReport.excerpt }}"</p>
          <div class="tiny muted" style="margin-top: var(--space-2)">
            — {{ confirmReport.author }} · {{ confirmReport.reportedAt }}
          </div>
        </div>
        <p class="small muted">
          Cette action sera enregistrée et le signalement passera en statut "Traité".
        </p>
      </div>

      <template #footer>
        <button class="ghost medium" @click="cancelAction">Annuler</button>
        <button
          class="primary medium"
          :style="{
            background: pendingAction === 'supprime' ? 'var(--destructive-color)' : undefined,
          }"
          @click="applyAction"
        >
          Confirmer
        </button>
      </template>
    </AppModal>
  </StaffDashboardLayout>
</template>
