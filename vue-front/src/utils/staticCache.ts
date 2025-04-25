/**
 * 静态资源缓存管理器
 * 用于管理应用程序中的静态资源缓存
 */
import { ref, reactive } from 'vue';
import { isResourceCached, formatCacheSize, getCacheStats, clearAllCaches } from './registerSW';

// 缓存项接口
interface CacheItem {
  // 资源URL
  url: string;
  // 资源类型
  type: string;
  // 缓存时间
  cachedAt: number;
  // 过期时间
  expireAt: number;
  // 资源大小（字节）
  size: number;
}

// 缓存配置接口
interface CacheConfig {
  // 是否启用本地存储缓存
  enableLocalStorage: boolean;
  // 是否启用IndexedDB缓存
  enableIndexedDB: boolean;
  // 是否启用内存缓存
  enableMemoryCache: boolean;
  // 本地存储缓存最大大小（字节）
  localStorageMaxSize: number;
  // IndexedDB缓存最大大小（字节）
  indexedDBMaxSize: number;
  // 内存缓存最大大小（字节）
  memoryCacheMaxSize: number;
  // 默认缓存时间（毫秒）
  defaultTTL: number;
}

// 默认缓存配置
const defaultConfig: CacheConfig = {
  enableLocalStorage: true,
  enableIndexedDB: true,
  enableMemoryCache: true,
  localStorageMaxSize: 5 * 1024 * 1024, // 5MB
  indexedDBMaxSize: 50 * 1024 * 1024, // 50MB
  memoryCacheMaxSize: 20 * 1024 * 1024, // 20MB
  defaultTTL: 7 * 24 * 60 * 60 * 1000 // 7天
};

// 缓存状态
const cacheState = reactive({
  // 缓存配置
  config: { ...defaultConfig },
  // 内存缓存
  memoryCache: new Map<string, CacheItem>(),
  // 缓存统计信息
  stats: {
    // 总缓存大小（字节）
    totalSize: 0,
    // 缓存项数量
    itemCount: 0,
    // 缓存命中次数
    hitCount: 0,
    // 缓存未命中次数
    missCount: 0,
    // 缓存命中率
    hitRate: 0,
    // 是否正在加载统计信息
    loading: false
  }
});

// 是否支持Service Worker
export const isServiceWorkerSupported = ref('serviceWorker' in navigator);

// 是否支持Cache API
export const isCacheApiSupported = ref('caches' in window);

// 是否支持IndexedDB
export const isIndexedDBSupported = ref('indexedDB' in window);

// 是否支持localStorage
export const isLocalStorageSupported = ref((() => {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch (e) {
    return false;
  }
})());

/**
 * 初始化缓存管理器
 * @param config 缓存配置
 */
export function initStaticCache(config: Partial<CacheConfig> = {}): void {
  // 合并配置
  cacheState.config = { ...defaultConfig, ...config };
  
  // 加载缓存统计信息
  loadCacheStats();
  
  // 清理过期缓存
  cleanExpiredCache();
}

/**
 * 加载缓存统计信息
 */
export async function loadCacheStats(): Promise<void> {
  // 如果正在加载，则直接返回
  if (cacheState.stats.loading) {
    return;
  }
  
  // 标记为正在加载
  cacheState.stats.loading = true;
  
  try {
    // 获取Service Worker缓存统计信息
    if (isCacheApiSupported.value) {
      const swStats = await getCacheStats();
      
      // 更新统计信息
      cacheState.stats.totalSize = swStats.totalSize;
      cacheState.stats.itemCount = swStats.cacheNames.length;
    }
    
    // 获取内存缓存统计信息
    if (cacheState.config.enableMemoryCache) {
      let memorySize = 0;
      cacheState.memoryCache.forEach(item => {
        memorySize += item.size;
      });
      
      // 更新统计信息
      cacheState.stats.totalSize += memorySize;
      cacheState.stats.itemCount += cacheState.memoryCache.size;
    }
    
    // 计算命中率
    const totalRequests = cacheState.stats.hitCount + cacheState.stats.missCount;
    cacheState.stats.hitRate = totalRequests > 0 ? cacheState.stats.hitCount / totalRequests : 0;
  } catch (error) {
    console.error('加载缓存统计信息失败:', error);
  } finally {
    // 标记为加载完成
    cacheState.stats.loading = false;
  }
}

/**
 * 清理过期缓存
 */
export async function cleanExpiredCache(): Promise<void> {
  try {
    // 清理内存缓存
    if (cacheState.config.enableMemoryCache) {
      const now = Date.now();
      const expiredKeys: string[] = [];
      
      // 查找过期的缓存项
      cacheState.memoryCache.forEach((item, key) => {
        if (item.expireAt < now) {
          expiredKeys.push(key);
        }
      });
      
      // 删除过期的缓存项
      expiredKeys.forEach(key => {
        cacheState.memoryCache.delete(key);
      });
    }
    
    // 更新缓存统计信息
    await loadCacheStats();
  } catch (error) {
    console.error('清理过期缓存失败:', error);
  }
}

/**
 * 缓存资源
 * @param url 资源URL
 * @param data 资源数据
 * @param type 资源类型
 * @param ttl 缓存时间（毫秒）
 * @returns 是否成功缓存
 */
export async function cacheResource(
  url: string,
  data: any,
  type: string = 'unknown',
  ttl: number = cacheState.config.defaultTTL
): Promise<boolean> {
  try {
    // 计算资源大小
    const size = calculateResourceSize(data);
    
    // 创建缓存项
    const cacheItem: CacheItem = {
      url,
      type,
      cachedAt: Date.now(),
      expireAt: Date.now() + ttl,
      size
    };
    
    // 缓存到内存
    if (cacheState.config.enableMemoryCache) {
      // 检查内存缓存大小
      let currentSize = 0;
      cacheState.memoryCache.forEach(item => {
        currentSize += item.size;
      });
      
      // 如果超过最大大小，则清理最旧的缓存项
      if (currentSize + size > cacheState.config.memoryCacheMaxSize) {
        cleanOldestCache('memory', size);
      }
      
      // 缓存到内存
      cacheState.memoryCache.set(url, cacheItem);
    }
    
    // 更新缓存统计信息
    await loadCacheStats();
    
    return true;
  } catch (error) {
    console.error('缓存资源失败:', error);
    return false;
  }
}

/**
 * 获取缓存资源
 * @param url 资源URL
 * @returns 缓存的资源数据或null
 */
export async function getCachedResource(url: string): Promise<any> {
  try {
    // 检查内存缓存
    if (cacheState.config.enableMemoryCache) {
      const item = cacheState.memoryCache.get(url);
      
      // 如果找到缓存项且未过期
      if (item && item.expireAt > Date.now()) {
        // 更新命中统计
        cacheState.stats.hitCount++;
        return item;
      }
    }
    
    // 检查Service Worker缓存
    if (isCacheApiSupported.value) {
      const isCached = await isResourceCached(url);
      
      if (isCached) {
        // 更新命中统计
        cacheState.stats.hitCount++;
        return { url, cached: true };
      }
    }
    
    // 缓存未命中
    cacheState.stats.missCount++;
    return null;
  } catch (error) {
    console.error('获取缓存资源失败:', error);
    // 缓存未命中
    cacheState.stats.missCount++;
    return null;
  }
}

/**
 * 删除缓存资源
 * @param url 资源URL
 * @returns 是否成功删除
 */
export async function removeCachedResource(url: string): Promise<boolean> {
  try {
    // 从内存缓存中删除
    if (cacheState.config.enableMemoryCache) {
      cacheState.memoryCache.delete(url);
    }
    
    // 更新缓存统计信息
    await loadCacheStats();
    
    return true;
  } catch (error) {
    console.error('删除缓存资源失败:', error);
    return false;
  }
}

/**
 * 清除所有缓存
 * @returns 是否成功清除
 */
export async function clearAllCache(): Promise<boolean> {
  try {
    // 清除内存缓存
    if (cacheState.config.enableMemoryCache) {
      cacheState.memoryCache.clear();
    }
    
    // 清除Service Worker缓存
    if (isCacheApiSupported.value) {
      await clearAllCaches();
    }
    
    // 更新缓存统计信息
    await loadCacheStats();
    
    return true;
  } catch (error) {
    console.error('清除所有缓存失败:', error);
    return false;
  }
}

/**
 * 获取缓存统计信息
 * @returns 缓存统计信息
 */
export function getCacheStatistics() {
  return {
    ...cacheState.stats,
    formattedTotalSize: formatCacheSize(cacheState.stats.totalSize),
    hitRatePercentage: Math.round(cacheState.stats.hitRate * 100) + '%'
  };
}

/**
 * 计算资源大小
 * @param data 资源数据
 * @returns 资源大小（字节）
 */
function calculateResourceSize(data: any): number {
  // 如果是字符串，直接返回长度
  if (typeof data === 'string') {
    return data.length * 2; // 假设每个字符占用2字节
  }
  
  // 如果是Blob或File，返回大小
  if (data instanceof Blob || data instanceof File) {
    return data.size;
  }
  
  // 如果是ArrayBuffer，返回字节长度
  if (data instanceof ArrayBuffer) {
    return data.byteLength;
  }
  
  // 如果是对象，转换为JSON字符串后计算大小
  if (typeof data === 'object' && data !== null) {
    const json = JSON.stringify(data);
    return json.length * 2; // 假设每个字符占用2字节
  }
  
  // 默认返回0
  return 0;
}

/**
 * 清理最旧的缓存项
 * @param cacheType 缓存类型
 * @param requiredSpace 需要的空间（字节）
 */
function cleanOldestCache(cacheType: 'memory', requiredSpace: number): void {
  // 清理内存缓存
  if (cacheType === 'memory' && cacheState.config.enableMemoryCache) {
    // 按缓存时间排序
    const sortedItems = Array.from(cacheState.memoryCache.entries())
      .sort((a, b) => a[1].cachedAt - b[1].cachedAt);
    
    let freedSpace = 0;
    
    // 删除最旧的缓存项，直到释放足够的空间
    for (const [key, item] of sortedItems) {
      cacheState.memoryCache.delete(key);
      freedSpace += item.size;
      
      if (freedSpace >= requiredSpace) {
        break;
      }
    }
  }
}
