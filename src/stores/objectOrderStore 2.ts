import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import {
  createObjectOrder,
  deleteObjectOrder,
  getObjectOrderById,
  getObjectOrders,
} from '@/api/clients/objectOrderClient'
import { useApi } from '@/composables/useApi'
import type { ObjectOrder, ObjectOrderPayload } from '@/types'

export const useObjectOrderStore = defineStore(
  'objectOrder',
  () => {
    const objectOrders = ref<ObjectOrder[]>([])
    const currentObjectOrder = ref<ObjectOrder | null>(null)
    const { isLoading, error, request } = useApi()

    const fetchObjectOrders = async () => {
      const data = await request(getObjectOrders, 'Impossible de charger les lignes de commande')
      if (data) objectOrders.value = data
    }

    const fetchObjectOrderById = async (id: number) => {
      const data = await request(
        () => getObjectOrderById(id),
        'Impossible de charger la ligne de commande',
      )
      if (data) currentObjectOrder.value = data
    }

    const addObjectOrder = async (payload: ObjectOrderPayload) => {
      const data = await request(
        () => createObjectOrder(payload),
        'Impossible de créer la ligne de commande',
      )
      if (data) objectOrders.value.push(data)
      return data
    }

    const removeObjectOrder = async (id: number) => {
      const result = await request(
        () => deleteObjectOrder(id).then(() => true),
        'Impossible de supprimer la ligne de commande',
      )
      if (result) {
        objectOrders.value = objectOrders.value.filter((o) => o.id !== id)
        if (currentObjectOrder.value?.id === id) currentObjectOrder.value = null
      }
    }

    const getObjectOrderFromStore = (id: number): ObjectOrder | undefined =>
      objectOrders.value.find((o) => o.id === id)

    return {
      objectOrders,
      currentObjectOrder,
      isLoading,
      error,
      fetchObjectOrders,
      fetchObjectOrderById,
      addObjectOrder,
      removeObjectOrder,
      getObjectOrderFromStore,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['objectOrders', 'currentObjectOrder'],
    },
  },
)
