<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'

interface Order {
  id: string
  date: string
  item: string
  kind: 'Formation' | 'Service' | 'Événement'
  amount: number
  status: 'paid' | 'refunded'
}

const orders = ref<Order[]>([
  { id: 'ORD-2026-042', date: '2026-04-22', item: 'Initiation à l\'upcycling N1', kind: 'Formation', amount: 35, status: 'paid' },
  { id: 'ORD-2026-038', date: '2026-04-15', item: 'Diagnostic mobilier à domicile', kind: 'Service', amount: 60, status: 'paid' },
  { id: 'ORD-2026-027', date: '2026-03-28', item: 'Workshop textile', kind: 'Formation', amount: 45, status: 'refunded' },
  { id: 'ORD-2026-019', date: '2026-03-12', item: 'Restaurer un meuble', kind: 'Formation', amount: 85, status: 'paid' },
])

const total = orders.value.filter((o) => o.status === 'paid').reduce((s, o) => s + o.amount, 0)
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
        <span class="stat-tile-label">Total dépensé</span>
        <span class="stat-tile-value">{{ total }}€</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">Commandes</span>
        <span class="stat-tile-value">{{ orders.length }}</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-label">Remboursements</span>
        <span class="stat-tile-value">{{ orders.filter((o) => o.status === 'refunded').length }}</span>
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
            <th>Produit</th>
            <th>Type</th>
            <th>Montant</th>
            <th>Statut</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in orders" :key="o.id">
            <td class="mono">{{ o.id }}</td>
            <td class="mono">{{ o.date }}</td>
            <td style="font-weight: 600;">{{ o.item }}</td>
            <td><span class="badge">{{ o.kind }}</span></td>
            <td class="mono">{{ o.amount }}€</td>
            <td>
              <span class="badge" :class="o.status === 'paid' ? 'badge--success' : 'badge--muted'">
                {{ o.status === 'paid' ? 'Payée' : 'Remboursée' }}
              </span>
            </td>
            <td style="text-align: right;">
              <a class="ghost small">Facture PDF</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </DashboardLayout>
</template>
