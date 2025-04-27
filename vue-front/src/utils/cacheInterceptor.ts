/**
 * Axios缓存拦截器
 * 为Axios请求添加缓存功能
 */
import axios, { isCancel, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
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
 * @param axios Axios实例
 */
export const setupCacheInterceptor = (axios: AxiosInstance): void => {
  // 请求拦截器
  axios.interceptors.request.use(
    async (config) => {
      // 如果请求不可缓存，直接发送请求
      if (!isCacheable(config)) {
        return config;
      }

      // 获取缓存选项
      const cacheOptions = getCacheOptions(config);

      // 如果强制刷新，直接发送请求
      if (cacheOptions.forceRefresh) {
        return config;
      }

      // 生成缓存键
      const cacheKey = generateCacheKey(config);

      // 尝试从缓存获取数据
      const cachedData = apiCache['storage'].get(cacheKey);

      // 如果缓存存在
      if (cachedData !== undefined) {
        // 如果需要在后台刷新缓存
        if (cacheOptions.backgroundRefresh) {
          // 标记为后台刷新，但仍然发送请求
          config.headers = config.headers || {};
          config.headers['X-Background-Refresh'] = 'true';
          return config;
        }

        try {
          // 创建一个取消令牌
          const { CancelToken } = axios;
          const source = CancelToken.source();

          // 取消请求，使用缓存数据
          config.cancelToken = source.token;
          source.cancel(JSON.stringify({
            type: 'CACHE_HIT',
            cacheKey,
            data: cachedData
          }));
        } catch (error) {
          console.error('Error in cache interceptor:', error);
          // 如果出错，继续发送请求
          return config;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // 响应拦截器
  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      // 如果请求不可缓存，直接返回响应
      if (!isCacheable(response.config)) {
        return response;
      }

      // 获取缓存选项
      const cacheOptions = getCacheOptions(response.config);

      // 生成缓存键
      const cacheKey = generateCacheKey(response.config);

      // 如果是后台刷新
      if (response.config.headers?.['X-Background-Refresh'] === 'true') {
        // 更新缓存但不影响原始响应
        apiCache['storage'].set(cacheKey, response.data, cacheOptions);
        return response;
      }

      // 缓存响应数据
      apiCache['storage'].set(cacheKey, response.data, cacheOptions);

      return response;
    },
    (error) => {
      // 如果是缓存命中导致的取消
      if (isCancel(error) && error.message) {
        try {
          const { type, data } = JSON.parse(error.message);

          if (type === 'CACHE_HIT') {
            // 返回缓存数据
            return Promise.resolve({
              status: 200,
              statusText: 'OK (cached)',
              headers: {},
              config: error.config,
              data,
              cached: true
            });
          }
        } catch (e) {
          // 解析错误，继续抛出原始错误
        }
      }

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
