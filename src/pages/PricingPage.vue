<script setup lang="ts">
import { RouterLink } from 'vue-router'

const basicFeatures = ['Feature 1', 'Feature 1', 'Feature 1', 'Feature 1', 'Feature 1', 'Feature 1']
const proFeatures = [
  'Feature 1', 'Feature 1', 'Feature 1', 'Feature 1',
  'Feature 1', 'Feature 1', 'Feature 1', 'Feature 1', 'Feature 1',
]
const businessFeatures = ['Feature 1', 'Feature 1', 'Feature 1', 'Feature 1', 'Feature 1', 'Feature 1']
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
    <!-- Hero -->
    <section>
      <div class="container layout-flex layout-columns layout-items-center layout-gap-large">
        <hgroup class="center">
          <h1 class="bold center secondary">A headline to make a big impact on visitors</h1>
          <p class="center">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
            industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book.
          </p>
        </hgroup>
        <div class="layout-flex layout-gap-medium">
          <button class="primary medium">Get started</button>
          <button class="outline medium">Learn more</button>
        </div>
      </div>
    </section>

    <!-- Pricing plan -->
    <section>
      <div class="container">
        <div class="card layout-flex layout-columns layout-items-center layout-gap-large">
          <hgroup class="center">
            <h2 class="bold center secondary">Pricing plan</h2>
            <p class="center">Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
          </hgroup>

          <div class="pricing-grid">
            <!-- Basic -->
            <div class="pricing-card">
              <div class="plan-header">
                <span class="plan-name">Basic Plan</span>
                <div>
                  <span class="plan-price">0€</span><span class="plan-price-unit">/mois</span>
                </div>
              </div>
              <div>
                <p class="plan-features-label left">Includes :</p>
                <ul class="plan-features">
                  <li v-for="(f, i) in basicFeatures" :key="i" class="plan-feature">
                    <svg class="plan-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    {{ f }}
                  </li>
                </ul>
              </div>
              <button class="secondary medium">Get started</button>
            </div>

            <!-- Pro (featured) -->
            <div class="pricing-card featured">
              <div class="plan-header">
                <span class="plan-name">Pro Plan</span>
                <div>
                  <span class="plan-price">15€</span><span class="plan-price-unit">/mois</span>
                </div>
              </div>
              <div>
                <p class="plan-features-label left">Includes :</p>
                <ul class="plan-features">
                  <li v-for="(f, i) in proFeatures" :key="i" class="plan-feature">
                    <svg class="plan-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    {{ f }}
                  </li>
                </ul>
              </div>
              <button class="secondary medium">Get started</button>
            </div>

            <!-- Business -->
            <div class="pricing-card">
              <div class="plan-header">
                <span class="plan-name">Business Plan</span>
                <div>
                  <span class="plan-price">30€</span><span class="plan-price-unit">/mois</span>
                </div>
              </div>
              <div>
                <p class="plan-features-label left">Includes :</p>
                <ul class="plan-features">
                  <li v-for="(f, i) in businessFeatures" :key="i" class="plan-feature">
                    <svg class="plan-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    {{ f }}
                  </li>
                </ul>
              </div>
              <button class="secondary medium">Get started</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Other Pricing plan -->
    <section>
      <div class="container layout-flex layout-columns layout-items-center layout-gap-large">
        <hgroup class="center">
          <h2 class="bold center secondary">Other Pricing plan</h2>
          <p class="center">Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
        </hgroup>

        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-label">Ads</span>
            <div>
              <span class="stat-value">100-500€</span><span class="stat-value-unit">/month/compaine</span>
            </div>
          </div>
          <div class="stat-box">
            <span class="stat-label">Commission</span>
            <div>
              <span class="stat-value">5-10%</span><span class="stat-value-unit">/sales</span>
            </div>
          </div>
          <div class="stat-box">
            <span class="stat-label">Training</span>
            <div>
              <span class="stat-value">20-100</span><span class="stat-value-unit">/people</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <div class="footer-nav">
        <div class="logo">
          <span class="secondary bold">UpcycleConnect</span>
        </div>
        <nav>
          <RouterLink to="/" class="ghost small">Home</RouterLink>
          <RouterLink to="/service" class="ghost small">Services</RouterLink>
          <RouterLink to="/resources" class="ghost small">Resources</RouterLink>
          <RouterLink to="/pricing" class="ghost small">Pricing</RouterLink>
        </nav>
      </div>
      <div class="footer-bottom">
        <p class="left">© 2026 Alternex. All rights reserved.</p>
        <div class="layout-flex layout-gap-medium layout-items-center">
          <a class="ghost small">Privacy Policy</a>
          <a class="ghost small">Terms of Service</a>
          <a class="ghost small">Cookies Settings</a>
        </div>
      </div>
    </div>
  </footer>
</template>
