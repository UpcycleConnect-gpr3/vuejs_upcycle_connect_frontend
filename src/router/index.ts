import { createRouter, createWebHistory } from 'vue-router'
import { HomePage, ForumPage } from '@/pages'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomePage,
    },
    {
      path: '/forum',
      component: ForumPage,
    },
  ],
})

export default router
