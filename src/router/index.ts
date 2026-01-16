import { createRouter, createWebHistory } from 'vue-router'
import DrillView from '@/views/DrillVue.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: DrillView,
    },
  ],
})

export default router
