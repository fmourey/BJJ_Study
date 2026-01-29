import { createRouter, createWebHashHistory } from 'vue-router'
import VideoDetailView from '../views/VideoDetailView.vue'
import SearchVideoView from '../views/SearchVideoView.vue'
import AddVideoView from '../views/AddVideoView.vue'
import RegisterView from '../views/RegisterView.vue'
import MyAccountView from '../views/MyAccountView.vue'
import { authGuard } from '@auth0/auth0-vue'

const routes = [
  {
    path: '/video/:id',
    name: 'video-detail',
    component: VideoDetailView
  },
  {
    path: '/',
    name: 'search',
    component: SearchVideoView
  },
  {
    path: '/addvideo',
    name: 'add-video',
    component: AddVideoView,
    beforeEnter: authGuard
  },
  {
    path: '/myaccount',
    name: 'my-account',
    component: MyAccountView,
    beforeEnter: authGuard
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
