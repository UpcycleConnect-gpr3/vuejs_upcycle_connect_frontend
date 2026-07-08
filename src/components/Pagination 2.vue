<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  totalPages: number
}>()

const emit = defineEmits<{
  (e: 'update:page', value: number): void
}>()

const canPrev = computed(() => props.page > 1)
const canNext = computed(() => props.page < props.totalPages)

const go = (p: number) => {
  if (p < 1 || p > props.totalPages || p === props.page) return
  emit('update:page', p)
}
</script>

<template>
  <nav v-if="totalPages > 1" class="layout-flex layout-gap-small layout-items-center">
    <button class="ghost small" :disabled="!canPrev" @click="go(page - 1)"> Précédent</button>
    <span class="tiny muted">Page {{ page }} / {{ totalPages }}</span>
    <button class="ghost small" :disabled="!canNext" @click="go(page + 1)">Suivant </button>
  </nav>
</template>
