import { useAuthStore } from '@/stores/auth.store'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { requiresGuest: true, title: 'Sign In — DevBoard' },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/pages/RegisterPage.vue'),
      meta: { requiresGuest: true, title: 'Create Account — DevBoard' },
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('@/pages/DashboardPage.vue'),
      meta: { requiresAuth: true, title: 'My Boards — DevBoard' },
    },
    {
      path: '/board/:boardId',
      name: 'Board',
      component: () => import('@/pages/BoardPage.vue'),
      meta: { requiresAuth: true, title: 'Board — DevBoard' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Set page title on every navigation
router.afterEach((to: any) => {
  document.title = (to.meta.title as string) || 'DevBoard'
})

router.beforeEach(async (to: any) => {
  const authStore = useAuthStore()
  if (!authStore.initialized) {
    await authStore.init()
  }
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login' }
  }
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return { name: 'Dashboard' }
  }
})

export default router