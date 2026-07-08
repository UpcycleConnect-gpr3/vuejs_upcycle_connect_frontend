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
import { useAuthStore } from '@/stores/authStore'
import { useUiAuthModalStore } from '@/stores/uiAuthModal'
import { useToastsStore } from '@/stores/toasts'
import { roleFromToken, homeForRole } from '@/composables/useCurrentUser'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomePage },
    { path: '/service', component: ServicePage },
    { path: '/resources', component: ResourcesPage },
    { path: '/about', component: AboutPage },
    { path: '/pricing', component: PricingPage },
    {
      path: '/annonces',
      component: () => import('@/pages/AnnoncesPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/annonces/:id',
      component: () => import('@/pages/AnnonceDetailPage.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/billing/success', component: () => import('@/pages/BillingSuccessPage.vue') },
    { path: '/forum', component: ForumPage },
    { path: '/login-confirm', name: 'login', component: LoginConfirmPage },
    {
      path: '/forum/new',
      component: () => import('@/pages/forum/ForumNewPage.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/forum/:id', component: () => import('@/pages/forum/ForumDetailPage.vue') },

    {
      path: '/dashboard',
      component: () => import('@/pages/dashboard/IndexPage.vue'),
      meta: { requiresAuth: true , roles: ['provider'] },
    },
    {
      path: '/dashboard/catalog',
      component: () => import('@/pages/dashboard/CatalogPage.vue'),
      meta: { requiresAuth: true , roles: ['provider'] },
    },
    {
      path: '/dashboard/catalog/:id',
      component: () => import('@/pages/dashboard/CatalogDetailPage.vue'),
      meta: { requiresAuth: true , roles: ['provider'] },
    },
    {
      path: '/dashboard/listings',
      component: () => import('@/pages/dashboard/ListingsPage.vue'),
      meta: { requiresAuth: true , roles: ['provider'] },
    },
    {
      path: '/dashboard/listings/new',
      component: () => import('@/pages/dashboard/ListingsPage.vue'),
      meta: { requiresAuth: true , roles: ['provider'] },
    },
    {
      path: '/dashboard/listings/:id',
      component: () => import('@/pages/dashboard/ListingsPage.vue'),
      meta: { requiresAuth: true , roles: ['provider'] },
    },
    {
      path: '/dashboard/deposits',
      component: () => import('@/pages/dashboard/DepositsPage.vue'),
      meta: { requiresAuth: true , roles: ['provider'] },
    },
    {
      path: '/dashboard/deposits/new',
      component: () => import('@/pages/dashboard/DepositsPage.vue'),
      meta: { requiresAuth: true , roles: ['provider'] },
    },
    {
      path: '/dashboard/orders',
      component: () => import('@/pages/dashboard/OrdersPage.vue'),
      meta: { requiresAuth: true , roles: ['provider'] },
    },
    {
      path: '/dashboard/score',
      component: () => import('@/pages/dashboard/ScorePage.vue'),
      meta: { requiresAuth: true , roles: ['provider'] },
    },
    {
      path: '/dashboard/planning',
      component: () => import('@/pages/dashboard/PlanningPage.vue'),
      meta: { requiresAuth: true , roles: ['provider'] },
    },
    {
      path: '/dashboard/messages',
      component: () => import('@/pages/dashboard/MessagesPage.vue'),
      meta: { requiresAuth: true , roles: ['provider'] },
    },
    {
      path: '/dashboard/advice',
      component: () => import('@/pages/dashboard/AdvicePage.vue'),
      meta: { requiresAuth: true , roles: ['provider'] },
    },
    {
      path: '/dashboard/advice/:id',
      component: () => import('@/pages/dashboard/AdviceDetailPage.vue'),
      meta: { requiresAuth: true , roles: ['provider'] },
    },

    {
      path: '/pro',
      component: () => import('@/pages/pro/IndexPage.vue'),
      meta: { requiresAuth: true , roles: ['professional', 'creator'] },
    },
    {
      path: '/pro/marketplace',
      component: () => import('@/pages/pro/MarketplacePage.vue'),
      meta: { requiresAuth: true , roles: ['professional', 'creator'] },
    },
    {
      path: '/pro/pickups',
      component: () => import('@/pages/pro/PickupsPage.vue'),
      meta: { requiresAuth: true , roles: ['professional', 'creator'] },
    },
    {
      path: '/pro/projects',
      component: () => import('@/pages/pro/ProjectsPage.vue'),
      meta: { requiresAuth: true , roles: ['professional', 'creator'] },
    },
    {
      path: '/pro/subscription',
      component: () => import('@/pages/pro/SubscriptionPage.vue'),
      meta: { requiresAuth: true , roles: ['professional', 'creator'] },
    },
    {
      path: '/pro/ads',
      component: () => import('@/pages/pro/AdsPage.vue'),
      meta: { requiresAuth: true , roles: ['professional', 'creator'] },
    },
    {
      path: '/pro/stats',
      component: () => import('@/pages/pro/StatsPage.vue'),
      meta: { requiresAuth: true , roles: ['professional', 'creator'] },
    },

    {
      path: '/staff',
      component: () => import('@/pages/staff/IndexPage.vue'),
      meta: { requiresAuth: true , roles: ['employee'] },
    },
    {
      path: '/staff/trainings',
      component: () => import('@/pages/staff/TrainingsPage.vue'),
      meta: { requiresAuth: true , roles: ['employee'] },
    },
    {
      path: '/staff/planning',
      component: () => import('@/pages/staff/PlanningPage.vue'),
      meta: { requiresAuth: true , roles: ['employee'] },
    },
    {
      path: '/staff/advice',
      component: () => import('@/pages/staff/AdvicePage.vue'),
      meta: { requiresAuth: true , roles: ['employee'] },
    },
    {
      path: '/staff/moderation',
      component: () => import('@/pages/staff/ModerationPage.vue'),
      meta: { requiresAuth: true , roles: ['employee'] },
    },
  ],
})

router.beforeEach((to) => {
  if (!to.meta.requiresAuth) return true

  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    useUiAuthModalStore().open('login')
    return { name: 'login' }
  }

  // Controle d'acces par role : chaque espace n'est ouvert qu'aux roles
  // autorises. L'administrateur peut naviguer partout.
  const allowed = to.meta.roles as string[] | undefined
  if (allowed && allowed.length) {
    const role = roleFromToken(auth.bearerToken)
    if (role !== 'administrator' && !allowed.includes(role)) {
      const home = homeForRole(role)
      if (to.path !== home) {
        useToastsStore().error("Cet espace n'est pas accessible avec votre profil.")
        return home
      }
    }
  }
  return true
})

export default router
