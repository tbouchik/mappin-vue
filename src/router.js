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
      redirect: 'dashboard/analytics',
      component: AppLayout,
      meta: { authRequired: true, hidden: true },
      children: [
        // Dashboards
        {
          path: '/dashboard/analytics',
          name: 'dashboard',
          meta: {
            title: 'Dashboard Analytics',
          },
          component: () => import('./views/dashboard/analytics'),
        },
        {
          path: '/dashboard/statistics',
          meta: {
            title: 'Dashboard Statistics',
          },
          component: () => import('./views/dashboard/statistics'),
        },
        {
          path: '/dashboard/ecommerce',
          meta: {
            title: 'Dashboard Ecommerce',
          },
          component: () => import('./views/dashboard/ecommerce'),
        },
        {
          path: '/dashboard/crypto',
          meta: {
            title: 'Dashboard Crypto',
          },
          component: () => import('./views/dashboard/crypto'),
        },
        {
          path: '/dashboard/crypto-terminal',
          meta: {
            title: 'Dashboard Crypto Terminal',
          },
          component: () => import('./views/dashboard/crypto-terminal'),
        },
        {
          path: '/dashboard/jira',
          meta: {
            title: 'Dashboard Jira',
          },
          component: () => import('./views/dashboard/jira'),
        },
        {
          path: '/dashboard/helpdesk',
          meta: {
            title: 'Dashboard Helpdesk',
          },
          component: () => import('./views/dashboard/helpdesk'),
        },
        // Ecommerce
        {
          path: '/ecommerce/dashboard',
          meta: {
            title: 'Ecommerce Dashboard',
          },
          component: () => import('./views/ecommerce/dashboard'),
        },
        {
          path: '/ecommerce/orders',
          meta: {
            title: 'Ecommerce Orders',
          },
          component: () => import('./views/ecommerce/orders'),
        },
        {
          path: '/ecommerce/product-catalog',
          meta: {
            title: 'Ecommerce Product Catalog',
          },
          component: () => import('./views/ecommerce/product-catalog'),
        },
        {
          path: '/ecommerce/product-details',
          meta: {
            title: 'Ecommerce Product Details',
          },
          component: () => import('./views/ecommerce/product-details'),
        },
        {
          path: '/ecommerce/cart',
          meta: {
            title: 'Ecommerce Cart',
          },
          component: () => import('./views/ecommerce/cart'),
        },
        // Apps
        {
          path: '/apps/messaging',
          meta: {
            title: 'Apps Messaging',
          },
          component: () => import('./views/apps/messaging'),
        },
        {
          path: '/apps/calendar',
          meta: {
            title: 'Apps Calendar',
          },
          component: () => import('./views/apps/calendar'),
        },
        {
          path: '/apps/mail',
          meta: {
            title: 'Apps Mail',
          },
          component: () => import('./views/apps/mail'),
        },
        {
          path: '/apps/profile',
          meta: {
            title: 'Apps Profile',
          },
          component: () => import('./views/apps/profile'),
        },
        {
          path: '/apps/gallery',
          meta: {
            title: 'Apps Gallery',
          },
          component: () => import('./views/apps/gallery'),
        },
        // Extra Apps
        {
          path: '/extra-apps/github-explore',
          meta: {
            title: 'Github Explore',
          },
          component: () => import('./views/extra-apps/github-explore'),
        },
        {
          path: '/extra-apps/github-discuss',
          meta: {
            title: 'Github Discuss',
          },
          component: () => import('./views/extra-apps/github-discuss'),
        },
        {
          path: '/extra-apps/digitalocean-droplets',
          meta: {
            title: 'DigitalOcean Droplets',
          },
          component: () => import('./views/extra-apps/digitalocean-droplets'),
        },
        {
          path: '/extra-apps/digitalocean-create',
          meta: {
            title: 'DigitalOcean Create Droplets',
          },
          component: () => import('./views/extra-apps/digitalocean-create'),
        },
        {
          path: '/extra-apps/google-analytics',
          meta: {
            title: 'Google Analytics',
          },
          component: () => import('./views/extra-apps/google-analytics'),
        },
        {
          path: '/extra-apps/wordpress-post',
          meta: {
            title: 'Wordpress Post',
          },
          component: () => import('./views/extra-apps/wordpress-post'),
        },
        {
          path: '/extra-apps/wordpress-posts',
          meta: {
            title: 'Wordpress Posts',
          },
          component: () => import('./views/extra-apps/wordpress-posts'),
        },
        {
          path: '/extra-apps/wordpress-add',
          meta: {
            title: 'Wordpress Add',
          },
          component: () => import('./views/extra-apps/wordpress-add'),
        },
        {
          path: '/extra-apps/todoist-list',
          meta: {
            title: 'Todoist List',
          },
          component: () => import('./views/extra-apps/todoist-list'),
        },
        {
          path: '/extra-apps/jira-dashboard',
          meta: {
            title: 'Jira Dashboard',
          },
          component: () => import('./views/extra-apps/jira-dashboard'),
        },
        {
          path: '/extra-apps/jira-agile-board',
          meta: {
            title: 'Jira Agile Board',
          },
          component: () => import('./views/extra-apps/jira-agile-board'),
        },
        {
          path: '/extra-apps/helpdesk-dashboard',
          meta: {
            title: 'Helpdesk Dashboard',
          },
          component: () => import('./views/extra-apps/helpdesk-dashboard'),
        },
        // Widgets
        {
          path: '/widgets/general',
          meta: {
            title: 'Widgets General',
          },
          component: () => import('./views/widgets/general'),
        },
        {
          path: '/widgets/lists',
          meta: {
            title: 'Widgets Lists',
          },
          component: () => import('./views/widgets/lists'),
        },
        {
          path: '/widgets/tables',
          meta: {
            title: 'Widgets Tables',
          },
          component: () => import('./views/widgets/tables'),
        },
        {
          path: '/widgets/charts',
          meta: {
            title: 'Widgets Charts',
          },
          component: () => import('./views/widgets/charts'),
        },
        // Cards
        {
          path: '/cards/basic-cards',
          meta: {
            title: 'Basic Cards',
          },
          component: () => import('./views/cards/basic-cards'),
        },
        {
          path: '/cards/tabbed-cards',
          meta: {
            title: 'Tabbed Cards',
          },
          component: () => import('./views/cards/tabbed-cards'),
        },
        // UI Kits
        {
          path: '/ui-kits/bootstrap',
          meta: {
            title: 'Bootstrap',
          },
          component: () => import('./views/ui-kits/bootstrap'),
        },
        {
          path: '/ui-kits/antd',
          meta: {
            title: 'Ant Design',
          },
          component: () => import('./views/ui-kits/antd'),
        },
        // Tables
        {
          path: '/tables/bootstrap',
          meta: {
            title: 'Bootstrap Tables',
          },
          component: () => import('./views/tables/bootstrap'),
        },
        {
          path: '/tables/antd',
          meta: {
            title: 'Ant Design Tables',
          },
          component: () => import('./views/tables/antd'),
        },
        // Charts
        {
          path: '/charts/chartistjs',
          meta: {
            title: 'Chartist.js',
          },
          component: () => import('./views/charts/chartistjs'),
        },
        {
          path: '/charts/chartjs',
          meta: {
            title: 'Chart.js',
          },
          component: () => import('./views/charts/chartjs'),
        },
        {
          path: '/charts/c3',
          meta: {
            title: 'C3 Charts',
          },
          component: () => import('./views/charts/c3'),
        },
        {
          path: '/charts/peity',
          meta: {
            title: 'Peity',
          },
          component: () => import('./views/charts/peity'),
        },
        // Icons
        {
          path: '/icons/feather-icons',
          meta: {
            title: 'Feather Icons',
          },
          component: () => import('./views/icons/feather-icons'),
        },
        {
          path: '/icons/fontawesome',
          meta: {
            title: 'Fontawesome Icons',
          },
          component: () => import('./views/icons/fontawesome'),
        },
        {
          path: '/icons/linearicons-free',
          meta: {
            title: 'Linearicons Free',
          },
          component: () => import('./views/icons/linearicons-free'),
        },
        {
          path: '/icons/icomoon-free',
          meta: {
            title: 'Icomoon Free',
          },
          component: () => import('./views/icons/icomoon-free'),
        },
        // Advanced
        {
          path: '/advanced/form-examples',
          meta: {
            title: 'Form Examples',
          },
          component: () => import('./views/advanced/form-examples'),
        },
        {
          path: '/advanced/email-templates',
          meta: {
            title: 'Email Templates',
          },
          component: () => import('./views/advanced/email-templates'),
        },
        {
          path: '/advanced/utilities',
          meta: {
            title: 'Utilities',
          },
          component: () => import('./views/advanced/utilities'),
        },
        {
          path: '/advanced/grid',
          meta: {
            title: 'Grid',
          },
          component: () => import('./views/advanced/grid'),
        },
        {
          path: '/advanced/typography',
          meta: {
            title: 'Typography',
          },
          component: () => import('./views/advanced/typography'),
        },
        {
          path: '/advanced/pricing-tables',
          meta: {
            title: 'Pricing Tables',
          },
          component: () => import('./views/advanced/pricing-tables'),
        },
        {
          path: '/advanced/invoice',
          meta: {
            title: 'Invoice',
          },
          component: () => import('./views/advanced/invoice'),
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
          component: () => import('./views/system/login'),
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
          component: () => import('./views/system/register'),
        },
        {
          path: '/system/lockscreen',
          meta: {
            title: 'Lockscreen',
          },
          component: () => import('./views/system/lockscreen'),
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
