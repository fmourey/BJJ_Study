import { createRouter, createWebHistory } from 'vue-router'
import VideoDetailView from '../views/VideoDetailView.vue'
import SearchVideoView from '../views/SearchVideoView.vue'

const routes = [
  {
    path: '/video/:id',
    name: 'video-detail',
    component: VideoDetailView
  },
  {
    path: '/search',
    name: 'search',
    component: SearchVideoView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
