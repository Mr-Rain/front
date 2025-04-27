import type { App } from 'vue'
import ElementPlus from './element-plus'
import ImageOptimizer from './imageOptimizer'
import ErrorHandler from './errorHandler'
import ApiCache from './apiCache'
import StaticCache from './staticCache'
import { registerFilters } from './filters'

// 插件列表
const plugins = [
  ElementPlus,
  ImageOptimizer,
  ErrorHandler,
  ApiCache,
  StaticCache,
]

// 安装所有插件
export function setupPlugins(app: App) {
  // 注册插件
  plugins.forEach(plugin => {
    app.use(plugin)
  })

  // 注册全局过滤器
  registerFilters(app)
}
