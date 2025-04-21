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
  state: (): PermissionState => ({
    // 当前用户的角色和权限
    roles: [],
    permissions: [],

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
  }),

  actions: {
    // 获取用户权限
    async fetchPermissions() {
      // 可以在 userStore 中获取用户信息后再调用此方法
      this.loading = true;
      try {
        const response = await getUserPermissions();
        this.roles = response.data.roles;
        this.permissions = response.data.permissions;
        // 将角色和权限信息同步到 userStore (可选，取决于设计)
        // const userStore = useUserStore();
        // userStore.setRoles(this.roles);
        // userStore.setPermissions(this.permissions);
      } catch (error) {
        console.error('Failed to fetch user permissions:', error);
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

    // 检查是否有指定角色
    hasRole(requiredRoles: Role | Role[]): boolean {
        if (!requiredRoles) return true;
        const checkList = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        return checkList.some(r => this.roles.includes(r));
    },

    // 清除权限信息
    clearPermissions() {
      this.roles = [];
      this.permissions = [];
    },

    // (管理端) 获取所有角色
    async fetchRoles() {
      this.loadingRoles = true;
      try {
        const response = await getAllRoles();
        this.roleList = response.data;
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        ElMessage.error('获取角色列表失败');
        this.roleList = [];
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
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
        ElMessage.error('获取权限列表失败');
        this.permissionList = [];
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
      } catch (error) {
        console.error(`Failed to fetch roles for user ${userId}:`, error);
        ElMessage.error('获取用户角色失败');
        this.userRoles = [];
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