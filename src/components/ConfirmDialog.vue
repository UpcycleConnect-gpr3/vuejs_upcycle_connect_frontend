<script setup lang="ts">
import AppModal from '@/components/AppModal.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
    title: () => t('confirmDialog.title'),
    confirmLabel: () => t('confirmDialog.confirm'),
    cancelLabel: () => t('common.cancel'),
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
