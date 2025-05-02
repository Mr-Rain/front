/**
 * API缓存插件
 * 提供全局API缓存功能
 */
import type { App } from 'vue';
import apiCache from '@/utils/apiCache';
import { clearAllCache, clearCacheByTag, clearCacheByTags, clearCacheByUrlPrefix, getCacheStats } from '@/utils/cacheInterceptor';

// 创建API缓存插件
export default {
  install: (app: App) => {
    // 添加全局属性
    app.config.globalProperties.$apiCache = {
      // 清除所有缓存
      clearAll: clearAllCache,
      
      // 根据标签清除缓存
      clearByTag: clearCacheByTag,
      
      // 根据多个标签清除缓存
      clearByTags: clearCacheByTags,
      
      // 根据URL前缀清除缓存
      clearByUrlPrefix: clearCacheByUrlPrefix,
      
      // 获取缓存统计信息
      getStats: getCacheStats,
      
      // 包装API函数，添加缓存功能
      wrap: apiCache.wrap.bind(apiCache)
    };
    
    // 添加全局注入
    app.provide('apiCache', app.config.globalProperties.$apiCache);
  }
};

// 声明模块扩展
declare module 'vue' {
  interface ComponentCustomProperties {
    $apiCache: {
      clearAll: typeof clearAllCache;
      clearByTag: typeof clearCacheByTag;
      clearByTags: typeof clearCacheByTags;
      clearByUrlPrefix: typeof clearCacheByUrlPrefix;
      getStats: typeof getCacheStats;
      wrap: typeof apiCache.wrap;
    };
  }
}
