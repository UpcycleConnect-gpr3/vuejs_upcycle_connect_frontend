import { createRouter, createWebHistory } from 'vue-router'
import {
  HomePage, ForumPage, PricingPage,
  DashboardIndexPage, DashboardListingsPage, DashboardDepositsPage,
  DashboardAdvicePage, DashboardAdviceDetailPage,
  DashboardCatalogPage, DashboardCatalogDetailPage,
  DashboardScorePage, DashboardPlanningPage, DashboardOrdersPage,
} from '@/pages'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomePage },
    { path: '/forum', component: ForumPage },
    { path: '/pricing', component: PricingPage },

    // Dashboard particulier
    { path: '/dashboard', component: DashboardIndexPage },
    { path: '/dashboard/listings', component: DashboardListingsPage },
    { path: '/dashboard/listings/new', component: DashboardListingsPage },
    { path: '/dashboard/deposits', component: DashboardDepositsPage },
    { path: '/dashboard/deposits/new', component: DashboardDepositsPage },
    { path: '/dashboard/advice', component: DashboardAdvicePage },
    { path: '/dashboard/advice/:id', component: DashboardAdviceDetailPage },
    { path: '/dashboard/catalog', component: DashboardCatalogPage },
    { path: '/dashboard/catalog/:id', component: DashboardCatalogDetailPage },
    { path: '/dashboard/score', component: DashboardScorePage },
    { path: '/dashboard/planning', component: DashboardPlanningPage },
    { path: '/dashboard/orders', component: DashboardOrdersPage },
  ],
})

export default router
