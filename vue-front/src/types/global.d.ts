// 全局类型声明
import { formatToBeiJingTime, formatToBeiJingTimeShort, formatToBeiJingDate } from '@/utils/dateUtils';

// 扩展 Window 接口，添加自定义属性
interface Window {
  // 标记后端是否未启动
  backendDown?: boolean;
  // 标记网络错误是否已通知
  networkErrorNotified?: boolean;
}

// 扩展 Error 接口，添加自定义属性
interface Error {
  // 错误代码
  code?: string | number;
  // 错误类型
  type?: string;
  // 是否是后端未启动的错误
  isBackendDown?: boolean;
}

// 扩展 Vue 组件属性
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $filters: {
      formatToBeiJingTime: typeof formatToBeiJingTime;
      formatToBeiJingTimeShort: typeof formatToBeiJingTimeShort;
      formatToBeiJingDate: typeof formatToBeiJingDate;
    };
  }
}
