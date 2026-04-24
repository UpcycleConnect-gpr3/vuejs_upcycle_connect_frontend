<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header>
    <RouterLink to="/" class="logo">
      <div class="logo-dot"></div>
      <span>UpcycleConnect</span>
    </RouterLink>

    <nav>
      <RouterLink to="/" class="navlink">Home</RouterLink>
      <RouterLink to="/service" class="navlink">Service</RouterLink>
      <RouterLink to="/resources" class="navlink">Resources</RouterLink>
      <RouterLink to="/pricing" class="navlink">Pricing</RouterLink>
      <RouterLink to="/forum" class="navlink">Forum</RouterLink>
    </nav>

    <div class="layout-flex layout-gap-medium layout-items-center">
      <button class="ghost medium">Sign up</button>
      <button class="primary medium">Log in</button>
    </div>
  </header>
</template>
