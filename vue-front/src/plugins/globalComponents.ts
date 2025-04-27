import type { App } from 'vue';
import EChartComponent from '@/components/common/EChartComponent.vue';

/**
 * 注册全局组件
 * @param app Vue应用实例
 */
export function setupGlobalComponents(app: App) {
  // 注册EChartComponent为全局组件
  app.component('echart-component', EChartComponent);
}
