import type { App } from 'vue';
import { formatToBeiJingTime, formatToBeiJingTimeShort, formatToBeiJingDate } from '@/utils/dateUtils';

/**
 * 注册全局过滤器
 * @param app Vue应用实例
 */
export function registerFilters(app: App) {
  // 注册全局属性，用于在模板中格式化日期
  app.config.globalProperties.$filters = {
    // 格式化为北京时间
    formatToBeiJingTime,
    // 格式化为简短的北京时间
    formatToBeiJingTimeShort,
    // 格式化为北京日期
    formatToBeiJingDate
  };
}
