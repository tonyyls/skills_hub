import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化认证状态：恢复管理员与普通用户登录态，并监听会话变化
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
