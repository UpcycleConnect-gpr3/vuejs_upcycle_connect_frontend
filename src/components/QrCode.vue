<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import QRCode from 'qrcode'

const props = withDefaults(
  defineProps<{
    value: string
    size?: number
    margin?: number
  }>(),
  { size: 160, margin: 1 },
)

const svg = ref<string>('')
const error = ref<string>('')

watchEffect(async () => {
  if (!props.value) {
    svg.value = ''
    error.value = ''
    return
  }
  try {
    svg.value = await QRCode.toString(props.value, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: props.margin,
      width: props.size,
      color: { dark: '#000000', light: '#ffffff' },
    })
    error.value = ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'QR generation failed'
    svg.value = ''
  }
})

async function download() {
  if (!props.value) return
  const dataUrl = await QRCode.toDataURL(props.value, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 512,
  })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `${props.value}.png`
  a.click()
}

defineExpose({ download })
</script>

<template>
  <div class="qr-code" :style="{ width: `${size}px`, height: `${size}px` }">
    <div v-if="svg" class="qr-code-svg" v-html="svg" />
    <span v-else-if="error" class="tiny muted">{{ error }}</span>
  </div>
</template>

<style scoped>
.qr-code {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
}
.qr-code-svg {
  width: 100%;
  height: 100%;
  display: flex;
}
.qr-code-svg :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
