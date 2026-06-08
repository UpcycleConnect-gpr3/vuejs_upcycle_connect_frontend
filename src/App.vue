<script setup lang="ts">
import AuthModal from '@/components/AuthModal.vue'
import ToastHost from '@/components/ToastHost.vue'
</script>

<template>
  <router-view />
  <AuthModal />
  <ToastHost />
</template>

<style scoped></style>
