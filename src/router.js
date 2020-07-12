import Vue from 'vue'
import Router from 'vue-router'
import AuthLayout from '@/layouts/Auth'
import AppLayout from '@/layouts/App'

Vue.use(Router)

const router = new Router({
  base: process.env.BASE_URL,
  // mode: 'history',
  scrollBehavior() {
    return { x: 0, y: 0 }
  },
  routes: [
    {
      path: '/',
      redirect: 'dashboard/documents',
      component: AppLayout,
      meta: { authRequired: true, hidden: true },
      children: [
        // Smelter
        {
          path: '/smelter/viewer/:documentId',
          name: 'viewer',
          meta: {
            title: 'Smelter Viewer',
          },
          props: true,
          component: () => import('./views/smelter/viewer.vue'),
        },
        // Dashboards
        {
          path: '/dashboard/documents',
          name: 'documents',
          meta: {
            title: 'Dashboard Documents',
          },
          props: true,
          component: () => import('./views/dashboard/documents/documents.vue'),
        },
        {
          path: '/dashboard/clients',
          name: 'clients',
          meta: {
            title: 'Dashboard Clients',
          },
          props: true,
          component: () => import('./views/dashboard/clients/clients.vue'),
        },
        // 404
        {
          path: '/404',
          meta: {
            title: 'Error 404',
          },
          component: () => import('./views/system/404'),
        },
      ],
    },

    // System Pages
    {
      path: '/system',
      component: AuthLayout,
      redirect: '/system/login',
      children: [
        {
          path: '/system/login',
          meta: {
            title: 'Login',
          },
          component: () => import('./views/system/login.vue'),
        },
        {
          path: '/system/forgot-password',
          meta: {
            title: 'Forgot Password',
          },
          component: () => import('./views/system/forgot-password'),
        },
        {
          path: '/system/register',
          meta: {
            title: 'Register',
          },
          component: () => import('./views/system/register.vue'),
        },
        {
          path: '/system/404',
          meta: {
            title: 'Error 404',
          },
          component: () => import('./views/system/404'),
        },
        {
          path: '/system/500',
          meta: {
            title: 'Error 500',
          },
          component: () => import('./views/system/500'),
        },
      ],
    },

    // Redirect to 404
    {
      path: '*', redirect: 'system/404', hidden: true,
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.authRequired)) {
    if (!localStorage.getItem('user')) {
      next({
        path: '/system/login',
        query: { redirect: to.fullPath },
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
