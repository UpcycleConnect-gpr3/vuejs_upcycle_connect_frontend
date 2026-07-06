import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import {
  createOrderDeliveryMethod,
  deleteOrderDeliveryMethod,
  getOrderDeliveryMethods,
} from '@/api/clients/orderDeliveryMethodClient'
import { useApi } from '@/composables/useApi'
import type { OrderDeliveryMethod, OrderDeliveryMethodPayload } from '@/types'

export const useOrderDeliveryMethodStore = defineStore(
  'orderDeliveryMethod',
  () => {
    const orderDeliveryMethods = ref<OrderDeliveryMethod[]>([])
    const { isLoading, error, request } = useApi()

    const fetchOrderDeliveryMethods = async () => {
      const data = await request(
        getOrderDeliveryMethods,
        'Impossible de charger les livraisons de commande',
      )
      if (data) orderDeliveryMethods.value = data
    }

    const addOrderDeliveryMethod = async (payload: OrderDeliveryMethodPayload) => {
      const data = await request(
        () => createOrderDeliveryMethod(payload),
        'Impossible de créer la livraison de commande',
      )
      if (data) orderDeliveryMethods.value.push(data)
      return data
    }

    const removeOrderDeliveryMethod = async (orderId: string, deliveryMethodId: number) => {
      const result = await request(
        () => deleteOrderDeliveryMethod(orderId, deliveryMethodId).then(() => true),
        'Impossible de supprimer la livraison de commande',
      )
      if (result) {
        orderDeliveryMethods.value = orderDeliveryMethods.value.filter(
          (o) => !(o.order_id === orderId && o.delivery_method_id === deliveryMethodId),
        )
      }
    }

    return {
      orderDeliveryMethods,
      isLoading,
      error,
      fetchOrderDeliveryMethods,
      addOrderDeliveryMethod,
      removeOrderDeliveryMethod,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['orderDeliveryMethods'],
    },
  },
)
