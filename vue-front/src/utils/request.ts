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

    // TODO: 根据后端接口规范调整响应处理逻辑
    // 示例：如果后端返回的 code 不是成功状态码，则视为错误
    // if (res.code !== 200) {
    //   ElMessage({
    //     message: res.message || 'Error',
    //     type: 'error',
    //     duration: 5 * 1000,
    //   });

    //   // 示例：处理特定的错误码，如 token 失效
    //   if (res.code === 401 || res.code === 403) {
    //     // 处理 token 失效或无权限的情况，例如跳转到登录页
    //     const userStore = useUserStore();
    //     userStore.logout();
    //     // router.push(`/login?redirect=${router.currentRoute.value.fullPath}`);
    //   }
    //   return Promise.reject(new Error(res.message || 'Error'));
    // }

    // 如果响应正常，直接返回响应数据
    return res;
  },
  (error) => {
    console.error('Response Error:', error); // for debug
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  }
);

export default service; 