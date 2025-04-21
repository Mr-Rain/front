import request from '@/utils/request'; // 假设封装了 axios 或 fetch
import type { UserInfo, UserStatus } from '@/types/user';

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
  //   url: '/api/auth/me',
  //   method: 'get',
  // });
  // ---- Mock Data Start ----
  console.warn('API MOCK: getUserInfo is using mock data.');
  return new Promise((resolve) => {
    setTimeout(() => {
      // 从localStorage获取当前模拟的用户角色
      const mockUserType = localStorage.getItem('mockUserType') || 'student';

      // 根据不同角色返回不同的模拟用户信息
      let mockUserInfo: UserInfo;

      if (mockUserType === 'admin') {
        mockUserInfo = {
          id: '1',
          username: 'adminUser',
          user_type: 'admin',
          avatar: '',
          email: 'admin@example.com',
          status: 'active'
        };
      } else if (mockUserType === 'company') {
        mockUserInfo = {
          id: '2',
          username: 'companyUser',
          user_type: 'company',
          avatar: '',
          email: 'company@example.com',
          status: 'active'
        };
      } else {
        // 默认为学生用户
        mockUserInfo = {
          id: '3',
          username: 'studentUser',
          user_type: 'student',
          avatar: '',
          email: 'student@example.com',
          status: 'active'
        };
      }

      resolve({ data: mockUserInfo });
    }, 200);
  });
  // ---- Mock Data End ----
}

// 登出接口
export function logout(): Promise<any> {
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

// --- Admin API --- (需要管理员权限)

// 获取用户列表
export function getUserList(params: any): Promise<any> {
  return request({
    url: '/admin/users',
    method: 'get',
    params,
  });
}

// 更新用户状态 (Placeholder)
export function updateUserStatusApi(userId: string | number, status: UserStatus): Promise<any> {
  console.warn(`API MOCK: updateUserStatusApi(${userId}, ${status}) called.`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true } }); // Mock success response
    }, 300);
  });
  // Replace with actual API call:
  // return request({
  //   url: `/admin/users/${userId}/status`,
  //   method: 'patch', // or 'put'
  //   data: { status },
  // });
}

// TODO: 添加其他管理员操作用户的 API, e.g., deleteUser, resetPassword