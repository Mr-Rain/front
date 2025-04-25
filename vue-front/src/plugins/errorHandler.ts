/**
 * 全局错误处理插件
 */
import type { App } from 'vue';
import { setupGlobalErrorHandlers } from '@/utils/errorHandler';

// 创建错误处理插件
export default {
  install: (app: App) => {
    // 设置全局错误处理
    setupGlobalErrorHandlers();
    
    // 设置全局错误处理器
    app.config.errorHandler = (err, instance, info) => {
      console.error('Vue Error:', err);
      console.error('Component:', instance);
      console.error('Error Info:', info);
      
      // 在生产环境中，可以将错误发送到服务器
      if (import.meta.env.PROD) {
        // 发送错误到服务器的逻辑
      }
    };
  }
};
