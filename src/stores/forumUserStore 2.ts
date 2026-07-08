import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import {
  deleteForumUser,
  getForumUserById,
  getForumUsers,
  updateForumUser,
} from '@/api/clients/forumUserClient'
import { useApi } from '@/composables/useApi'
import type { ForumUser, ForumUserUpdatePayload } from '@/types'

export const useForumUserStore = defineStore(
  'forumUser',
  () => {
    const users = ref<ForumUser[]>([])
    const currentUser = ref<ForumUser | null>(null)
    const { isLoading, error, request } = useApi()

    const fetchUsers = async () => {
      const data = await request(getForumUsers, 'Impossible de charger les utilisateurs')
      if (data) users.value = data
    }

    const fetchUserById = async (id: string) => {
      const data = await request(() => getForumUserById(id), "Impossible de charger l'utilisateur")
      if (data) currentUser.value = data
    }

    const editUser = async (id: string, payload: ForumUserUpdatePayload) => {
      const data = await request(
        () => updateForumUser(id, payload),
        "Impossible de modifier l'utilisateur",
      )
      if (data) {
        const index = users.value.findIndex((u) => u.id === id)
        if (index !== -1) users.value[index] = data
        if (currentUser.value?.id === id) currentUser.value = data
      }
      return data
    }

    const removeUser = async (id: string) => {
      const result = await request(
        () => deleteForumUser(id).then(() => true),
        "Impossible de supprimer l'utilisateur",
      )
      if (result) {
        users.value = users.value.filter((u) => u.id !== id)
        if (currentUser.value?.id === id) currentUser.value = null
      }
    }

    const getUserFromStore = (id: string): ForumUser | undefined =>
      users.value.find((u) => u.id === id)

    return {
      users,
      currentUser,
      isLoading,
      error,
      fetchUsers,
      fetchUserById,
      editUser,
      removeUser,
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
