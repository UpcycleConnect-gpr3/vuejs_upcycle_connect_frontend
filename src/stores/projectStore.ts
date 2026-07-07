import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import {
  addProjectObject,
  createProject,
  createProjectStep,
  deleteProject,
  featureProject,
  unfeatureProject,
  getProjectById,
  getProjectObjects,
  getProjects,
  getProjectSteps,
  updateProject,
} from '@/api/clients/projectClient'
import { useApi } from '@/composables/useApi'
import type { ObjectRef, Project, ProjectPayload, StepPayload, StepSummary } from '@/types'

export const useProjectStore = defineStore(
  'project',
  () => {
    const projects = ref<Project[]>([])
    const currentProject = ref<Project | null>(null)
    const currentProjectObjects = ref<ObjectRef[]>([])
    const currentProjectSteps = ref<StepSummary[]>([])
    const { isLoading, error, request } = useApi()

    const fetchProjects = async () => {
      const data = await request(getProjects, 'Impossible de charger les projets')
      if (data) projects.value = data
    }

    const fetchProjectById = async (id: number) => {
      const data = await request(() => getProjectById(id), 'Impossible de charger le projet')
      if (data) currentProject.value = data
    }

    const addProject = async (payload: ProjectPayload) => {
      const data = await request(() => createProject(payload), 'Impossible de créer le projet')
      if (data) projects.value.push(data)
      return data
    }

    const editProject = async (id: number, payload: ProjectPayload) => {
      const data = await request(
        () => updateProject(id, payload),
        'Impossible de modifier le projet',
      )
      if (data) {
        const index = projects.value.findIndex((p) => p.id === id)
        if (index !== -1) projects.value[index] = data
        if (currentProject.value?.id === id) currentProject.value = data
      }
      return data
    }

    const removeProject = async (id: number) => {
      const result = await request(
        () => deleteProject(id).then(() => true),
        'Impossible de supprimer le projet',
      )
      if (result) {
        projects.value = projects.value.filter((p) => p.id !== id)
        if (currentProject.value?.id === id) currentProject.value = null
      }
    }

    const fetchProjectObjects = async (id: number) => {
      const data = await request(
        () => getProjectObjects(id),
        'Impossible de charger les objets du projet',
      )
      if (data) currentProjectObjects.value = data
    }

    const associateObject = async (id: number, objectId: string) => {
      const result = await request(
        () => addProjectObject(id, objectId).then(() => true),
        "Impossible d'associer l'objet au projet",
      )
      if (result) await fetchProjectObjects(id)
    }

    const fetchProjectSteps = async (id: number) => {
      const data = await request(
        () => getProjectSteps(id),
        'Impossible de charger les étapes du projet',
      )
      if (data) currentProjectSteps.value = data
    }

    const addProjectStep = async (id: number, payload: StepPayload) => {
      const data = await request(
        () => createProjectStep(id, payload),
        "Impossible d'ajouter une étape au projet",
      )
      if (data) await fetchProjectSteps(id)
      return data
    }

    const setFeatured = async (id: number, featured: boolean) => {
      const result = await request(
        () => (featured ? featureProject(id) : unfeatureProject(id)).then(() => true),
        'Impossible de mettre à jour la mise en avant',
      )
      if (result) {
        const idx = projects.value.findIndex((p) => p.id === id)
        const existing = projects.value[idx]
        if (idx !== -1 && existing) projects.value[idx] = { ...existing, featured }
      }
      return result
    }

    const getProjectFromStore = (id: number): Project | undefined =>
      projects.value.find((p) => p.id === id)

    return {
      projects,
      currentProject,
      currentProjectObjects,
      currentProjectSteps,
      isLoading,
      error,
      fetchProjects,
      fetchProjectById,
      addProject,
      editProject,
      removeProject,
      fetchProjectObjects,
      associateObject,
      fetchProjectSteps,
      addProjectStep,
      setFeatured,
      getProjectFromStore,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['projects', 'currentProject'],
    },
  },
)
