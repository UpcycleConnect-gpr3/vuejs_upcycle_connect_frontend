import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/api/clients/categoryClient'
import { useApi } from '@/composables/useApi'
import type { ForumCategory, ForumCategoryPayload } from '@/types'

export const useCategoryStore = defineStore(
  'category',
  () => {
    const categories = ref<ForumCategory[]>([])
    const { isLoading, error, request } = useApi()

    const fetchCategories = async () => {
      const data = await request(getCategories, 'Impossible de charger les catégories')
      if (data) categories.value = data
    }

    const addCategory = async (payload: ForumCategoryPayload) => {
      const data = await request(() => createCategory(payload), 'Impossible de créer la catégorie')
      if (data) categories.value.push(data)
      return data
    }

    const editCategory = async (id: number, payload: Partial<ForumCategoryPayload>) => {
      const data = await request(
        () => updateCategory(id, payload),
        'Impossible de modifier la catégorie',
      )
      if (data) {
        const index = categories.value.findIndex((c) => c.id === id)
        if (index !== -1) categories.value[index] = data
      }
      return data
    }

    const removeCategory = async (id: number) => {
      const result = await request(
        () => deleteCategory(id).then(() => true),
        'Impossible de supprimer la catégorie',
      )
      if (result) categories.value = categories.value.filter((c) => c.id !== id)
    }

    const getCategoryFromStore = (id: number): ForumCategory | undefined =>
      categories.value.find((c) => c.id === id)

    return {
      categories,
      isLoading,
      error,
      fetchCategories,
      addCategory,
      editCategory,
      removeCategory,
      getCategoryFromStore,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['categories'],
    },
  },
)
