/**
 * 角色定义 (与 UserType 基本对应，但可以更细化)
 */
export type Role = 'student' | 'company' | 'admin' | 'guest' | string;

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
 * 角色信息接口
 */
export interface RoleInfo {
  id: string | number;
  name: string;
  code: Role;
  description?: string;
  permissions?: PermissionCode[];
}

/**
 * 权限信息接口
 */
export interface PermissionInfo {
  id: string | number;
  name: string;
  code: PermissionCode;
  description?: string;
  module?: string;
  children?: PermissionInfo[];
}

/**
 * 用户权限信息接口
 */
export interface UserPermissionInfo {
  roles: Role[];
  permissions: PermissionCode[];
}

/**
 * 角色权限更新请求
 */
export interface RolePermissionUpdatePayload {
  roleId: string | number;
  permissionIds: (string | number)[];
}

/**
 * 用户角色更新请求
 */
export interface UserRoleUpdatePayload {
  userId: string | number;
  roleIds: (string | number)[];
}