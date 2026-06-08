import { createRouter, createWebHistory } from 'vue-router'
import {
  HomePage,
  ServicePage,
  ResourcesPage,
  AboutPage,
  PricingPage,
  ForumPage,
  LoginConfirmPage,
} from '@/pages'
import { useAuthStore } from '@/stores/auth'
import { useUiAuthModalStore } from '@/stores/uiAuthModal'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomePage },
    { path: '/service', component: ServicePage },
    { path: '/resources', component: ResourcesPage },
    { path: '/about', component: AboutPage },
    { path: '/pricing', component: PricingPage },
    { path: '/forum', component: ForumPage },
    { path: '/login-confirm', component: LoginConfirmPage },
    {
      path: '/forum/new',
      component: () => import('@/pages/forum/ForumNewPage.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/forum/:id', component: () => import('@/pages/forum/ForumDetailPage.vue') },

    // Dashboard (all require auth)
    {
      path: '/dashboard',
      component: () => import('@/pages/dashboard/IndexPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/catalog',
      component: () => import('@/pages/dashboard/CatalogPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/catalog/:id',
      component: () => import('@/pages/dashboard/CatalogDetailPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/listings',
      component: () => import('@/pages/dashboard/ListingsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/listings/new',
      component: () => import('@/pages/dashboard/ListingsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/listings/:id',
      component: () => import('@/pages/dashboard/ListingsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/deposits',
      component: () => import('@/pages/dashboard/DepositsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/deposits/new',
      component: () => import('@/pages/dashboard/DepositsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/orders',
      component: () => import('@/pages/dashboard/OrdersPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/score',
      component: () => import('@/pages/dashboard/ScorePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/planning',
      component: () => import('@/pages/dashboard/PlanningPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/advice',
      component: () => import('@/pages/dashboard/AdvicePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/advice/:id',
      component: () => import('@/pages/dashboard/AdviceDetailPage.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) {
      const ui = useUiAuthModalStore()
      ui.open('login')
      return { name: 'login' }
    }
  }
  return true
})

export default router
