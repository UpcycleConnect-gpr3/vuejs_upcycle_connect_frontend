import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import { getUserById, getUsers } from '@/api/clients/userClient'
import { useApi } from '@/composables/useApi'
import type { User } from '@/types'

export const useUserStore = defineStore(
  'user',
  () => {
    const users = ref<User[]>([])
    const currentUser = ref<User | null>(null)
    const { isLoading, error, request } = useApi()

    const fetchUsers = async () => {
      const data = await request(getUsers, 'Impossible de charger les utilisateurs')
      if (data) users.value = data
    }

    const fetchUserById = async (id: string) => {
      const data = await request(() => getUserById(id), "Impossible de charger l'utilisateur")
      if (data) currentUser.value = data
    }

    const getUserFromStore = (id: string): User | undefined => users.value.find((u) => u.id === id)

    return {
      users,
      currentUser,
      isLoading,
      error,
      fetchUsers,
      fetchUserById,
      getUserFromStore,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['users', 'currentUser'],
    },
  },
)
