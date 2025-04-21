import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '@/stores/user'; // 用于获取 token
import { ElMessage } from 'element-plus'; // 用于错误提示

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/', // API基础URL，从环境变量读取或默认为 '/'
  timeout: 10000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore();
    const token = userStore.token;

    // 如果存在 token，则添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 处理请求错误
    console.error('Request Error:', error); // for debug
    return Promise.reject(error);
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
    if (res.code && res.code !== 200) {
      ElMessage({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000,
      });

      // 处理特定的错误码，如 token 失效
      if (res.code === 401 || res.code === 403) {
        // 处理 token 失效或无权限的情况
        const userStore = useUserStore();
        userStore.resetAuth();
        // 将当前路径作为重定向参数，登录后可以跳回
        window.location.href = `/login?redirect=${window.location.pathname}`;
      }
      return Promise.reject(new Error(res.message || 'Error'));
    }

    // 如果响应正常，直接返回响应数据
    return res;
  },
  (error) => {
    console.error('Response Error:', error); // for debug

    // 处理请求超时
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      ElMessage({
        message: '请求超时，请检查网络连接',
        type: 'error',
        duration: 5 * 1000,
      });
      return Promise.reject(error);
    }

    // 处理服务器错误
    if (error.response) {
      const { status } = error.response;

      // 处理401和403错误（未授权或token失效）
      if (status === 401 || status === 403) {
        const userStore = useUserStore();
        userStore.resetAuth();
        window.location.href = `/login?redirect=${window.location.pathname}`;
      }

      // 显示错误消息
      ElMessage({
        message: error.response.data?.message || `请求失败，状态码: ${status}`,
        type: 'error',
        duration: 5 * 1000,
      });
    } else {
      // 网络错误
      ElMessage({
        message: '网络错误，请检查您的网络连接',
        type: 'error',
        duration: 5 * 1000,
      });
    }

    return Promise.reject(error);
  }
);

export default service;