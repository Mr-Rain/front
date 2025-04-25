/**
 * API缓存工具
 * 提供API请求的缓存功能，减少重复请求，提高应用性能
 */

// 缓存项接口
interface CacheItem<T = any> {
  // 缓存数据
  data: T;
  // 过期时间戳
  expireAt: number;
  // 缓存标签（用于批量清除）
  tags?: string[];
}

// 缓存配置接口
export interface CacheOptions {
  // 缓存时间（毫秒），默认5分钟
  ttl?: number;
  // 缓存标签（用于批量清除）
  tags?: string[];
  // 是否强制刷新（忽略缓存）
  forceRefresh?: boolean;
  // 是否在后台刷新（返回缓存数据但同时更新缓存）
  backgroundRefresh?: boolean;
  // 缓存键生成函数
  keyGenerator?: (url: string, params?: any, data?: any) => string;
}

// 默认缓存配置
const defaultOptions: CacheOptions = {
  ttl: 5 * 60 * 1000, // 5分钟
  tags: [],
  forceRefresh: false,
  backgroundRefresh: false
};

// 默认缓存键生成函数
const defaultKeyGenerator = (url: string, params?: any, data?: any): string => {
  // 将URL、参数和数据组合成缓存键
  const paramsStr = params ? JSON.stringify(params) : '';
  const dataStr = data ? JSON.stringify(data) : '';
  return `${url}:${paramsStr}:${dataStr}`;
};

// 缓存存储
class CacheStorage {
  private storage: Map<string, CacheItem> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  
  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param options 缓存选项
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = defaultOptions.ttl, tags = [] } = options;
    
    // 计算过期时间
    const expireAt = Date.now() + (ttl || 0);
    
    // 存储缓存项
    this.storage.set(key, { data, expireAt, tags });
    
    // 更新标签索引
    tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)?.add(key);
    });
    
    // 清理过期缓存
    this.cleanup();
  }
  
  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存数据或undefined（如果不存在或已过期）
   */
  get<T>(key: string): T | undefined {
    const item = this.storage.get(key);
    
    // 如果缓存不存在或已过期，返回undefined
    if (!item || item.expireAt < Date.now()) {
      if (item) {
        // 删除过期缓存
        this.delete(key);
      }
      return undefined;
    }
    
    return item.data as T;
  }
  
  /**
   * 删除缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    const item = this.storage.get(key);
    if (item) {
      // 从标签索引中删除
      item.tags?.forEach(tag => {
        this.tagIndex.get(tag)?.delete(key);
        // 如果标签没有关联的键，删除标签
        if (this.tagIndex.get(tag)?.size === 0) {
          this.tagIndex.delete(tag);
        }
      });
      
      // 从存储中删除
      this.storage.delete(key);
    }
  }
  
  /**
   * 清除所有缓存
   */
  clear(): void {
    this.storage.clear();
    this.tagIndex.clear();
  }
  
  /**
   * 根据标签清除缓存
   * @param tag 标签
   */
  clearByTag(tag: string): void {
    const keys = this.tagIndex.get(tag);
    if (keys) {
      // 删除所有关联的缓存项
      keys.forEach(key => this.delete(key));
      // 删除标签
      this.tagIndex.delete(tag);
    }
  }
  
  /**
   * 根据多个标签清除缓存
   * @param tags 标签数组
   */
  clearByTags(tags: string[]): void {
    tags.forEach(tag => this.clearByTag(tag));
  }
  
  /**
   * 根据URL前缀清除缓存
   * @param urlPrefix URL前缀
   */
  clearByUrlPrefix(urlPrefix: string): void {
    // 查找所有以指定前缀开头的缓存键
    const keysToDelete: string[] = [];
    this.storage.forEach((_, key) => {
      if (key.startsWith(urlPrefix)) {
        keysToDelete.push(key);
      }
    });
    
    // 删除匹配的缓存项
    keysToDelete.forEach(key => this.delete(key));
  }
  
  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    // 查找所有过期的缓存项
    this.storage.forEach((item, key) => {
      if (item.expireAt < now) {
        keysToDelete.push(key);
      }
    });
    
    // 删除过期的缓存项
    keysToDelete.forEach(key => this.delete(key));
  }
  
  /**
   * 获取缓存统计信息
   * @returns 缓存统计信息
   */
  getStats(): { size: number, tagCount: number } {
    return {
      size: this.storage.size,
      tagCount: this.tagIndex.size
    };
  }
}

// 创建缓存存储实例
const cacheStorage = new CacheStorage();

/**
 * API缓存类
 */
class ApiCache {
  private storage: CacheStorage;
  
  constructor(storage: CacheStorage) {
    this.storage = storage;
  }
  
  /**
   * 包装API请求函数，添加缓存功能
   * @param apiFunc API请求函数
   * @param options 缓存选项
   * @returns 包装后的API请求函数
   */
  wrap<T, P extends any[]>(
    apiFunc: (...args: P) => Promise<T>,
    options: CacheOptions = {}
  ): (...args: P) => Promise<T> {
    return async (...args: P): Promise<T> => {
      // 合并选项
      const mergedOptions: CacheOptions = { ...defaultOptions, ...options };
      
      // 生成缓存键
      const cacheKey = this.generateCacheKey(apiFunc.name, args, mergedOptions);
      
      // 如果强制刷新，则跳过缓存
      if (mergedOptions.forceRefresh) {
        const data = await apiFunc(...args);
        this.storage.set(cacheKey, data, mergedOptions);
        return data;
      }
      
      // 尝试从缓存获取数据
      const cachedData = this.storage.get<T>(cacheKey);
      
      // 如果缓存存在且未过期
      if (cachedData !== undefined) {
        // 如果需要在后台刷新缓存
        if (mergedOptions.backgroundRefresh) {
          // 异步刷新缓存
          this.refreshCache(apiFunc, args, cacheKey, mergedOptions);
        }
        
        return cachedData;
      }
      
      // 缓存不存在或已过期，发起请求
      const data = await apiFunc(...args);
      
      // 缓存响应数据
      this.storage.set(cacheKey, data, mergedOptions);
      
      return data;
    };
  }
  
  /**
   * 在后台刷新缓存
   * @param apiFunc API请求函数
   * @param args 请求参数
   * @param cacheKey 缓存键
   * @param options 缓存选项
   */
  private async refreshCache<T, P extends any[]>(
    apiFunc: (...args: P) => Promise<T>,
    args: P,
    cacheKey: string,
    options: CacheOptions
  ): Promise<void> {
    try {
      // 异步发起请求
      const data = await apiFunc(...args);
      
      // 更新缓存
      this.storage.set(cacheKey, data, options);
    } catch (error) {
      // 忽略后台刷新错误
      console.warn('Background cache refresh failed:', error);
    }
  }
  
  /**
   * 生成缓存键
   * @param funcName 函数名称
   * @param args 函数参数
   * @param options 缓存选项
   * @returns 缓存键
   */
  private generateCacheKey(funcName: string, args: any[], options: CacheOptions): string {
    // 如果提供了自定义键生成函数，则使用它
    if (options.keyGenerator) {
      return options.keyGenerator(funcName, ...args);
    }
    
    // 否则使用默认键生成函数
    return `${funcName}:${JSON.stringify(args)}`;
  }
  
  /**
   * 清除所有缓存
   */
  clearAll(): void {
    this.storage.clear();
  }
  
  /**
   * 根据标签清除缓存
   * @param tag 标签
   */
  clearByTag(tag: string): void {
    this.storage.clearByTag(tag);
  }
  
  /**
   * 根据多个标签清除缓存
   * @param tags 标签数组
   */
  clearByTags(tags: string[]): void {
    this.storage.clearByTags(tags);
  }
  
  /**
   * 根据URL前缀清除缓存
   * @param urlPrefix URL前缀
   */
  clearByUrlPrefix(urlPrefix: string): void {
    this.storage.clearByUrlPrefix(urlPrefix);
  }
  
  /**
   * 获取缓存统计信息
   * @returns 缓存统计信息
   */
  getStats(): { size: number, tagCount: number } {
    return this.storage.getStats();
  }
}

// 创建API缓存实例
const apiCache = new ApiCache(cacheStorage);

export default apiCache;
