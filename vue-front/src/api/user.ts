import request from '@/utils/request'; // 假设封装了 axios 或 fetch
import type { UserInfo } from '@/types/user';

// 登录接口
// TODO: 定义登录请求参数类型 LoginPayload 和响应类型 LoginResponse
export function login(data: any) {
  return request({
    url: '/api/auth/login', // 后端登录接口地址
    method: 'post',
    data,
  });
}

// 注册接口
// TODO: 定义注册请求参数类型 RegisterPayload
export function register(data: any) {
  return request({
    url: '/api/auth/register', // 后端注册接口地址
    method: 'post',
    data,
  });
}

// 获取用户信息接口
export function getUserInfo(): Promise<{ data: UserInfo }> { // 明确返回类型包含 UserInfo
  // return request({
  //   url: '/api/user/profile', // 后端获取用户信息接口地址
  //   method: 'get',
  // });
  // ---- Mock Data Start ----
  console.warn('API MOCK: getUserInfo is using mock data.');
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUserInfo: UserInfo = {
        id: '1',
        username: 'mockUserFromApi',
        user_type: 'student',
        avatar: 'https://via.placeholder.com/150',
        email: 'mock@example.com'
      };
      resolve({ data: mockUserInfo });
    }, 500); // 模拟网络延迟
  });
  // ---- Mock Data End ----
}

// 登出接口
export function logout() {
  return request({
    url: '/api/auth/logout', // 后端登出接口地址
    method: 'post',
  });
}

// 忘记密码接口
// TODO: 定义忘记密码请求参数类型 ForgotPasswordPayload
export function forgotPassword(data: any) {
  return request({
    url: '/api/auth/forgot-password', // 后端忘记密码接口地址
    method: 'post',
    data,
  });
}

// 可以在此文件中继续添加其他用户相关的接口，例如修改密码、更新个人信息等 