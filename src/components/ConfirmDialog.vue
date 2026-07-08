<script setup lang="ts">
import AppModal from '@/components/AppModal.vue'

withDefaults(
  defineProps<{
    open: boolean
    title?: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
  }>(),
  {
    title: 'Confirmer',
    confirmLabel: 'Confirmer',
    cancelLabel: 'Annuler',
    danger: false,
  },
)

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <AppModal :open="open" :title="title" size="small" @close="emit('cancel')">
    <p class="muted measure">{{ message }}</p>
    <template #footer>
      <button class="ghost medium" @click="emit('cancel')">{{ cancelLabel }}</button>
      <button
        class="primary medium"
        :style="danger ? 'color: var(--destructive-color);' : ''"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </button>
    </template>
  </AppModal>
</template>
