/**
 * 角色定义 (与 UserType 基本对应，但可以更细化)
 */
export type Role = 'student' | 'company' | 'admin' | 'guest';

/**
 * 权限代码定义 (示例)
 * 可以是字符串数组，也可以是更复杂的结构
 */
export type PermissionCode = string;
// 例如:
// 'job:create'
// 'job:edit'
// 'job:delete'
// 'application:view'
// 'application:updateStatus'
// 'company:audit'
// 'user:manage'

/**
 * 用户权限信息接口
 */
export interface UserPermissionInfo {
  roles: Role[];
  permissions: PermissionCode[];
} 