import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import {
  createPackage,
  deletePackage,
  getPackageById,
  getPackages,
  updatePackage,
} from '@/api/clients/packageClient'
import { useApi } from '@/composables/useApi'
import type { Package, PackagePayload } from '@/types'

export const usePackageStore = defineStore(
  'package',
  () => {
    const packages = ref<Package[]>([])
    const currentPackage = ref<Package | null>(null)
    const { isLoading, error, request } = useApi()

    const fetchPackages = async () => {
      const data = await request(getPackages, 'Impossible de charger les colis')
      if (data) packages.value = data
    }

    const fetchPackageById = async (id: string) => {
      const data = await request(() => getPackageById(id), 'Impossible de charger le colis')
      if (data) currentPackage.value = data
    }

    const addPackage = async (payload: PackagePayload) => {
      const data = await request(() => createPackage(payload), 'Impossible de créer le colis')
      if (data) packages.value.push(data)
      return data
    }

    const editPackage = async (id: string, payload: PackagePayload) => {
      const data = await request(
        () => updatePackage(id, payload),
        'Impossible de modifier le colis',
      )
      if (data) {
        const index = packages.value.findIndex((p) => p.id === id)
        if (index !== -1) packages.value[index] = data
        if (currentPackage.value?.id === id) currentPackage.value = data
      }
      return data
    }

    const removePackage = async (id: string) => {
      const result = await request(
        () => deletePackage(id).then(() => true),
        'Impossible de supprimer le colis',
      )
      if (result) {
        packages.value = packages.value.filter((p) => p.id !== id)
        if (currentPackage.value?.id === id) currentPackage.value = null
      }
    }

    const getPackageFromStore = (id: string): Package | undefined =>
      packages.value.find((p) => p.id === id)

    return {
      packages,
      currentPackage,
      isLoading,
      error,
      fetchPackages,
      fetchPackageById,
      addPackage,
      editPackage,
      removePackage,
      getPackageFromStore,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['packages', 'currentPackage'],
    },
  },
)
