import Vue from 'vue'
import Router from 'vue-router'
import AuthLayout from '@/layouts/Auth'
import AppLayout from '@/layouts/App'

Vue.use(Router)

const router = new Router({
  mode: 'history',
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
            authRequired: true,
          },
          props: true,
          component: () => import('./views/smelter/viewer.vue'),
        },
        {
          path: '/smelter/upload',
          name: 'upload',
          meta: {
            title: 'Smelter Uploader',
            authRequired: true,
          },
          props: true,
          component: () => import('./views/uploader/uploader.vue'),
        },
        // Dashboards
        {
          path: '/dashboard/documents',
          name: 'documents',
          meta: {
            title: 'Dashboard Documents',
            authRequired: true,
          },
          props: true,
          component: () => import('./views/dashboard/documents/docs.vue'),
        },
        {
          path: '/dashboard/archive',
          name: 'archive',
          meta: {
            title: 'Archive',
            authRequired: true,
          },
          props: true,
          component: () => import('./views/dashboard/documents/archive.vue'),
        },
        {
          path: '/dashboard/clients',
          name: 'clients',
          meta: {
            title: 'Dashboard Clients',
            authRequired: true,
          },
          props: true,
          component: () => import('./views/dashboard/clients/clients-new.vue'),
        },
        {
          path: '/dashboard/client/:clientId',
          name: 'client',
          meta: {
            title: 'Client Detail',
            authRequired: true,
          },
          props: true,
          component: () => import('./views/dashboard/clients/components/clientDetail.vue'),
        },
        {
          path: '/dashboard/filters',
          name: 'filters',
          meta: {
            title: 'Templates',
            authRequired: true,
          },
          props: true,
          component: () => import('./views/dashboard/filters/filters.vue'),
        },
        {
          path: '/dashboard/journals',
          name: 'journals',
          meta: {
            title: 'Journaux',
            authRequired: true,
          },
          props: true,
          component: () => import('./views/dashboard/journals/journals.vue'),
        },
        {
          path: '/dashboard/vendors',
          name: 'vendors',
          meta: {
            title: 'Fournisseurs',
            authRequired: true,
          },
          props: true,
          component: () => import('./views/dashboard/vendors/vendors.vue'),
        },
        {
          path: '/dashboard/operators',
          name: 'operators',
          meta: {
            title: 'Gestion Crédits',
            authRequired: true,
          },
          props: true,
          component: () => import('./views/dashboard/operators/operators.vue'),
        },
        {
          path: '/dashboard/filter/:filterId',
          name: 'filter',
          meta: {
            title: 'Template',
            authRequired: true,
          },
          props: true,
          component: () => import('./views/dashboard/filters/components/filterDetail.vue'),
        },
        // Templates: Add New
        {
          path: '/dashboard/filters/add',
          name: 'addNewFilter',
          meta: {
            title: 'Add New Template',
            authRequired: true,
          },
          props: true,
          component: () => import('./views/dashboard/filters/components/filterAdd.vue'),
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
          component: () => import('./views/system/forgot-password.vue'),
        },
        {
          path: '/system/reset-password',
          meta: {
            title: 'Reset Password',
          },
          component: () => import('./views/system/reset-password.vue'),
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
