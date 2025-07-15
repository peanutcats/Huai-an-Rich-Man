import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import GameRoom from '@/views/GameRoom.vue'
import GameBoard from '@/views/GameBoard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/room/:roomId',
    name: 'GameRoom',
    component: GameRoom
  },
  {
    path: '/game/:roomId',
    name: 'GameBoard',
    component: GameBoard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router