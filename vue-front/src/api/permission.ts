import request from '@/utils/request';
import type { UserPermissionInfo } from '@/types/permission';

// 获取当前用户的角色和权限信息
// 这个接口通常在用户登录后或需要刷新权限时调用
export function getUserPermissions(): Promise<{ data: UserPermissionInfo }> {
  // return request({
  //   url: '/api/user/permissions',
  //   method: 'get',
  // });
  // ---- Mock Data Start ----
  console.warn('API MOCK: getUserPermissions is using mock data.');
  // 模拟不同角色的权限
  // const userType = useUserStore().userInfo?.user_type; // 假设可以拿到用户类型
  const userType = 'student'; // 手动模拟

  let mockPermissions: UserPermissionInfo;
  if (userType === 'student') {
    mockPermissions = {
      roles: ['student'],
      permissions: [
        'job:view', 'job:apply', 'resume:manage', 'application:view', 'application:withdraw'
      ]
    };
  } else if (userType === 'company') {
    mockPermissions = {
      roles: ['company'],
      permissions: [
        'job:manage', 'job:create', 'job:edit', 'job:delete', 'application:view', 'application:updateStatus'
      ]
    };
  } else if (userType === 'admin') {
     mockPermissions = {
      roles: ['admin'],
      permissions: [
        'user:manage', 'company:audit', 'job:view', 'application:view'
      ]
    };
  } else {
     mockPermissions = {
      roles: ['guest'],
      permissions: ['job:view']
    };
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockPermissions });
    }, 100);
  });
  // ---- Mock Data End ----
}

// (管理端) 获取所有角色列表
// export function getAllRoles() { ... }

// (管理端) 获取所有权限列表
// export function getAllPermissions() { ... }

// (管理端) 更新角色权限
// export function updateRolePermissions(roleId, permissionIds) { ... } 