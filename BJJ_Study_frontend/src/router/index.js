import { createRouter, createWebHistory } from 'vue-router'
import VideoDetailView from '../views/VideoDetailView.vue'

const routes = [
  {
    path: '/video/:id',
    name: 'video-detail',
    component: VideoDetailView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
