import axios from 'axios';
// 导入 Axios 的类型定义，用于 TypeScript 的类型检查
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
// 导入用户状态管理 store，用于获取和设置 token
import { useUserStore } from '@/stores/user';
// 导入 Element Plus 的消息提示组件
import { ElMessage } from 'element-plus';
// 导入自定义的统一错误处理器
import errorHandler from '@/utils/errorHandler';
// 导入自定义的错误类型和创建函数
import { ApiErrorCode, ErrorType, createApiError } from '@/types/error';
// 导入 API 缓存拦截器的设置函数
import { setupCacheInterceptor } from '@/utils/cacheInterceptor';
// 导入数据转换工具
// 注释掉数据转换相关导入，我们不再需要它们
// import { camelToSnake, snakeToCamel } from '@/utils/dataTransformer';
// 导入时区验证工具
import { validateApiTimezoneInfo } from '@/utils/timezoneValidator';
// 类型扩展 - 直接在这里扩展 AxiosRequestConfig 接口
declare module 'axios' {
  export interface AxiosRequestConfig {
    // 是否启用重试
    retry?: boolean;
    // 重试次数
    retryCount?: number;
    // 重试延迟（毫秒）
    retryDelay?: number;
    // 内部重试计数器
    __retryCount?: number;
  }
}

// 创建 axios 实例，用于发起 HTTP 请求
const service: AxiosInstance = axios.create({
  // API 的基础 URL，从环境变量 VITE_API_BASE_URL 读取，若未设置则默认为 '/'
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  // 请求超时时间，单位毫秒，增加到30秒以处理可能的数据库延迟
  timeout: 30000,
});

// 为创建的 axios 实例设置缓存拦截器
setupCacheInterceptor(service);

// 请求拦截器：在请求发送之前执行
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 获取用户 store 实例
    const userStore = useUserStore();
    // 从 store 中获取当前的 token
    const token = userStore.token;

    // 调试日志
    console.log('Request URL:', config.url);
    console.log('Request Method:', config.method);
    console.log('Request Data:', config.data);
    console.log('Token:', token);

    // 直接使用原始数据，保持驼峰命名
    if (config.data && typeof config.data === 'object') {
      console.log('Request Data (camelCase):', config.data);
    }

    if (config.params && typeof config.params === 'object') {
      console.log('Request Params (camelCase):', config.params);
    }

    // 如果存在 token，则将其添加到请求头的 Authorization 字段中
    if (token) {
      // 确保 token 是有效的非空字符串
      const tokenStr = String(token).trim();
      if (tokenStr) {
        // 通常使用 Bearer Token 方案
        config.headers.Authorization = `Bearer ${tokenStr}`;
        console.log('Added Authorization header:', `Bearer ${tokenStr.substring(0, 10)}...`);
      }
    }
    // 返回修改后的请求配置
    return config;
  },
  (error) => {
    // 处理请求发送前的错误（例如网络问题、配置错误等）
    // 使用统一错误处理器处理错误
    const apiError = errorHandler.handleApiError(error, {
      showNotification: true, // 配置为显示错误通知
      rethrow: false // 配置为不重新抛出错误，避免上层重复处理
    });
    // 返回一个被拒绝的 Promise，并将处理后的错误对象传递出去
    return Promise.reject(apiError);
  }
);

// 响应拦截器：在接收到响应之后执行
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 调试日志
    console.log('Response URL:', response.config.url);
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);

    // 从响应对象中获取响应体数据
    const res = response.data;

    // 注释掉名称转换相关代码
    // 不再进行下划线命名法和驼峰命名法之间的转换
    /*
    // 恢复数据转换，将下划线命名法（snake_case）转换为驼峰命名法（camelCase）
    if (res && res.data && typeof res.data === 'object') {
      res.data = snakeToCamel(res.data);
      console.log('Transformed Response Data:', res.data);
    }
    */

    // 直接使用原始数据，保持驼峰命名
    if (res && res.data && typeof res.data === 'object') {
      console.log('Response Data (camelCase):', res.data);

      // 验证API响应中的时区信息完整性
      try {
        const timezoneValidation = validateApiTimezoneInfo(res.data);
        if (!timezoneValidation.isValid && timezoneValidation.dateFields.length > 0) {
          console.warn('API响应时区验证警告:', {
            url: response.config.url,
            dateFields: timezoneValidation.dateFields,
            issues: timezoneValidation.issues
          });

          // 在开发环境中显示详细的时区警告
          if (import.meta.env.DEV) {
            console.group('🕐 时区信息验证警告');
            console.warn(`接口: ${response.config.url}`);
            console.warn(`发现 ${timezoneValidation.dateFields.length} 个日期字段`);
            console.warn('问题详情:', timezoneValidation.issues);
            console.groupEnd();
          }
        } else if (timezoneValidation.dateFields.length > 0) {
          console.info('✅ API响应时区验证通过:', {
            url: response.config.url,
            dateFields: timezoneValidation.dateFields
          });
        }
      } catch (timezoneError) {
        console.error('时区验证过程中发生错误:', timezoneError);
      }
    }

    // 检查响应头中是否包含新的 token（用于 token 刷新机制）
    const newToken = response.headers['new-token'];
    if (newToken) {
      // 如果有新 token，更新用户 store 中的 token
      const userStore = useUserStore();
      // 检查用户是否选择了 "记住我"
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      // 使用 store 的 setToken 方法更新 token，并根据 rememberMe 决定存储方式
      userStore.setToken(newToken, rememberMe);
    }

    // 根据后端接口规范，检查响应体中的业务状态码 (res.code)
    // 如果存在 code 字段且不等于约定的成功码 (ApiErrorCode.SUCCESS)
    if (res.code && res.code !== ApiErrorCode.SUCCESS) {
      // 根据后端返回的错误码创建前端的 API 错误对象
      // 判断错误类型：认证错误、权限错误、业务错误、服务器错误
      let errorType: ErrorType;
      if (res.code === ApiErrorCode.UNAUTHORIZED) { // 401
        errorType = ErrorType.AUTH;
      } else if (res.code === ApiErrorCode.FORBIDDEN) { // 403
        errorType = ErrorType.PERMISSION;
      } else if (res.code >= 1000 && res.code < 2000) { // 1xxx
        errorType = ErrorType.BUSINESS;
      } else { // 其他错误码 (如 5xx)
        errorType = ErrorType.SERVER;
      }

      // 特殊处理认证错误 (401)
      if (res.code === ApiErrorCode.UNAUTHORIZED) {
        // Token无效或过期，清除用户状态并跳转到登录页
        const userStore = useUserStore();
        userStore.resetAuth();
        // 避免在登录页面再次跳转到登录页
        if (window.location.pathname !== '/login') {
          console.log('Redirecting to login page due to unauthorized access');
          ElMessage.error('登录状态已过期，请重新登录');
          window.location.href = '/login';
          return Promise.reject(new Error('登录状态已过期，请重新登录'));
        }
      }

      // 使用 createApiError 创建结构化的错误对象，包含详细信息
      const apiError = createApiError(
        res.code, // 后端返回的错误码
        res.message || 'Error', // 后端返回的错误信息或默认值
        errorType, // 前端定义的错误类型
        {
          url: response.config.url, // 请求 URL
          method: response.config.method, // 请求方法
          params: response.config.params, // 请求参数 (GET)
          data: response.config.data, // 请求体数据 (POST/PUT)
          status: response.status, // HTTP 状态码
          response: res // 完整的后端响应体
        }
      );

      // 使用统一错误处理器处理这个 API 错误（例如，弹出错误消息）
      errorHandler.handleApiError(apiError, {
        showNotification: true, // 配置为显示错误通知
        rethrow: false // 配置为不重新抛出错误
      });

      // 返回一个被拒绝的 Promise，并将 API 错误对象传递出去
      // 这会阻止调用方代码中的 .then() 执行，直接进入 .catch()
      return Promise.reject(apiError);
    }

    // 如果响应正常（没有业务错误码或 code 为成功码），直接返回响应体数据 `res`
    // 这样在调用 API 的地方可以通过 .then(data => ...) 直接获取后端返回的核心数据
    return res;
  },
  async (error) => {
    // 调试日志
    console.error('Response Error:', error);
    console.error('Error Config:', error.config);
    console.error('Error Message:', error.message);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    }

    // 处理重试逻辑
    const config = error.config;
    if (config && config.retry) {
      // 设置重试计数器
      config.__retryCount = config.__retryCount || 0;

      // 如果未达到最大重试次数，则重试
      if (config.__retryCount < (config.retryCount || 3)) {
        // 增加重试计数
        config.__retryCount += 1;

        console.log(`Retrying request (${config.__retryCount}/${config.retryCount || 3}): ${config.url}`);

        // 创建延迟Promise
        const delayRetry = new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, (config.retryDelay || 1000) * config.__retryCount);
        });

        // 等待延迟后重试请求
        await delayRetry;
        return service(config);
      }
    }

    // 如果不需要重试或已达到最大重试次数，则处理错误
    // 处理 HTTP 层面的错误（例如网络断开、超时、500 服务器错误等）
    // 使用统一错误处理器处理错误
    const apiError = errorHandler.handleApiError(error, {
      showNotification: true, // 配置为显示错误通知
      rethrow: false // 配置为不重新抛出错误
    });
    // 返回一个被拒绝的 Promise，并将处理后的错误对象传递出去
    return Promise.reject(apiError);
  }
);

// 导出配置好的 axios 实例，供项目其他地方导入和使用
export default service;