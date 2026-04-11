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
          <h1 class="bold center secondary">A headline to make a big<br />impact on visitors</h1>
          <p class="center">
            Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the
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

    <!-- Feature -->
    <section>
      <div class="container">
        <div class="card grid-2">
          <div class="image-placeholder"></div>
          <div class="layout-flex layout-columns layout-gap-large">
            <hgroup>
              <h2 class="bold secondary">A headline to make a big impact on visitors</h2>
              <p class="left">
                Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been
                the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of
                type and scrambled it to make a type specimen book.
              </p>
            </hgroup>
            <div class="layout-flex layout-gap-medium">
              <button class="primary medium">Get started</button>
              <button class="outline medium">Learn more</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Partnership -->
    <section>
      <div class="container layout-flex layout-columns layout-items-center layout-gap-large">
        <hgroup class="center">
          <h2 class="bold center secondary">Partnership</h2>
          <p class="center">Our trusted partners !</p>
        </hgroup>
        <div class="grid-3" style="width: 100%">
          <div class="image-placeholder"></div>
          <div class="image-placeholder"></div>
          <div class="image-placeholder"></div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section>
      <div class="container">
        <div class="card grid-2">
          <div class="layout-flex layout-columns layout-gap-large">
            <hgroup>
              <h2 class="bold secondary">Contact us</h2>
              <p class="left">
                Consectetuer adipiscing lorem risus iortipps frcits ghcorh gug rii
              </p>
            </hgroup>
            <form>
              <div class="form-group">
                <label>Name</label>
                <input type="text" class="primary medium full-width" placeholder="Name" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" class="primary medium full-width" placeholder="Enter your email" />
              </div>
              <div class="form-group">
                <label>Message</label>
                <textarea class="primary medium full-width" placeholder="Type your message here"></textarea>
              </div>
              <button type="submit" class="primary medium">Get started</button>
            </form>
          </div>
          <div class="image-placeholder" style="align-self: stretch; min-height: 360px"></div>
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
      </div>
      <div class="footer-bottom">
        <p class="left">© 2026 Alternex. All rights reserved.</p>
        <div class="layout-flex layout-gap-medium layout-items-center">
          <a class="ghost small">Privacy Policy</a>
          <a class="ghost small">Terms of Service</a>
          <a class="ghost small">Cookie Settings</a>
        </div>
      </div>
    </div>
  </footer>
</template>
