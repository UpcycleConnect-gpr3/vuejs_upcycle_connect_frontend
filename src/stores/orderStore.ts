import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  updateOrder,
} from '@/api/clients/orderClient'
import { useApi } from '@/composables/useApi'
import type { Order, OrderPayload } from '@/types'

export const useOrderStore = defineStore(
  'order',
  () => {
    const orders = ref<Order[]>([])
    const currentOrder = ref<Order | null>(null)
    const { isLoading, error, request } = useApi()

    const fetchOrders = async () => {
      const data = await request(getOrders, 'Impossible de charger les commandes')
      if (data) orders.value = data
    }

    const fetchOrderById = async (id: string) => {
      const data = await request(() => getOrderById(id), 'Impossible de charger la commande')
      if (data) currentOrder.value = data
    }

    const addOrder = async (payload: OrderPayload) => {
      const data = await request(() => createOrder(payload), 'Impossible de créer la commande')
      if (data) orders.value.push(data)
      return data
    }

    const editOrder = async (id: string, payload: OrderPayload) => {
      const data = await request(
        () => updateOrder(id, payload),
        'Impossible de modifier la commande',
      )
      if (data) {
        const index = orders.value.findIndex((o) => o.id === id)
        if (index !== -1) orders.value[index] = data
        if (currentOrder.value?.id === id) currentOrder.value = data
      }
      return data
    }

    const removeOrder = async (id: string) => {
      const result = await request(
        () => deleteOrder(id).then(() => true),
        'Impossible de supprimer la commande',
      )
      if (result) {
        orders.value = orders.value.filter((o) => o.id !== id)
        if (currentOrder.value?.id === id) currentOrder.value = null
      }
    }

    const getOrderFromStore = (id: string): Order | undefined =>
      orders.value.find((o) => o.id === id)

    return {
      orders,
      currentOrder,
      isLoading,
      error,
      fetchOrders,
      fetchOrderById,
      addOrder,
      editOrder,
      removeOrder,
      getOrderFromStore,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['orders', 'currentOrder'],
    },
  },
)
