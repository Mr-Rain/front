import request from '@/utils/request';
import type { UserInfo, UserStatus } from '@/types/user';

/**
 * 登录请求参数类型
 */
export interface LoginPayload {
  username: string;
  password: string;
}

/**
 * 登录响应类型
 */
export interface LoginResponse {
  token: string;
  id: number | string;
  username: string;
  email: string;
  userType: string;
  avatar: string | null;
  status: string;
  lastLoginTime: string;
}

/**
 * 注册请求参数类型
 */
export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
  userType: string;
  phone?: string;
}

/**
 * 忘记密码请求参数类型
 */
export interface ForgotPasswordPayload {
  email: string;
}

/**
 * 重置密码请求参数类型
 */
export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * 修改密码请求参数类型
 */
export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

/**
 * 用户登录
 * @param data 登录信息
 * @returns 登录结果
 */
export function login(data: LoginPayload) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data,
    // 为登录请求特别设置更长的超时时间
    timeout: 60000, // 60秒
    // 启用自动重试
    retry: true,
    retryDelay: 1000,
    retryCount: 3
  });
}

/**
 * 用户注册
 * @param data 注册信息
 * @returns 注册结果
 */
export function register(data: RegisterPayload) {
  return request({
    url: '/api/auth/register',
    method: 'post',
    data,
  });
}

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export function getUserInfo(): Promise<{ data: UserInfo }> {
  return request({
    url: '/api/users/me',
    method: 'get',
  });
}

/**
 * 用户登出
 * @returns 登出结果
 */
export function logout(): Promise<any> {
  return request({
    url: '/api/auth/logout',
    method: 'post',
  });
}

/**
 * 忘记密码
 * @param data 包含邮箱的请求数据
 * @returns 发送结果
 */
export function forgotPassword(data: ForgotPasswordPayload) {
  return request({
    url: '/api/auth/forgot-password',
    method: 'post',
    data,
  });
}

/**
 * 重置密码
 * @param data 重置密码数据
 * @returns 重置结果
 */
export function resetPassword(data: ResetPasswordPayload) {
  return request({
    url: '/api/auth/reset-password',
    method: 'post',
    data,
  });
}

/**
 * 修改密码
 * @param data 修改密码数据
 * @returns 修改结果
 */
export function changePassword(data: ChangePasswordPayload) {
  return request({
    url: '/api/users/password',
    method: 'put',
    data,
  });
}

/**
 * 更新用户信息
 * @param data 用户信息
 * @returns 更新结果
 */
export function updateUserInfo(data: Partial<UserInfo>) {
  return request({
    url: '/api/users/me',
    method: 'put',
    data,
  });
}

// --- Admin API --- (需要管理员权限)

/**
 * 获取用户列表
 * @param params 查询参数
 * @returns 用户列表
 */
export function getUserList(params: any): Promise<any> {
  return request({
    url: '/api/admin/users',
    method: 'get',
    params,
  });
}

/**
 * 更新用户状态
 * @param userId 用户ID
 * @param status 状态
 * @returns 更新结果
 */
export function updateUserStatus(userId: string | number, status: UserStatus): Promise<any> {
  return request({
    url: `/api/admin/users/${userId}/status`,
    method: 'put',
    data: { status },
  });
}