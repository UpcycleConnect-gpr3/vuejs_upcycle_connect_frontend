import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import {
  createLocker,
  deleteLocker,
  getLockerById,
  getLockers,
  updateLocker,
} from '@/api/clients/lockerClient'
import { useApi } from '@/composables/useApi'
import type { Locker, LockerPayload } from '@/types'

export const useLockerStore = defineStore(
  'locker',
  () => {
    const lockers = ref<Locker[]>([])
    const currentLocker = ref<Locker | null>(null)
    const { isLoading, error, request } = useApi()

    const fetchLockers = async () => {
      const data = await request(getLockers, 'Impossible de charger les casiers')
      if (data) lockers.value = data
    }

    const fetchLockerById = async (id: string) => {
      const data = await request(() => getLockerById(id), 'Impossible de charger le casier')
      if (data) currentLocker.value = data
    }

    const addLocker = async (payload: LockerPayload) => {
      const data = await request(() => createLocker(payload), 'Impossible de créer le casier')
      if (data) lockers.value.push(data)
      return data
    }

    const editLocker = async (id: string, payload: LockerPayload) => {
      const data = await request(
        () => updateLocker(id, payload),
        'Impossible de modifier le casier',
      )
      if (data) {
        const index = lockers.value.findIndex((l) => l.id === id)
        if (index !== -1) lockers.value[index] = data
        if (currentLocker.value?.id === id) currentLocker.value = data
      }
      return data
    }

    const removeLocker = async (id: string) => {
      const result = await request(
        () => deleteLocker(id).then(() => true),
        'Impossible de supprimer le casier',
      )
      if (result) {
        lockers.value = lockers.value.filter((l) => l.id !== id)
        if (currentLocker.value?.id === id) currentLocker.value = null
      }
    }

    const getLockerFromStore = (id: string): Locker | undefined =>
      lockers.value.find((l) => l.id === id)

    return {
      lockers,
      currentLocker,
      isLoading,
      error,
      fetchLockers,
      fetchLockerById,
      addLocker,
      editLocker,
      removeLocker,
      getLockerFromStore,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['lockers', 'currentLocker'],
    },
  },
)
