<script setup lang="ts">
defineProps<{
  label?: string
  size?: number
}>()
</script>

<template>
  <div class="loading-spinner" role="status" aria-live="polite">
    <svg
      class="loading-spinner-svg"
      :width="size ?? 24"
      :height="size ?? 24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
    </svg>
    <span v-if="label" class="small muted">{{ label }}</span>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.loading-spinner-svg {
  animation: loading-spin 0.8s linear infinite;
}
@keyframes loading-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
