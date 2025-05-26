import type { App } from 'vue';
import {
  formatToBeiJingTime,
  formatToBeiJingTimeShort,
  formatToBeiJingDate,
  formatDateTime,
  parseDateTime,
  isValidISO8601,
  hasTimezoneInfo,
  convertTimezone
} from '@/utils/dateUtils';

/**
 * 注册全局过滤器
 * @param app Vue应用实例
 */
export function registerFilters(app: App) {
  // 注册全局属性，用于在模板中格式化日期
  app.config.globalProperties.$filters = {
    // 新的统一格式化函数
    formatDateTime: (date: string | Date, format?: string) =>
      formatDateTime(date, { format: format as any }),

    // 解析日期函数
    parseDateTime,

    // 验证ISO 8601格式
    isValidISO8601,

    // 时区相关函数
    hasTimezoneInfo,
    convertTimezone,

    // 保持向后兼容的旧函数
    formatToBeiJingTime,
    formatToBeiJingTimeShort,
    formatToBeiJingDate,

    // 便捷的格式化函数
    formatDateTimeFull: (date: string | Date) => formatDateTime(date, { format: 'full' }),
    formatDateTimeShort: (date: string | Date) => formatDateTime(date, { format: 'short' }),
    formatDateOnly: (date: string | Date) => formatDateTime(date, { format: 'date' }),
    formatTimeOnly: (date: string | Date) => formatDateTime(date, { format: 'time' }),

    // 时区转换便捷函数
    formatWithTimezone: (date: string | Date, timezone: string) =>
      formatDateTime(date, { format: 'full', timezone }),
    convertToBeijingTime: (date: string | Date) =>
      convertTimezone(date, { toTimezone: 'Asia/Shanghai' }),
    convertToUTC: (date: string | Date) =>
      convertTimezone(date, { toTimezone: 'UTC' })
  };
}
