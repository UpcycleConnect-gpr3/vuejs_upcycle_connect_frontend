import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref } from 'vue'
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  updateAppointment,
} from '@/api/clients/appointmentClient'
import { useApi } from '@/composables/useApi'
import type { Appointment, AppointmentPayload } from '@/types'

export const useAppointmentStore = defineStore(
  'appointment',
  () => {
    const appointments = ref<Appointment[]>([])
    const { isLoading, error, request } = useApi()

    const fetchAppointments = async () => {
      const data = await request(getAppointments, 'Impossible de charger le planning')
      if (data) appointments.value = data
    }

    const addAppointment = async (payload: AppointmentPayload) => {
      const data = await request(
        () => createAppointment(payload),
        'Impossible de créer le rendez-vous',
      )
      if (data) appointments.value.push(data)
      return data
    }

    const editAppointment = async (id: number, payload: AppointmentPayload) => {
      const data = await request(
        () => updateAppointment(id, payload),
        'Impossible de modifier le rendez-vous',
      )
      if (data) {
        const index = appointments.value.findIndex((a) => a.id === id)
        const existing = appointments.value[index]
        if (index !== -1 && existing) {
          appointments.value[index] = { ...existing, ...payload }
        }
      }
      return data
    }

    const removeAppointment = async (id: number) => {
      const result = await request(
        () => deleteAppointment(id).then(() => true),
        'Impossible de supprimer le rendez-vous',
      )
      if (result) appointments.value = appointments.value.filter((a) => a.id !== id)
      return result
    }

    return {
      appointments,
      isLoading,
      error,
      fetchAppointments,
      addAppointment,
      editAppointment,
      removeAppointment,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['appointments'],
    },
  },
)
