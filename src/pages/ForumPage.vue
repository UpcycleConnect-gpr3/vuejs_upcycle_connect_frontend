<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header>
    <div class="logo">
      <div class="logo-dot"></div>
      <span>UpcycleConnect</span>
    </div>

    <nav>
      <RouterLink to="/" class="navlink">Home</RouterLink>
      <RouterLink to="/service" class="navlink">Service</RouterLink>
      <RouterLink to="/resources" class="navlink">Resources</RouterLink>
      <RouterLink to="/pricing" class="navlink">Pricing</RouterLink>
      <RouterLink to="/forum" class="navlink">Forum</RouterLink>
    </nav>

    <div class="layout-flex layout-gap-medium layout-items-center">
      <button class="secondary medium">Sign up</button>
      <button class="outline medium">Log in</button>
    </div>
  </header>

  <main>
    <!-- Bigger News hero -->
    <section>
      <div class="container">
        <div class="card grid-2">
          <div class="image-placeholder" style="min-height: 560px"></div>
          <div class="layout-flex layout-columns layout-gap-large">
            <p class="right">DATE 28 Février 2026</p>
            <hgroup class="center">
              <h1 class="bold center secondary">Bigger News on Upcycle Connect</h1>
              <p class="center">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley
                of type and scrambled it to make a type specimen book.
              </p>
            </hgroup>
          </div>
        </div>
      </div>
    </section>

    <!-- Divider -->
    <section>
      <div class="container">
        <hr class="secondary" />
      </div>
    </section>

    <!-- Latest News grid -->
    <section>
      <div class="container">
        <div class="grid-2 layout-items-stretch">
          <article class="card layout-flex layout-columns layout-gap-large">
            <div class="image-placeholder"></div>
            <p class="left">DATE 28 Février 2026</p>
            <hgroup>
              <h3 class="bold secondary">Latest News on Upcycle Connect</h3>
              <p class="left">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley
                of type and scrambled it to make a type specimen book.
              </p>
            </hgroup>
          </article>
          <article class="card layout-flex layout-columns layout-gap-large">
            <div class="image-placeholder"></div>
            <p class="left">DATE 28 Février 2026</p>
            <hgroup>
              <h3 class="bold secondary">Latest News on Upcycle Connect</h3>
              <p class="left">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley
                of type and scrambled it to make a type specimen book.
              </p>
            </hgroup>
          </article>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <div class="footer-nav">
        <div class="logo">
          <span>UpcycleConnect</span>
        </div>
        <nav>
          <a class="ghost small">Home</a>
          <a class="ghost small">Services</a>
          <a class="ghost small">Resources</a>
          <a class="ghost small">Pricing</a>
        </nav>
      </div>
      <div class="footer-bottom">
        <p class="left">© 2026 Alternext. All rights reserved.</p>
        <div class="layout-flex layout-gap-medium layout-items-center">
          <a class="ghost small">Privacy Policy</a>
          <a class="ghost small">Terms of Service</a>
          <a class="ghost small">Cookies Settings</a>
        </div>
      </div>
    </div>
  </footer>
</template>
