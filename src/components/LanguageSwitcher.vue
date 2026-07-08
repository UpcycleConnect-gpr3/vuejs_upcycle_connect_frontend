<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { AVAILABLE_LOCALES, localeName, setLocale } from '@/i18n'

const { locale } = useI18n()

const onChange = (e: Event) => {
  setLocale((e.target as HTMLSelectElement).value)
}
</script>

<template>
  <select
    class="lang-switcher"
    :value="locale"
    :aria-label="$t('common.language')"
    @change="onChange"
  >
    <option v-for="code in AVAILABLE_LOCALES" :key="code" :value="code">
      {{ localeName(code) }}
    </option>
  </select>
</template>

<style scoped>
.lang-switcher {
  height: 36px;
  padding: 0 var(--space-2, 8px);
  background: transparent;
  color: inherit;
  border: 1px solid currentColor;
  border-radius: var(--radius-small, 6px);
  font-size: var(--font-size-small, 0.85rem);
  cursor: pointer;
  opacity: 0.85;
}
.lang-switcher:hover {
  opacity: 1;
}
</style>
