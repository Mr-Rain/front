/**
 * 带缓存的API示例
 * 展示如何在实际API中使用缓存功能
 */
import request from '@/utils/request';
import apiCache from '@/utils/apiCache';
import type { CacheOptions } from '@/utils/apiCache';

/**
 * 获取用户列表
 * @param params 查询参数
 * @param options 缓存选项
 * @returns 用户列表
 */
export const getUserList = (params?: any, options?: CacheOptions) => {
  // 使用默认缓存选项
  const defaultOptions: CacheOptions = {
    ttl: 5 * 60 * 1000, // 5分钟
    tags: ['user', 'list'],
    backgroundRefresh: true
  };
  
  // 合并选项
  const mergedOptions = { ...defaultOptions, ...options };
  
  // 创建请求函数
  const requestFunc = () => request({
    url: '/api/users',
    method: 'get',
    params,
    cache: mergedOptions
  });
  
  // 使用apiCache.wrap包装请求函数
  return apiCache.wrap(requestFunc, mergedOptions)();
};

/**
 * 获取用户详情
 * @param id 用户ID
 * @param options 缓存选项
 * @returns 用户详情
 */
export const getUserDetail = (id: number | string, options?: CacheOptions) => {
  // 使用默认缓存选项
  const defaultOptions: CacheOptions = {
    ttl: 10 * 60 * 1000, // 10分钟
    tags: ['user', 'detail', `user:${id}`]
  };
  
  // 合并选项
  const mergedOptions = { ...defaultOptions, ...options };
  
  // 直接使用request的cache选项
  return request({
    url: `/api/users/${id}`,
    method: 'get',
    cache: mergedOptions
  });
};

/**
 * 获取文章列表
 * @param params 查询参数
 * @param options 缓存选项
 * @returns 文章列表
 */
export const getArticleList = (params?: any, options?: CacheOptions) => {
  return request({
    url: '/api/articles',
    method: 'get',
    params,
    cache: options || {
      ttl: 3 * 60 * 1000, // 3分钟
      tags: ['article', 'list']
    }
  });
};

/**
 * 获取文章详情
 * @param id 文章ID
 * @param options 缓存选项
 * @returns 文章详情
 */
export const getArticleDetail = (id: number | string, options?: CacheOptions) => {
  return request({
    url: `/api/articles/${id}`,
    method: 'get',
    cache: options || {
      ttl: 5 * 60 * 1000, // 5分钟
      tags: ['article', 'detail', `article:${id}`]
    }
  });
};

/**
 * 创建文章（不缓存）
 * @param data 文章数据
 * @returns 创建结果
 */
export const createArticle = (data: any) => {
  return request({
    url: '/api/articles',
    method: 'post',
    data,
    // 清除相关缓存
    cache: false
  }).then(response => {
    // 创建成功后，清除文章列表缓存
    apiCache.clearByTag('article:list');
    return response;
  });
};

/**
 * 更新文章（不缓存）
 * @param id 文章ID
 * @param data 文章数据
 * @returns 更新结果
 */
export const updateArticle = (id: number | string, data: any) => {
  return request({
    url: `/api/articles/${id}`,
    method: 'put',
    data,
    // 不缓存
    cache: false
  }).then(response => {
    // 更新成功后，清除相关缓存
    apiCache.clearByTags(['article:list', `article:${id}`]);
    return response;
  });
};

/**
 * 删除文章（不缓存）
 * @param id 文章ID
 * @returns 删除结果
 */
export const deleteArticle = (id: number | string) => {
  return request({
    url: `/api/articles/${id}`,
    method: 'delete',
    // 不缓存
    cache: false
  }).then(response => {
    // 删除成功后，清除相关缓存
    apiCache.clearByTags(['article:list', `article:${id}`]);
    return response;
  });
};
