<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer>
    <div class="container">
      <div class="footer-nav">
        <div class="layout-flex layout-columns layout-gap-medium">
          <div class="logo">
            <div class="logo-dot"></div>
            <span>UpcycleConnect</span>
          </div>
          <p class="small muted">{{ $t('footer.tagline') }}</p>
        </div>
        <div class="layout-flex layout-gap-extra-large" style="flex-wrap: wrap">
          <div class="layout-flex layout-columns layout-gap-medium">
            <span class="eyebrow">{{ $t('footer.product') }}</span>
            <RouterLink to="/service" class="ghost">{{ $t('nav.service') }}</RouterLink>
            <RouterLink to="/pricing" class="ghost">{{ $t('nav.pricing') }}</RouterLink>
            <RouterLink to="/forum" class="ghost">{{ $t('nav.forum') }}</RouterLink>
          </div>
          <div class="layout-flex layout-columns layout-gap-medium">
            <span class="eyebrow">{{ $t('nav.resources') }}</span>
            <RouterLink to="/resources" class="ghost">{{ $t('footer.library') }}</RouterLink>
            <RouterLink to="/about" class="ghost">{{ $t('footer.about') }}</RouterLink>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="small muted">{{ $t('footer.copyright') }}</p>
        <div class="layout-flex layout-gap-medium layout-items-center">
          <a class="ghost">{{ $t('footer.privacy') }}</a>
          <a class="ghost">{{ $t('footer.terms') }}</a>
          <a class="ghost">{{ $t('footer.cookies') }}</a>
        </div>
      </div>
    </div>
  </footer>
</template>
