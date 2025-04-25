/**
 * 用户类型：学生、企业、管理员
 */
type UserType = 'student' | 'company' | 'admin';

/**
 * 用户状态：激活、禁用
 */
export type UserStatus = 'active' | 'inactive';

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string | number;
  username: string;
  user_type: UserType;
  avatar?: string; // 头像 URL，可选
  email?: string; // 邮箱，可选
  phone?: string; // 手机号，可选
  // 可以根据实际需要添加更多字段，例如：
  create_time?: string; // 注册时间
  last_login_time?: string; // 最后登录时间
  status: UserStatus; // 账号状态
  // ... 其他与用户账号相关的信息
}

// 可以根据需要添加其他与用户相关的类型定义，例如：
// export interface LoginResponse { ... }
// export interface RegisterPayload { ... }