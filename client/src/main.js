import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './styles/theme.css'
import './composables/useTheme'
import App from './App.vue'
import Dashboard from './views/Dashboard.vue'
// Dashboard is the landing page so it stays in the main bundle; the other views load on demand

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Dashboard },
    { path: '/inventory', component: () => import('./views/Inventory.vue') },
    { path: '/orders', component: () => import('./views/Orders.vue') },
    { path: '/demand', component: () => import('./views/Demand.vue') },
    { path: '/spending', component: () => import('./views/Spending.vue') },
    { path: '/reports', component: () => import('./views/Reports.vue') }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
