/**
 * Service Worker 注册工具
 * 用于注册和管理Service Worker，实现静态资源缓存
 */
// 暂时注释掉PWA相关导入，需要时可以安装依赖：pnpm add -D vite-plugin-pwa
// import { registerSW } from 'virtual:pwa-register';

// 定义更新提示类型
interface UpdatePromptOptions {
  // 是否自动更新
  autoUpdate?: boolean;
  // 更新间隔（毫秒）
  updateInterval?: number;
  // 更新前回调
  onNeedRefresh?: () => void;
  // 离线就绪回调
  onOfflineReady?: () => void;
  // 注册错误回调
  onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
  // 注册错误回调
  onRegisterError?: (error: any) => void;
}

// 默认选项
const defaultOptions: UpdatePromptOptions = {
  autoUpdate: false,
  updateInterval: 60 * 60 * 1000, // 1小时
  onNeedRefresh: () => {},
  onOfflineReady: () => {},
  onRegistered: () => {},
  onRegisterError: () => {}
};

// Service Worker更新状态
export const swUpdateState = {
  needRefresh: false,
  offlineReady: false,
  registration: null as ServiceWorkerRegistration | null
};

/**
 * 注册Service Worker
 * @param options 更新提示选项
 */
export function setupServiceWorker(options: UpdatePromptOptions = {}) {
  // 合并选项
  const mergedOptions = { ...defaultOptions, ...options };

  // 注册Service Worker - 暂时注释掉
  // 使用mock函数代替
  const updateSW = (() => {}) as any; /* registerSW({
    // 当新的Service Worker可用时
    onNeedRefresh() {
      swUpdateState.needRefresh = true;
      mergedOptions.onNeedRefresh?.();

      // 如果设置了自动更新，则自动更新
      if (mergedOptions.autoUpdate) {
        updateSW(true);
      }
    },
    // 当离线功能就绪时
    onOfflineReady() {
      swUpdateState.offlineReady = true;
      mergedOptions.onOfflineReady?.();
    },
    // 当Service Worker注册成功时
    onRegistered(registration) {
      swUpdateState.registration = registration;
      mergedOptions.onRegistered?.(registration);

      // 如果设置了更新间隔，则定期检查更新
      if (registration && mergedOptions.updateInterval) {
        setInterval(() => {
          registration.update().catch(console.error);
        }, mergedOptions.updateInterval);
      }
    },
    // 当Service Worker注册失败时
    onRegisterError(error) {
      console.error('Service Worker注册失败:', error);
      mergedOptions.onRegisterError?.(error);
    }
  }); */

  // 返回更新函数
  return updateSW;
}

/**
 * 手动更新Service Worker
 */
export function updateServiceWorker() {
  if (swUpdateState.registration) {
    swUpdateState.registration.update().catch(console.error);
  }
}

/**
 * 清除所有缓存
 * @returns Promise<boolean> 是否成功清除缓存
 */
export async function clearAllCaches(): Promise<boolean> {
  try {
    // 获取所有缓存名称
    const cacheNames = await caches.keys();

    // 删除所有缓存
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );

    return true;
  } catch (error) {
    console.error('清除缓存失败:', error);
    return false;
  }
}

/**
 * 获取缓存统计信息
 * @returns Promise<{cacheNames: string[], totalSize: number}> 缓存统计信息
 */
export async function getCacheStats(): Promise<{cacheNames: string[], totalSize: number}> {
  try {
    // 获取所有缓存名称
    const cacheNames = await caches.keys();
    let totalSize = 0;

    // 计算缓存大小
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return {
      cacheNames,
      totalSize
    };
  } catch (error) {
    console.error('获取缓存统计信息失败:', error);
    return {
      cacheNames: [],
      totalSize: 0
    };
  }
}

/**
 * 预缓存资源
 * @param urls 要预缓存的URL数组
 * @param cacheName 缓存名称
 * @returns Promise<boolean> 是否成功预缓存
 */
export async function precacheResources(urls: string[], cacheName: string = 'precache'): Promise<boolean> {
  try {
    // 打开缓存
    const cache = await caches.open(cacheName);

    // 缓存所有URL
    await Promise.all(
      urls.map(url => fetch(url).then(response => cache.put(url, response)))
    );

    return true;
  } catch (error) {
    console.error('预缓存资源失败:', error);
    return false;
  }
}

/**
 * 检查资源是否已缓存
 * @param url 要检查的URL
 * @returns Promise<boolean> 是否已缓存
 */
export async function isResourceCached(url: string): Promise<boolean> {
  try {
    // 检查所有缓存
    const cacheNames = await caches.keys();

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const response = await cache.match(url);

      if (response) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('检查资源缓存状态失败:', error);
    return false;
  }
}

/**
 * 格式化缓存大小
 * @param bytes 字节数
 * @returns 格式化后的大小字符串
 */
export function formatCacheSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
}
