import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

// 请求缓存
interface CacheItem {
  data: any
  timestamp: number
  expiry: number
}

// 缓存存储
const cache = new Map<string, CacheItem>()

// 防抖存储
const pendingRequests = new Map<string, Promise<any>>()

/**
 * 生成缓存键
 * @param config 请求配置
 * @returns 缓存键
 */
function generateCacheKey(config: AxiosRequestConfig): string {
  const { url, method, params, data } = config
  return `${method || 'GET'}-${url}-${JSON.stringify(params || {})}-${JSON.stringify(data || {})}`
}

/**
 * 检查缓存是否有效
 * @param key 缓存键
 * @returns 是否有效
 */
function isCacheValid(key: string): boolean {
  const item = cache.get(key)
  if (!item) return false

  const now = Date.now()
  return now < item.timestamp + item.expiry
}

/**
 * 获取缓存数据
 * @param key 缓存键
 * @returns 缓存数据
 */
function getCacheData(key: string): any {
  const item = cache.get(key)
  return item?.data
}

/**
 * 设置缓存数据
 * @param key 缓存键
 * @param data 数据
 * @param expiry 过期时间（毫秒）
 */
function setCacheData(key: string, data: any, expiry: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiry
  })
}

/**
 * 清除缓存
 * @param pattern 匹配模式（可选）
 */
export function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear()
    return
  }

  const regex = new RegExp(pattern)
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key)
    }
  }
}

/**
 * 优化的请求函数
 * @param config 请求配置
 * @param options 优化选项
 * @returns 请求结果
 */
export async function optimizedRequest<T = any>(
  config: AxiosRequestConfig,
  options: {
    useCache?: boolean
    cacheTime?: number
    debounce?: boolean
    retries?: number
    retryDelay?: number
  } = {}
): Promise<T> {
  const {
    useCache = false,
    cacheTime = 60000, // 默认缓存1分钟
    debounce = false,
    retries = 0,
    retryDelay = 1000
  } = options

  const cacheKey = generateCacheKey(config)

  // 如果启用缓存并且缓存有效，直接返回缓存数据
  if (useCache && isCacheValid(cacheKey)) {
    return getCacheData(cacheKey)
  }

  // 如果启用防抖并且有相同的请求正在进行中，返回该请求的Promise
  if (debounce && pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey) as Promise<T>
  }

  // 创建请求Promise
  const requestPromise = makeRequest(config, retries, retryDelay)

  // 如果启用防抖，将请求Promise存储起来
  if (debounce) {
    pendingRequests.set(cacheKey, requestPromise)

    // 请求完成后删除
    requestPromise.finally(() => {
      pendingRequests.delete(cacheKey)
    })
  }

  // 执行请求
  try {
    const response = await requestPromise

    // 如果启用缓存，将结果缓存起来
    if (useCache) {
      setCacheData(cacheKey, response, cacheTime)
    }

    return response
  } catch (error) {
    throw error
  }
}

/**
 * 执行请求（带重试）
 * @param config 请求配置
 * @param retries 重试次数
 * @param retryDelay 重试延迟（毫秒）
 * @returns 请求结果
 */
async function makeRequest<T = any>(
  config: AxiosRequestConfig,
  retries: number,
  retryDelay: number
): Promise<T> {
  try {
    const response = await axios(config)
    return response.data
  } catch (error: any) {
    // 如果还有重试次数，并且错误是网络错误或服务器错误（5xx），则重试
    if (
      retries > 0 &&
      (error.message.includes('Network Error') ||
        (error.response && error.response.status >= 500))
    ) {
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, retryDelay))

      // 递归调用，减少重试次数
      return makeRequest(config, retries - 1, retryDelay)
    }

    throw error
  }
}

/**
 * 批量请求函数
 * @param requests 请求配置数组
 * @param options 批量请求选项
 * @returns 请求结果数组
 */
export async function batchRequests<T = any[]>(
  requests: AxiosRequestConfig[],
  options: {
    concurrency?: number
    allSettled?: boolean
  } = {}
): Promise<T[]> {
  const { concurrency = 5, allSettled = false } = options

  // 如果请求数量小于并发数，直接全部发送
  if (requests.length <= concurrency) {
    if (allSettled) {
      const results = await Promise.allSettled(
        requests.map(config => axios(config).then(res => res.data))
      )

      return results.map(result =>
        result.status === 'fulfilled' ? result.value : null
      ) as T[]
    } else {
      const responses = await Promise.all(
        requests.map(config => axios(config).then(res => res.data))
      )

      return responses as T[]
    }
  }

  // 分批发送请求
  const results: T[] = []

  // 将请求分成多个批次
  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency)

    if (allSettled) {
      const batchResults = await Promise.allSettled(
        batch.map(config => axios(config).then(res => res.data))
      )

      results.push(
        ...batchResults.map(result =>
          result.status === 'fulfilled' ? result.value : null
        ) as T[]
      )
    } else {
      const batchResponses = await Promise.all(
        batch.map(config => axios(config).then(res => res.data))
      )

      results.push(...batchResponses as T[])
    }
  }

  return results
}

/**
 * 创建预加载函数
 * @param config 请求配置
 * @param cacheTime 缓存时间（毫秒）
 */
export function preloadRequest(
  config: AxiosRequestConfig,
  cacheTime: number = 60000
): void {
  const cacheKey = generateCacheKey(config)

  // 如果缓存已存在且有效，不需要预加载
  if (isCacheValid(cacheKey)) return

  // 在后台发送请求并缓存结果
  axios(config)
    .then(response => {
      setCacheData(cacheKey, response.data, cacheTime)
    })
    .catch(() => {
      // 预加载失败不做处理
    })
}

export default {
  optimizedRequest,
  batchRequests,
  preloadRequest,
  clearCache
}
