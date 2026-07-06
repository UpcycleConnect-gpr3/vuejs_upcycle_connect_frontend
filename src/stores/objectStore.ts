import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import {
  addObjectDeliveryMethod,
  addObjectProject,
  addObjectUser,
  createObject,
  deleteObject,
  getObjectById,
  getObjectDeliveryMethods,
  getObjectProjects,
  getObjects,
  getObjectScore,
  getObjectUsers,
  removeObjectDeliveryMethod,
  removeObjectProject,
  removeObjectUser,
  updateObject,
} from '@/api/clients/objectClient'
import { useApi } from '@/composables/useApi'
import type {
  DeliveryMethodRef,
  ObjectPayload,
  ObjectScore,
  ObjectUpdatePayload,
  ProjectRef,
  UpcycleObject,
  UserRef,
} from '@/types'

export const useObjectStore = defineStore(
  'object',
  () => {
    const objects = ref<UpcycleObject[]>([])
    const currentObject = ref<UpcycleObject | null>(null)
    const currentObjectScore = ref<ObjectScore | null>(null)
    const currentObjectDeliveryMethods = ref<DeliveryMethodRef[]>([])
    const currentObjectProjects = ref<ProjectRef[]>([])
    const currentObjectUsers = ref<UserRef[]>([])
    const { isLoading, error, request } = useApi()

    const fetchObjects = async () => {
      const data = await request(getObjects, 'Impossible de charger les objets')
      if (data) objects.value = data
    }

    const fetchObjectById = async (id: string) => {
      const data = await request(() => getObjectById(id), "Impossible de charger l'objet")
      if (data) currentObject.value = data
    }

    const addObject = async (payload: ObjectPayload) => {
      const data = await request(() => createObject(payload), "Impossible de créer l'objet")
      if (data) objects.value.push(data)
      return data
    }

    const editObject = async (id: string, payload: ObjectUpdatePayload) => {
      const data = await request(() => updateObject(id, payload), "Impossible de modifier l'objet")
      if (data) {
        const index = objects.value.findIndex((o) => o.id === id)
        if (index !== -1) objects.value[index] = data
        if (currentObject.value?.id === id) currentObject.value = data
      }
      return data
    }

    const removeObject = async (id: string) => {
      const result = await request(
        () => deleteObject(id).then(() => true),
        "Impossible de supprimer l'objet",
      )
      if (result) {
        objects.value = objects.value.filter((o) => o.id !== id)
        if (currentObject.value?.id === id) currentObject.value = null
      }
    }

    const fetchObjectScore = async (id: string) => {
      const data = await request(() => getObjectScore(id), 'Impossible de charger le score')
      if (data) currentObjectScore.value = data
    }

    // --- Associations : modes de livraison ---

    const fetchObjectDeliveryMethods = async (id: string) => {
      const data = await request(
        () => getObjectDeliveryMethods(id),
        "Impossible de charger les modes de livraison de l'objet",
      )
      if (data) currentObjectDeliveryMethods.value = data
    }

    const associateDeliveryMethod = async (id: string, deliveryMethodId: number) => {
      const result = await request(
        () => addObjectDeliveryMethod(id, deliveryMethodId).then(() => true),
        "Impossible d'associer le mode de livraison",
      )
      if (result) await fetchObjectDeliveryMethods(id)
    }

    const dissociateDeliveryMethod = async (id: string, deliveryMethodId: number) => {
      const result = await request(
        () => removeObjectDeliveryMethod(id, deliveryMethodId).then(() => true),
        'Impossible de retirer le mode de livraison',
      )
      if (result) {
        currentObjectDeliveryMethods.value = currentObjectDeliveryMethods.value.filter(
          (m) => m.id !== deliveryMethodId,
        )
      }
    }

    // --- Associations : projets ---

    const fetchObjectProjects = async (id: string) => {
      const data = await request(
        () => getObjectProjects(id),
        "Impossible de charger les projets de l'objet",
      )
      if (data) currentObjectProjects.value = data
    }

    const associateProject = async (id: string, projectId: number) => {
      const result = await request(
        () => addObjectProject(id, projectId).then(() => true),
        "Impossible d'associer le projet",
      )
      if (result) await fetchObjectProjects(id)
    }

    const dissociateProject = async (id: string, projectId: number) => {
      const result = await request(
        () => removeObjectProject(id, projectId).then(() => true),
        'Impossible de retirer le projet',
      )
      if (result) {
        currentObjectProjects.value = currentObjectProjects.value.filter((p) => p.id !== projectId)
      }
    }

    // --- Associations : utilisateurs ---

    const fetchObjectUsers = async (id: string) => {
      const data = await request(
        () => getObjectUsers(id),
        "Impossible de charger les utilisateurs de l'objet",
      )
      if (data) currentObjectUsers.value = data
    }

    const associateUser = async (id: string, userId: string) => {
      const result = await request(
        () => addObjectUser(id, userId).then(() => true),
        "Impossible d'associer l'utilisateur",
      )
      if (result) await fetchObjectUsers(id)
    }

    const dissociateUser = async (id: string, userId: string) => {
      const result = await request(
        () => removeObjectUser(id, userId).then(() => true),
        "Impossible de retirer l'utilisateur",
      )
      if (result) {
        currentObjectUsers.value = currentObjectUsers.value.filter((u) => u.id !== userId)
      }
    }

    const getObjectFromStore = (id: string): UpcycleObject | undefined =>
      objects.value.find((o) => o.id === id)

    return {
      objects,
      currentObject,
      currentObjectScore,
      currentObjectDeliveryMethods,
      currentObjectProjects,
      currentObjectUsers,
      isLoading,
      error,
      fetchObjects,
      fetchObjectById,
      addObject,
      editObject,
      removeObject,
      fetchObjectScore,
      fetchObjectDeliveryMethods,
      associateDeliveryMethod,
      dissociateDeliveryMethod,
      fetchObjectProjects,
      associateProject,
      dissociateProject,
      fetchObjectUsers,
      associateUser,
      dissociateUser,
      getObjectFromStore,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['objects', 'currentObject'],
    },
  },
)
