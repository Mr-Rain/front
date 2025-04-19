import { defineStore } from 'pinia';
import type { Role, PermissionCode, UserPermissionInfo } from '@/types/permission';
import { getUserPermissions } from '@/api/permission';
import { useUserStore } from './user'; // 可能需要 user store 的信息

interface PermissionState {
  roles: Role[];
  permissions: PermissionCode[];
  loading: boolean;
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    roles: [],
    permissions: [],
    loading: false,
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
  },
}); 