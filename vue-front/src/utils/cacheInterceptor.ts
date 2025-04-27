/**
 * Axios缓存拦截器
 * 为Axios请求添加缓存功能
 */
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import apiCache from './apiCache';
import type { CacheOptions } from './apiCache';

// 扩展AxiosRequestConfig，添加缓存选项
declare module 'axios' {
  interface AxiosRequestConfig {
    cache?: CacheOptions | boolean;
  }
}

// 缓存键生成函数
const generateCacheKey = (config: AxiosRequestConfig): string => {
  const { url, method, params, data } = config;
  const methodStr = method ? method.toLowerCase() : 'get';
  const paramsStr = params ? JSON.stringify(params) : '';
  const dataStr = data ? JSON.stringify(data) : '';

  return `${methodStr}:${url}:${paramsStr}:${dataStr}`;
};

// 判断请求是否可缓存
const isCacheable = (config: AxiosRequestConfig): boolean => {
  // 只缓存GET请求
  if (config.method && config.method.toLowerCase() !== 'get') {
    return false;
  }

  // 检查缓存配置
  if (config.cache === false) {
    return false;
  }

  return true;
};

// 获取缓存选项
const getCacheOptions = (config: AxiosRequestConfig): CacheOptions => {
  // 默认缓存选项
  const defaultOptions: CacheOptions = {
    ttl: 5 * 60 * 1000, // 5分钟
    tags: [],
    forceRefresh: false,
    backgroundRefresh: false
  };

  // 如果缓存配置是布尔值true，使用默认选项
  if (config.cache === true) {
    return defaultOptions;
  }

  // 如果缓存配置是对象，合并默认选项
  if (typeof config.cache === 'object') {
    return { ...defaultOptions, ...config.cache };
  }

  // 默认返回默认选项
  return defaultOptions;
};

/**
 * 添加缓存拦截器
 * @param axiosInstance Axios实例
 */
export const setupCacheInterceptor = (axiosInstance: AxiosInstance): void => {
  // 请求拦截器 - 不做任何处理，直接发送请求
  axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  );

  // 响应拦截器
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      // 如果请求不可缓存，直接返回响应
      if (!isCacheable(response.config)) {
        return response;
      }

      // 获取缓存选项
      const cacheOptions = getCacheOptions(response.config);

      // 生成缓存键
      const cacheKey = generateCacheKey(response.config);

      // 尝试从缓存获取数据
      const cachedData = apiCache['storage'].get(cacheKey);

      // 如果缓存存在且不是强制刷新
      if (cachedData !== undefined && !cacheOptions.forceRefresh) {
        console.log('Using cached data for:', response.config.url);
        return {
          ...response,
          data: cachedData,
          status: 200,
          statusText: 'OK (cached)',
          cached: true
        };
      }

      // 缓存响应数据
      apiCache['storage'].set(cacheKey, response.data, cacheOptions);

      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

/**
 * 清除所有缓存
 */
export const clearAllCache = (): void => {
  apiCache.clearAll();
};

/**
 * 根据标签清除缓存
 * @param tag 标签
 */
export const clearCacheByTag = (tag: string): void => {
  apiCache.clearByTag(tag);
};

/**
 * 根据多个标签清除缓存
 * @param tags 标签数组
 */
export const clearCacheByTags = (tags: string[]): void => {
  apiCache.clearByTags(tags);
};

/**
 * 根据URL前缀清除缓存
 * @param urlPrefix URL前缀
 */
export const clearCacheByUrlPrefix = (urlPrefix: string): void => {
  apiCache.clearByUrlPrefix(urlPrefix);
};

/**
 * 获取缓存统计信息
 * @returns 缓存统计信息
 */
export const getCacheStats = (): { size: number, tagCount: number } => {
  return apiCache.getStats();
};
