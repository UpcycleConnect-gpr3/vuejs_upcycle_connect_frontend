import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import {
  createDeliveryMethod,
  deleteDeliveryMethod,
  getDeliveryMethodById,
  getDeliveryMethods,
  updateDeliveryMethod,
} from '@/api/clients/deliveryMethodClient'
import { useApi } from '@/composables/useApi'
import type { DeliveryMethod, DeliveryMethodPayload } from '@/types'

export const useDeliveryMethodStore = defineStore(
  'deliveryMethod',
  () => {
    const deliveryMethods = ref<DeliveryMethod[]>([])
    const currentDeliveryMethod = ref<DeliveryMethod | null>(null)
    const { isLoading, error, request } = useApi()

    const fetchDeliveryMethods = async () => {
      const data = await request(getDeliveryMethods, 'Impossible de charger les modes de livraison')
      if (data) deliveryMethods.value = data
    }

    const fetchDeliveryMethodById = async (id: number) => {
      const data = await request(
        () => getDeliveryMethodById(id),
        'Impossible de charger le mode de livraison',
      )
      if (data) currentDeliveryMethod.value = data
    }

    const addDeliveryMethod = async (payload: DeliveryMethodPayload) => {
      const data = await request(
        () => createDeliveryMethod(payload),
        'Impossible de créer le mode de livraison',
      )
      if (data) deliveryMethods.value.push(data)
      return data
    }

    const editDeliveryMethod = async (id: number, payload: DeliveryMethodPayload) => {
      const data = await request(
        () => updateDeliveryMethod(id, payload),
        'Impossible de modifier le mode de livraison',
      )
      if (data) {
        const index = deliveryMethods.value.findIndex((m) => m.id === id)
        if (index !== -1) deliveryMethods.value[index] = data
        if (currentDeliveryMethod.value?.id === id) currentDeliveryMethod.value = data
      }
      return data
    }

    const removeDeliveryMethod = async (id: number) => {
      const result = await request(
        () => deleteDeliveryMethod(id).then(() => true),
        'Impossible de supprimer le mode de livraison',
      )
      if (result) {
        deliveryMethods.value = deliveryMethods.value.filter((m) => m.id !== id)
        if (currentDeliveryMethod.value?.id === id) currentDeliveryMethod.value = null
      }
    }

    const getDeliveryMethodFromStore = (id: number): DeliveryMethod | undefined =>
      deliveryMethods.value.find((m) => m.id === id)

    return {
      deliveryMethods,
      currentDeliveryMethod,
      isLoading,
      error,
      fetchDeliveryMethods,
      fetchDeliveryMethodById,
      addDeliveryMethod,
      editDeliveryMethod,
      removeDeliveryMethod,
      getDeliveryMethodFromStore,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['deliveryMethods', 'currentDeliveryMethod'],
    },
  },
)
