import type { App } from 'vue'
import ElementPlus from './element-plus'

// 插件列表
const plugins = [
  ElementPlus,
]

// 安装所有插件
export function setupPlugins(app: App) {
  plugins.forEach(plugin => {
    app.use(plugin)
  })
}
