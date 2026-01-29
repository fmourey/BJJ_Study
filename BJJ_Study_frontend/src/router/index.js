import { createRouter, createWebHashHistory } from 'vue-router'
import VideoDetailView from '../views/VideoDetailView.vue'
import SearchVideoView from '../views/SearchVideoView.vue'
import AddVideoView from '../views/AddVideoView.vue' 

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
  },
  {
    path: '/addvideo',
    name: 'add-video',
    component: AddVideoView
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
