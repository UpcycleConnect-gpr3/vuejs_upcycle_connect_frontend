import { createRouter, createWebHistory } from 'vue-router'
import { HomePage, ServicePage, ResourcesPage, AboutPage, PricingPage, ForumPage } from '@/pages'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomePage },
    { path: '/service', component: ServicePage },
    { path: '/resources', component: ResourcesPage },
    { path: '/about', component: AboutPage },
    { path: '/pricing', component: PricingPage },
    { path: '/forum', component: ForumPage },
  ],
})

export default router
