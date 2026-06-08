<script setup lang="ts">
import { useToastsStore } from '@/stores/toasts'

const toasts = useToastsStore()
</script>

<template>
  <Teleport to="body">
    <div class="toast-host">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts.toasts"
          :key="t.id"
          class="toast"
          :class="`toast--${t.kind}`"
          @click="toasts.remove(t.id)"
        >
          <span>{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-host {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 360px;
}
.toast {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  background: #333;
}
.toast--success {
  background: #1f8a4c;
}
.toast--error {
  background: #c0392b;
}
.toast--info {
  background: #2d6cdf;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
</style>
