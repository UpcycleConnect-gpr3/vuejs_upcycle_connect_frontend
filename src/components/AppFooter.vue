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
          <p class="small muted">Building a circular future, one object at a time.</p>
        </div>
        <div class="layout-flex layout-gap-extra-large" style="flex-wrap: wrap">
          <div class="layout-flex layout-columns layout-gap-medium">
            <span class="eyebrow">Product</span>
            <RouterLink to="/service" class="ghost">Service</RouterLink>
            <RouterLink to="/pricing" class="ghost">Pricing</RouterLink>
            <RouterLink to="/forum" class="ghost">Forum</RouterLink>
          </div>
          <div class="layout-flex layout-columns layout-gap-medium">
            <span class="eyebrow">Resources</span>
            <RouterLink to="/resources" class="ghost">Library</RouterLink>
            <RouterLink to="/about" class="ghost">About</RouterLink>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="small muted">© 2026 Alternext. All rights reserved.</p>
        <div class="layout-flex layout-gap-medium layout-items-center">
          <a class="ghost">Privacy</a>
          <a class="ghost">Terms</a>
          <a class="ghost">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
</template>
