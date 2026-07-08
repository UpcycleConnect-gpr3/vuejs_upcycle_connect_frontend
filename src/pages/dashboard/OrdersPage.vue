<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { getMyOrders } from '@/services/upcycle'
import { useToastsStore } from '@/stores/toasts'

const toasts = useToastsStore()

interface Order {
  id: string
  date: string
  address: string
}

function formatAddress(street?: string, city?: string, zip?: string): string {
  return [street, [zip, city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
}

const orders = ref<Order[]>([
  {
    id: 'ORD-2026-042',
    date: '2026-04-22',
    address: '12 rue des Lilas, 75011 Paris',
  },
  {
    id: 'ORD-2026-038',
    date: '2026-04-15',
    address: '8 avenue de la République, 75011 Paris',
  },
  {
    id: 'ORD-2026-027',
    date: '2026-03-28',
    address: '3 place Bastille, 75004 Paris',
  },
  {
    id: 'ORD-2026-019',
    date: '2026-03-12',
    address: '45 rue du Faubourg, 75010 Paris',
  },
])

onMounted(async () => {
  try {
    const data = await getMyOrders()
    if (Array.isArray(data) && data.length) {
      orders.value = data.map(
        (o): Order => ({
          id: String(o.id),
          date: (o.created_at as string)?.slice(0, 10) ?? '',
          address: formatAddress(o.street, o.city, o.zip_code),
        }),
      )
    }
  } catch {
    toasts.error('Impossible de charger vos commandes, affichage des données de démonstration.')
  }
})
</script>

<template>
  <DashboardLayout>
    <header class="dashboard-page-header">
      <div>
        <span class="eyebrow">Historique</span>
        <h1>Mes commandes</h1>
        <p class="muted measure">Toutes vos réservations payées et factures téléchargeables.</p>
      </div>
    </header>

    <div class="stats-row">
      <div class="stat-tile">
        <span class="stat-tile-label">Commandes</span>
        <span class="stat-tile-value">{{ orders.length }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">Cette année</span>
        <span class="stat-tile-value">{{ orders.length }}</span>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Référence</th>
            <th>Date</th>
            <th>Adresse</th>
            <th style="text-align: right">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in orders" :key="o.id">
            <td class="mono">{{ o.id }}</td>
            <td class="mono">{{ o.date }}</td>
            <td>{{ o.address }}</td>
            <td style="text-align: right">
              <a class="ghost small">Facture PDF</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </DashboardLayout>
</template>
