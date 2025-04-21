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
  // 从localStorage获取当前模拟的用户角色
  const userType = localStorage.getItem('mockUserType') || 'student';

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
export function getAllRoles(): Promise<{ data: RoleInfo[] }> {
  // return request({
  //   url: '/api/admin/roles',
  //   method: 'get',
  // });

  // 模拟数据
  console.warn('API MOCK: getAllRoles is using mock data.');
  const mockRoles: RoleInfo[] = [
    { id: '1', name: '管理员', code: 'admin', description: '系统管理员，拥有所有权限' },
    { id: '2', name: '学生用户', code: 'student', description: '学生用户，可以浏览职位、投递简历' },
    { id: '3', name: '企业用户', code: 'company', description: '企业用户，可以发布职位、管理申请' },
    { id: '4', name: '访客', code: 'guest', description: '未登录用户，只能浏览公开内容' }
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockRoles });
    }, 300);
  });
}

// (管理端) 获取所有权限列表
export function getAllPermissions(): Promise<{ data: PermissionInfo[] }> {
  // return request({
  //   url: '/api/admin/permissions',
  //   method: 'get',
  // });

  // 模拟数据
  console.warn('API MOCK: getAllPermissions is using mock data.');
  const mockPermissions: PermissionInfo[] = [
    {
      id: '1',
      name: '用户管理',
      code: 'user',
      module: 'system',
      children: [
        { id: '1-1', name: '查看用户', code: 'user:view', module: 'system' },
        { id: '1-2', name: '编辑用户', code: 'user:edit', module: 'system' },
        { id: '1-3', name: '删除用户', code: 'user:delete', module: 'system' },
        { id: '1-4', name: '管理用户状态', code: 'user:status', module: 'system' }
      ]
    },
    {
      id: '2',
      name: '职位管理',
      code: 'job',
      module: 'business',
      children: [
        { id: '2-1', name: '查看职位', code: 'job:view', module: 'business' },
        { id: '2-2', name: '创建职位', code: 'job:create', module: 'business' },
        { id: '2-3', name: '编辑职位', code: 'job:edit', module: 'business' },
        { id: '2-4', name: '删除职位', code: 'job:delete', module: 'business' }
      ]
    },
    {
      id: '3',
      name: '申请管理',
      code: 'application',
      module: 'business',
      children: [
        { id: '3-1', name: '查看申请', code: 'application:view', module: 'business' },
        { id: '3-2', name: '投递申请', code: 'application:apply', module: 'business' },
        { id: '3-3', name: '撤回申请', code: 'application:withdraw', module: 'business' },
        { id: '3-4', name: '更新申请状态', code: 'application:updateStatus', module: 'business' }
      ]
    },
    {
      id: '4',
      name: '企业管理',
      code: 'company',
      module: 'business',
      children: [
        { id: '4-1', name: '查看企业', code: 'company:view', module: 'business' },
        { id: '4-2', name: '编辑企业', code: 'company:edit', module: 'business' },
        { id: '4-3', name: '审核企业', code: 'company:audit', module: 'business' }
      ]
    },
    {
      id: '5',
      name: '简历管理',
      code: 'resume',
      module: 'business',
      children: [
        { id: '5-1', name: '查看简历', code: 'resume:view', module: 'business' },
        { id: '5-2', name: '编辑简历', code: 'resume:edit', module: 'business' },
        { id: '5-3', name: '删除简历', code: 'resume:delete', module: 'business' }
      ]
    }
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockPermissions });
    }, 300);
  });
}

// (管理端) 获取角色权限
export function getRolePermissions(roleId: string | number): Promise<{ data: PermissionCode[] }> {
  // return request({
  //   url: `/api/admin/roles/${roleId}/permissions`,
  //   method: 'get',
  // });

  // 模拟数据
  console.warn('API MOCK: getRolePermissions is using mock data.');
  const mockPermissions: Record<string, PermissionCode[]> = {
    '1': [ // 管理员角色权限
      'user:view', 'user:edit', 'user:delete', 'user:status',
      'job:view', 'job:create', 'job:edit', 'job:delete',
      'application:view', 'application:apply', 'application:withdraw', 'application:updateStatus',
      'company:view', 'company:edit', 'company:audit',
      'resume:view', 'resume:edit', 'resume:delete'
    ],
    '2': [ // 学生角色权限
      'job:view',
      'application:view', 'application:apply', 'application:withdraw',
      'company:view',
      'resume:view', 'resume:edit', 'resume:delete'
    ],
    '3': [ // 企业角色权限
      'job:view', 'job:create', 'job:edit', 'job:delete',
      'application:view', 'application:updateStatus',
      'company:view', 'company:edit'
    ],
    '4': [ // 访客角色权限
      'job:view',
      'company:view'
    ]
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockPermissions[roleId.toString()] || [] });
    }, 300);
  });
}

// (管理端) 更新角色权限
export function updateRolePermissions(roleId: string | number, permissionIds: (string | number)[]): Promise<{ success: boolean }> {
  // return request({
  //   url: `/api/admin/roles/${roleId}/permissions`,
  //   method: 'put',
  //   data: { permissionIds }
  // });

  // 模拟数据
  console.warn('API MOCK: updateRolePermissions is using mock data.');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
}

// (管理端) 创建或更新角色
export function saveRole(role: RoleInfo): Promise<{ success: boolean, data: RoleInfo }> {
  // const method = role.id ? 'put' : 'post';
  // const url = role.id ? `/api/admin/roles/${role.id}` : '/api/admin/roles';
  // return request({
  //   url,
  //   method,
  //   data: role
  // });

  // 模拟数据
  console.warn('API MOCK: saveRole is using mock data.');
  return new Promise((resolve) => {
    setTimeout(() => {
      // 如果是新角色，生成ID
      if (!role.id) {
        role.id = Date.now().toString();
      }
      resolve({ success: true, data: role });
    }, 500);
  });
}

// (管理端) 删除角色
export function deleteRole(roleId: string | number): Promise<{ success: boolean }> {
  // return request({
  //   url: `/api/admin/roles/${roleId}`,
  //   method: 'delete'
  // });

  // 模拟数据
  console.warn('API MOCK: deleteRole is using mock data.');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
}

// (管理端) 获取用户角色
export function getUserRoles(userId: string | number): Promise<{ data: string[] }> {
  // return request({
  //   url: `/api/admin/users/${userId}/roles`,
  //   method: 'get'
  // });

  // 模拟数据
  console.warn('API MOCK: getUserRoles is using mock data.');
  return new Promise((resolve) => {
    setTimeout(() => {
      // 根据用户ID返回不同的角色
      const mockUserRoles: Record<string, string[]> = {
        '1': ['1'], // 管理员
        '2': ['2'], // 学生
        '3': ['3']  // 企业
      };
      resolve({ data: mockUserRoles[userId.toString()] || [] });
    }, 300);
  });
}

// (管理端) 更新用户角色
export function updateUserRoles(userId: string | number, roleIds: (string | number)[]): Promise<{ success: boolean }> {
  // return request({
  //   url: `/api/admin/users/${userId}/roles`,
  //   method: 'put',
  //   data: { roleIds }
  // });

  // 模拟数据
  console.warn('API MOCK: updateUserRoles is using mock data.');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
}