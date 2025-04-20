import { defineStore } from 'pinia';
import type { UserInfo, UserType, UserStatus } from '@/types/user';
import { login as loginApi, register as registerApi, getUserInfo as getUserInfoApi, logout as logoutApi, updateUserStatusApi } from '@/api/user';
// import { updateUserStatus as updateUserStatusApi } from '@/api/permission'; // <-- Temporarily commented out: Needs implementation in api/permission.ts
import { usePermissionStore } from './permission'; // 引入 permission store
import { ElMessage } from 'element-plus';
import router from '@/router'; // 引入 router 用于跳转
import request from '@/utils/request'; // <-- Import the axios instance

// 定义登录荷载类型 (与 api/user.ts 中的 TODO 对应)
interface LoginPayload {
  username: string;
  password: string;
}

// 定义注册荷载类型
interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    userType: UserType;
}

interface UserState {
  token: string | null;
  userInfo: UserInfo | null;
  // roles 和 permissions 由 permissionStore 管理，这里可以移除或作为只读 getter

  // Admin User List Management
  userList: UserInfo[];
  userTotal: number;
  loadingList: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || null,
    userInfo: null,

    // Admin User List Management Initial State
    userList: [],
    userTotal: 0,
    loadingList: false,
  }),

  actions: {
    // 设置 Token
    setToken(token: string | null) {
      this.token = token;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    },

    // 设置用户信息 (可以由 getUserInfo 调用)
    setUserInfo(userInfo: UserInfo | null) {
      this.userInfo = userInfo;
    },

    // 登录
    async login(payload: LoginPayload) {
      try {
        const response = await loginApi(payload);
        // TODO: 根据后端实际返回调整 token 的获取方式
        const token = response?.data?.token || 'mock_token'; // 假设 token 在 response.data.token
        this.setToken(token);
        // 登录成功后获取用户信息和权限
        await this.getUserInfo();
        const permissionStore = usePermissionStore();
        await permissionStore.fetchPermissions();

        return Promise.resolve(); // 返回成功状态
      } catch (error: any) {
        this.resetAuth(); // 登录失败，重置状态
        ElMessage.error(error?.message || '登录失败，请检查用户名和密码');
        return Promise.reject(error);
      }
    },

    // 注册
    async register(payload: RegisterPayload) {
        try {
            // TODO: 根据后端实际返回调整
            await registerApi(payload);
            // 注册成功通常不自动登录，由用户手动登录
            return Promise.resolve();
        } catch (error: any) {
            ElMessage.error(error?.message || '注册失败');
            return Promise.reject(error);
        }
    },

    // 获取用户信息
    async getUserInfo() {
      if (!this.token) {
        throw new Error('Token not found, cannot get user info');
      }
      // 如果 userInfo 已存在，可以考虑不重新获取，或者根据需要强制刷新
      // if (this.userInfo) return this.userInfo;
      try {
        const response = await getUserInfoApi();
        this.setUserInfo(response.data);
        return response.data;
      } catch (error) {
        // 获取用户信息失败，可能 token 失效
        this.resetAuth(); // 重置认证状态
        ElMessage.error('获取用户信息失败或登录已过期，请重新登录');
        router.push('/login'); // 跳转到登录页
        throw error;
      }
    },

    // 登出
    async logout() {
      try {
        // 尝试调用后端登出接口 (即使失败，前端也应清除状态)
        await logoutApi();
      } catch (error) {
        console.error('Logout API call failed:', error);
      } finally {
        this.resetAuth(); // 清除前端认证状态
        // 清除其他可能需要登出时重置的 store 数据
        const permissionStore = usePermissionStore();
        permissionStore.clearPermissions();
        // TODO: 清除 student, company 等 store 的数据
        // useStudentStore().clearProfile();
        // useCompanyStore().clearCompanyData();

        // 跳转到登录页
        // 添加 replace: true 避免用户通过浏览器后退回到需要登录的页面
        router.push({ path: '/login', replace: true });
      }
    },

    // 重置认证相关状态
    resetAuth() {
      this.setToken(null);
      this.setUserInfo(null);
       // permission store 的清理在 logout 中完成
    },

    // --- Admin Actions ---
    async fetchUserList(params: any = {}) {
        this.loadingList = true;
        try {
            // 从API获取用户列表数据
            const response = await request.get('/admin/users', { params });
            this.userList = response.data.list;
            this.userTotal = response.data.total;
        } catch (error) {
            console.error('获取用户列表失败:', error);
            ElMessage.error('获取用户列表失败');
            this.userList = [];
            this.userTotal = 0;
        } finally {
            this.loadingList = false;
        }
    },

    /* // <-- Temporarily commented out: Needs updateUserStatusApi implementation
    async updateUserStatus(id: string | number, status: UserStatus) {
         // TODO: Ensure updateUserStatus is exported from @/api/permission.ts
         try {
            await updateUserStatusApi(id, status); // Now uses the import from @/api/user
            // Refresh the specific user in the list
            const index = this.userList.findIndex(user => user.id === id);
            if (index !== -1) {
                 // Directly update the status in the list
                 this.userList[index].status = status;
            }
            // Do NOT show success message here, let the component handle it?
            ElMessage.success('用户状态更新成功'); // Or show it here
         } catch (error) {
             console.error('Failed to update user status:', error);
             ElMessage.error('更新用户状态失败');
             throw error; // Re-throw for component handling
         }
    },
    */

  },
}); 