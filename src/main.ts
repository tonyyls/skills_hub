import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import 'github-markdown-css/github-markdown.css'
import { useAuthStore } from '@/stores/auth'
import { useGlobalSelectAllDirective } from '@/composables/useGlobalSelectAll'
import { useTruncateTitleDirective } from '@/composables/useTruncateTitleTooltip'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 全局注册选择快捷键指令：v-select-all-shortcut
const { selectAllShortcutDirective } = useGlobalSelectAllDirective()
app.directive('select-all-shortcut', selectAllShortcutDirective)

// 全局注册标题截断提示指令：v-truncate-title
const { truncateTitleDirective } = useTruncateTitleDirective()
app.directive('truncate-title', truncateTitleDirective)

// 初始化认证状态：恢复管理员与普通用户登录态，并监听会话变化
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
