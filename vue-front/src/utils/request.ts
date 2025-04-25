import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '@/stores/user'; // 用于获取 token
import { ElMessage } from 'element-plus'; // 用于错误提示
import errorHandler from '@/utils/errorHandler'; // 统一错误处理
import { ApiErrorCode, ErrorType, createApiError } from '@/types/error'; // 错误类型定义
import { setupCacheInterceptor } from '@/utils/cacheInterceptor'; // API缓存拦截器

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/', // API基础URL，从环境变量读取或默认为 '/'
  timeout: 10000, // 请求超时时间
});

// 设置缓存拦截器
setupCacheInterceptor(service);

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore();
    const token = userStore.token;

    // 如果存在 token，则添加到请求头
    if (token) {
      // 确保token是一个有效的字符串
      const tokenStr = String(token).trim();
      if (tokenStr) {
        config.headers.Authorization = `Bearer ${tokenStr}`;
      }
    }
    return config;
  },
  (error) => {
    // 使用统一错误处理
    const apiError = errorHandler.handleApiError(error, {
      showNotification: true,
      rethrow: false
    });

    return Promise.reject(apiError);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;

    // 如果响应头中包含新的token，则更新token
    const newToken = response.headers['new-token'];
    if (newToken) {
      const userStore = useUserStore();
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      userStore.setToken(newToken, rememberMe);
    }

    // 根据后端接口规范调整响应处理逻辑
    if (res.code && res.code !== ApiErrorCode.SUCCESS) {
      // 创建API错误对象
      const errorType = res.code === ApiErrorCode.UNAUTHORIZED || res.code === ApiErrorCode.FORBIDDEN
        ? ErrorType.AUTH
        : res.code >= 1000 && res.code < 2000
          ? ErrorType.BUSINESS
          : ErrorType.SERVER;

      const apiError = createApiError(
        res.code,
        res.message || 'Error',
        errorType,
        {
          url: response.config.url,
          method: response.config.method,
          params: response.config.params,
          data: response.config.data,
          status: response.status,
          response: res
        }
      );

      // 使用统一错误处理
      errorHandler.handleApiError(apiError, {
        showNotification: true,
        rethrow: false
      });

      return Promise.reject(apiError);
    }

    // 如果响应正常，直接返回响应数据
    return res;
  },
  (error) => {
    // 使用统一错误处理
    const apiError = errorHandler.handleApiError(error, {
      showNotification: true,
      rethrow: false
    });

    return Promise.reject(apiError);
  }
);

export default service;