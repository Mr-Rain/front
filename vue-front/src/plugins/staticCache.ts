/**
 * 静态资源缓存插件
 * 提供全局静态资源缓存功能
 */
import type { App } from 'vue';
import { setupServiceWorker } from '@/utils/registerSW';
import { initStaticCache, clearAllCache, getCacheStatistics, loadCacheStats } from '@/utils/staticCache';
import { initPreload, preloadImages, preloadStyles, preloadScripts, preloadFonts, prefetchDNS, preconnect } from '@/utils/preloadResources';
import { ElMessage, ElNotification } from 'element-plus';

// 缓存插件配置接口
interface StaticCachePluginOptions {
  // 是否启用Service Worker
  enableServiceWorker?: boolean;
  // 是否启用自动更新
  enableAutoUpdate?: boolean;
  // 是否显示更新提示
  showUpdatePrompt?: boolean;
  // 是否启用预加载
  enablePreload?: boolean;
  // 是否启用静态资源缓存
  enableStaticCache?: boolean;
}

// 默认配置
const defaultOptions: StaticCachePluginOptions = {
  enableServiceWorker: true,
  enableAutoUpdate: false,
  showUpdatePrompt: true,
  enablePreload: true,
  enableStaticCache: true
};

// 创建静态资源缓存插件
export default {
  install: (app: App, options: StaticCachePluginOptions = {}) => {
    // 合并选项
    const mergedOptions = { ...defaultOptions, ...options };
    
    // 初始化静态资源缓存
    if (mergedOptions.enableStaticCache) {
      initStaticCache();
    }
    
    // 初始化预加载
    if (mergedOptions.enablePreload) {
      initPreload();
    }
    
    // 设置Service Worker
    if (mergedOptions.enableServiceWorker) {
      const updateSW = setupServiceWorker({
        autoUpdate: mergedOptions.enableAutoUpdate,
        onNeedRefresh: () => {
          if (mergedOptions.showUpdatePrompt) {
            ElNotification({
              title: '新版本可用',
              message: '新版本已准备就绪，点击刷新按钮更新应用',
              type: 'info',
              duration: 0,
              showClose: true,
              position: 'top-right',
              onClick: () => {
                updateSW(true);
              }
            });
          }
        },
        onOfflineReady: () => {
          ElMessage({
            message: '应用已准备好离线使用',
            type: 'success',
            duration: 3000
          });
        }
      });
    }
    
    // 添加全局属性
    app.config.globalProperties.$staticCache = {
      // 清除所有缓存
      clearAll: clearAllCache,
      
      // 获取缓存统计信息
      getStats: getCacheStatistics,
      
      // 加载缓存统计信息
      loadStats: loadCacheStats,
      
      // 预加载图片
      preloadImages,
      
      // 预加载样式
      preloadStyles,
      
      // 预加载脚本
      preloadScripts,
      
      // 预加载字体
      preloadFonts,
      
      // 预解析DNS
      prefetchDNS,
      
      // 预连接
      preconnect
    };
    
    // 添加全局注入
    app.provide('staticCache', app.config.globalProperties.$staticCache);
  }
};

// 声明模块扩展
declare module 'vue' {
  interface ComponentCustomProperties {
    $staticCache: {
      clearAll: typeof clearAllCache;
      getStats: typeof getCacheStatistics;
      loadStats: typeof loadCacheStats;
      preloadImages: typeof preloadImages;
      preloadStyles: typeof preloadStyles;
      preloadScripts: typeof preloadScripts;
      preloadFonts: typeof preloadFonts;
      prefetchDNS: typeof prefetchDNS;
      preconnect: typeof preconnect;
    };
  }
}
