import { defineStore } from 'pinia';
import type { Role, PermissionCode, UserPermissionInfo, RoleInfo, PermissionInfo, RolePermissionUpdatePayload, UserRoleUpdatePayload } from '@/types/permission';
import { getUserPermissions, getAllRoles, getAllPermissions, getRolePermissions, updateRolePermissions, saveRole, deleteRole, getUserRoles, updateUserRoles } from '@/api/permission';
import { ElMessage } from 'element-plus';
import { useUserStore } from './user';

interface PermissionState {
  // 当前用户的角色和权限
  roles: Role[];
  permissions: PermissionCode[];

  // 管理端数据
  roleList: RoleInfo[];
  permissionList: PermissionInfo[];
  selectedRolePermissions: PermissionCode[];
  userRoles: string[];

  // 状态标记
  loading: boolean;
  loadingRoles: boolean;
  loadingPermissions: boolean;
  submitting: boolean;
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => {
    // 尝试从本地存储恢复权限数据
    let roles: Role[] = [];
    let permissions: PermissionCode[] = [];

    try {
      const storedData = localStorage.getItem('permissionsData') || sessionStorage.getItem('permissionsData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        roles = parsedData.roles || [];
        permissions = parsedData.permissions || [];
      }
    } catch (error) {
      console.error('Failed to parse stored permissions data:', error);
    }

    return {
      // 当前用户的角色和权限
      roles,
      permissions,

      // 管理端数据
      roleList: [],
      permissionList: [],
      selectedRolePermissions: [],
      userRoles: [],

      // 状态标记
      loading: false,
      loadingRoles: false,
      loadingPermissions: false,
      submitting: false,
    };
  },

  actions: {
    // 获取当前用户权限
    async fetchUserPermissions() {
      // 可以在 userStore 中获取用户信息后再调用此方法
      this.loading = true;
      try {
        // 检查是否处于离线模式（后端未启动）
        if ((window as any).backendDown) {
          console.log('Backend is down, using offline mode for permissions');

          // 使用用户类型作为角色
          const userStore = useUserStore();
          const userType = userStore.userInfo?.user_type?.toLowerCase();

          if (userType) {
            this.roles = [userType as any];
            this.permissions = [];

            console.log('Using user type as role in offline mode:', userType);
            return { roles: this.roles, permissions: this.permissions };
          }

          throw new Error('No user type available for offline mode');
        }

        // 正常模式：从API获取权限
        const response = await getUserPermissions();

        // 确保响应数据结构正确
        if (response && response.data) {
          this.roles = response.data.roles || [];
          this.permissions = response.data.permissions || [];

          // 保存到本地存储
          const userStore = useUserStore();
          const rememberMe = localStorage.getItem('rememberMe') === 'true';
          const permissionsData = {
            roles: this.roles,
            permissions: this.permissions
          };

          if (rememberMe) {
            localStorage.setItem('permissionsData', JSON.stringify(permissionsData));
          } else {
            sessionStorage.setItem('permissionsData', JSON.stringify(permissionsData));
          }
        } else {
          console.warn('Invalid response format from getUserPermissions:', response);
          throw new Error('Invalid response format');
        }

        console.log('Fetched user permissions:', { roles: this.roles, permissions: this.permissions });
      } catch (error) {
        console.error('Failed to fetch user permissions:', error);

        // 如果是网络错误，尝试使用用户类型作为备用
        if (error.type === 'network' || (window as any).backendDown) {
          const userStore = useUserStore();
          const userType = userStore.userInfo?.user_type?.toLowerCase();

          if (userType) {
            console.log('Using user type as fallback for permissions after error');
            this.roles = [userType as any];
            this.permissions = [];
            return { roles: this.roles, permissions: this.permissions };
          }
        }

        this.roles = [];
        this.permissions = [];
      } finally {
        this.loading = false;
      }
    },

    // 检查是否有指定权限
    hasPermission(requiredPermissions: PermissionCode | PermissionCode[]): boolean {
      if (!requiredPermissions) return true;
      const checkList = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
      return checkList.every(p => this.permissions.includes(p));
    },

    // 设置用户角色
    setRoles(roles: Role[]) {
        this.roles = roles;
        console.log('Manually set roles:', roles);

        // 保存到本地存储
        const userStore = useUserStore();
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        const permissionsData = {
            roles: this.roles,
            permissions: this.permissions
        };

        if (rememberMe) {
            localStorage.setItem('permissionsData', JSON.stringify(permissionsData));
        } else {
            sessionStorage.setItem('permissionsData', JSON.stringify(permissionsData));
        }
    },

    // 检查是否有指定角色
    hasRole(requiredRoles: Role | Role[]): boolean {
        if (!requiredRoles) return true;

        // 获取用户类型作为备用
        const userStore = useUserStore();
        const userType = userStore.userInfo?.user_type?.toLowerCase();

        const checkList = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

        // 首先检查权限存储中的角色
        const hasRoleInPermissions = checkList.some(r => {
            // 不区分大小写比较
            return this.roles.some(role =>
                typeof role === 'string' &&
                typeof r === 'string' &&
                role.toLowerCase() === r.toLowerCase()
            );
        });

        // 如果权限存储中没有角色，但用户信息中有用户类型，也检查用户类型
        const hasRoleInUserType = userType && checkList.some(r => {
            // 不区分大小写比较
            return typeof r === 'string' && r.toLowerCase() === userType.toLowerCase();
        });

        console.log('Required roles:', checkList);
        console.log('User roles in permissions:', this.roles);
        console.log('User type from userInfo:', userType);
        console.log('Has role in permissions:', hasRoleInPermissions);
        console.log('Has role in user type:', hasRoleInUserType);

        // 如果用户类型匹配但权限存储中没有角色，自动设置角色
        if (!hasRoleInPermissions && hasRoleInUserType && userType && this.roles.length === 0) {
            console.log('Auto-setting role based on user type:', userType);
            this.setRoles([userType as any]);
        }

        return hasRoleInPermissions || hasRoleInUserType;
    },

    // 检查是否有访问路由的权限
    hasRoutePermission(route: any): boolean {
      // 如果路由不需要认证，直接返回 true
      if (!route.meta || !route.meta.requiresAuth) {
        return true;
      }

      console.log('Checking route permission for:', route.path);
      console.log('Route meta:', route.meta);

      // 检查角色权限
      if (route.meta.roles) {
        const hasRole = this.hasRole(route.meta.roles);
        console.log('Has required role:', hasRole);
        if (!hasRole) return false;
      }

      // 检查特定权限
      if (route.meta.permissions) {
        const hasPermission = this.hasPermission(route.meta.permissions);
        console.log('Has required permission:', hasPermission);
        if (!hasPermission) return false;
      }

      // 如果没有指定角色或权限点，但需要认证，则只要用户已登录即可
      const userStore = useUserStore();
      const isLoggedIn = !!userStore.token && !!userStore.userInfo;
      console.log('No specific roles/permissions required, checking if logged in:', isLoggedIn);
      return isLoggedIn;
    },

    // 清除权限信息
    clearPermissions() {
      this.roles = [];
      this.permissions = [];
      // 清除本地存储的权限数据
      localStorage.removeItem('permissionsData');
      sessionStorage.removeItem('permissionsData');
    },

    // (管理端) 获取所有角色
    async fetchRoles() {
      this.loadingRoles = true;
      try {
        const response = await getAllRoles();
        this.roleList = response.data;
        return this.roleList;
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        // 使用默认角色列表，避免UI错误
        this.roleList = [
          { id: 'admin', name: '管理员', description: '系统管理员' },
          { id: 'student', name: '学生', description: '学生用户' },
          { id: 'company', name: '企业', description: '企业用户' }
        ];
        // 不显示错误消息，避免用户体验不佳
        console.warn('使用默认角色列表');
        return this.roleList;
      } finally {
        this.loadingRoles = false;
      }
    },

    // (管理端) 获取所有权限
    async fetchPermissions() {
      this.loadingPermissions = true;
      try {
        const response = await getAllPermissions();
        this.permissionList = response.data;
        return this.permissionList;
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
        // 使用默认权限列表，避免UI错误
        this.permissionList = [
          { id: 'user:view', name: '查看用户', description: '查看用户信息' },
          { id: 'user:edit', name: '编辑用户', description: '编辑用户信息' },
          { id: 'user:delete', name: '删除用户', description: '删除用户' },
          { id: 'company:audit', name: '审核企业', description: '审核企业资质' },
          { id: 'job:manage', name: '管理职位', description: '管理职位信息' }
        ];
        // 不显示错误消息，避免用户体验不佳
        console.warn('使用默认权限列表');
        return this.permissionList;
      } finally {
        this.loadingPermissions = false;
      }
    },

    // (管理端) 获取角色权限
    async fetchRolePermissions(roleId: string | number) {
      this.loadingPermissions = true;
      try {
        const response = await getRolePermissions(roleId);
        this.selectedRolePermissions = response.data;
      } catch (error) {
        console.error(`Failed to fetch permissions for role ${roleId}:`, error);
        ElMessage.error('获取角色权限失败');
        this.selectedRolePermissions = [];
      } finally {
        this.loadingPermissions = false;
      }
    },

    // (管理端) 更新角色权限
    async updateRolePermissions(payload: RolePermissionUpdatePayload) {
      this.submitting = true;
      try {
        await updateRolePermissions(payload.roleId, payload.permissionIds);
        ElMessage.success('角色权限更新成功');
        return true;
      } catch (error) {
        console.error('Failed to update role permissions:', error);
        ElMessage.error('更新角色权限失败');
        return false;
      } finally {
        this.submitting = false;
      }
    },

    // (管理端) 保存角色
    async saveRole(role: RoleInfo) {
      this.submitting = true;
      try {
        const response = await saveRole(role);
        ElMessage.success(role.id ? '角色更新成功' : '角色创建成功');

        // 更新角色列表
        if (role.id) {
          // 更新现有角色
          const index = this.roleList.findIndex(r => r.id === role.id);
          if (index !== -1) {
            this.roleList[index] = response.data;
          }
        } else {
          // 添加新角色
          this.roleList.push(response.data);
        }

        return response.data;
      } catch (error) {
        console.error('Failed to save role:', error);
        ElMessage.error(role.id ? '更新角色失败' : '创建角色失败');
        return null;
      } finally {
        this.submitting = false;
      }
    },

    // (管理端) 删除角色
    async deleteRole(roleId: string | number) {
      this.submitting = true;
      try {
        await deleteRole(roleId);
        ElMessage.success('角色删除成功');

        // 从列表中移除角色
        const index = this.roleList.findIndex(r => r.id === roleId);
        if (index !== -1) {
          this.roleList.splice(index, 1);
        }

        return true;
      } catch (error) {
        console.error('Failed to delete role:', error);
        ElMessage.error('删除角色失败');
        return false;
      } finally {
        this.submitting = false;
      }
    },

    // (管理端) 获取用户角色
    async fetchUserRoles(userId: string | number) {
      this.loadingRoles = true;
      try {
        const response = await getUserRoles(userId);
        this.userRoles = response.data;
        return this.userRoles;
      } catch (error) {
        console.error(`Failed to fetch roles for user ${userId}:`, error);
        // 不显示错误消息，由调用方处理
        this.userRoles = [];
        throw error; // 重新抛出错误，让调用方可以处理
      } finally {
        this.loadingRoles = false;
      }
    },

    // (管理端) 更新用户角色
    async updateUserRoles(payload: UserRoleUpdatePayload) {
      this.submitting = true;
      try {
        await updateUserRoles(payload.userId, payload.roleIds);
        ElMessage.success('用户角色更新成功');
        return true;
      } catch (error) {
        console.error('Failed to update user roles:', error);
        ElMessage.error('更新用户角色失败');
        return false;
      } finally {
        this.submitting = false;
      }
    },
  },
});