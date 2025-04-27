import request from '@/utils/request';
import type { RoleInfo, PermissionInfo, PermissionCode } from '@/types/permission';
import type { UserPermissionInfo } from '@/types/permission';

// 获取当前用户的角色和权限信息
// 这个接口通常在用户登录后或需要刷新权限时调用
export function getUserPermissions(): Promise<{ data: UserPermissionInfo }> {
  return request({
    url: '/api/users/permissions',
    method: 'get',
    cache: false, // 禁用缓存，避免缓存拦截器错误
  });
}

// (管理端) 获取所有角色列表
export function getAllRoles(): Promise<{ data: RoleInfo[] }> {
  return request({
    url: '/api/admin/roles',
    method: 'get',
  });
}

// (管理端) 获取所有权限列表
export function getAllPermissions(): Promise<{ data: PermissionInfo[] }> {
  return request({
    url: '/api/admin/permissions',
    method: 'get',
  });
}

// (管理端) 获取角色权限
export function getRolePermissions(roleId: string | number): Promise<{ data: PermissionCode[] }> {
  return request({
    url: `/api/admin/roles/${roleId}/permissions`,
    method: 'get',
  });
}

// (管理端) 更新角色权限
export function updateRolePermissions(roleId: string | number, permissionIds: (string | number)[]): Promise<{ success: boolean }> {
  return request({
    url: `/api/admin/roles/${roleId}/permissions`,
    method: 'put',
    data: { permissionIds }
  });
}

// (管理端) 创建或更新角色
export function saveRole(role: RoleInfo): Promise<{ success: boolean, data: RoleInfo }> {
  const method = role.id ? 'put' : 'post';
  const url = role.id ? `/api/admin/roles/${role.id}` : '/api/admin/roles';
  return request({
    url,
    method,
    data: role
  });
}

// (管理端) 删除角色
export function deleteRole(roleId: string | number): Promise<{ success: boolean }> {
  return request({
    url: `/api/admin/roles/${roleId}`,
    method: 'delete'
  });
}

// (管理端) 获取用户角色
export function getUserRoles(userId: string | number): Promise<{ data: string[] }> {
  return request({
    url: `/api/admin/users/${userId}/roles`,
    method: 'get'
  });
}

// (管理端) 更新用户角色
export function updateUserRoles(userId: string | number, roleIds: (string | number)[]): Promise<{ success: boolean }> {
  return request({
    url: `/api/admin/users/${userId}/roles`,
    method: 'put',
    data: { roleIds }
  });
}