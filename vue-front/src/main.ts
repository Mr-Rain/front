import './assets/main.css'
import './assets/search-form.css'
import './assets/theme.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import { createRouterGuards } from './router/guards'

// Element Plus 全局服务
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/notification/style/css'
import 'element-plus/es/components/loading/style/css'
import { ElLoading, ElMessage, ElMessageBox, ElNotification } from 'element-plus'

// 导入插件
import { setupPlugins } from './plugins'
import { setupDirectives } from './directives'

// 创建Pinia实例并使用持久化插件
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 创建应用
const app = createApp(App)

// 全局属性
app.config.performance = true // 启用性能跟踪
app.config.warnHandler = (msg, instance, trace) => {
  // 在生产环境中忽略警告
  if (import.meta.env.PROD) return
  console.warn(`[Vue warn]: ${msg}\n${trace}`)
}

// 注册全局服务
app.use(pinia)
app.use(router)

// 注册插件
setupPlugins(app)

// 注册自定义指令
setupDirectives(app)

// 注册 Element Plus 全局服务
app.config.globalProperties.$loading = ElLoading.service
app.config.globalProperties.$msgbox = ElMessageBox
app.config.globalProperties.$alert = ElMessageBox.alert
app.config.globalProperties.$confirm = ElMessageBox.confirm
app.config.globalProperties.$prompt = ElMessageBox.prompt
app.config.globalProperties.$notify = ElNotification
app.config.globalProperties.$message = ElMessage

// 创建路由守卫
createRouterGuards(router)

// 挂载应用
app.mount('#app')
