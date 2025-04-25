import { defineStore } from 'pinia';
import type { UserInfo, UserType, UserStatus } from '@/types/user';
import { login as loginApi, register as registerApi, getUserInfo as getUserInfoApi, updateUserStatus as updateUserStatusApi, getUserList } from '@/api/user';
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
    token: localStorage.getItem('token') || sessionStorage.getItem('token') || null,
    userInfo: null,

    // Admin User List Management Initial State
    userList: [],
    userTotal: 0,
    loadingList: false,
  }),

  actions: {
    // 设置 Token
    setToken(token: string | null, remember: boolean = false) {
      this.token = token;
      if (token) {
        if (remember) {
          // 使用localStorage持久存储
          localStorage.setItem('token', token);
          localStorage.setItem('rememberMe', 'true');
        } else {
          // 使用sessionStorage，关闭浏览器后失效
          sessionStorage.setItem('token', token);
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('token');
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('rememberMe');
        sessionStorage.removeItem('token');
      }
    },

    // 设置用户信息 (可以由 getUserInfo 调用)
    setUserInfo(userInfo: UserInfo | null) {
      this.userInfo = userInfo;
    },

    // 登录
    async login(payload: LoginPayload, remember: boolean = false) {
      try {
        const response = await loginApi(payload);
        // 从响应中获取token和用户信息
        const data = response?.data || response;
        const token = data?.token;

        if (!token) {
          throw new Error('登录失败：未获取到有效的令牌');
        }

        this.setToken(token, remember);

        // 直接使用登录接口返回的用户信息
        const userInfo: UserInfo = {
          id: data.id,
          username: data.username,
          email: data.email,
          // 将后端返回的大写用户类型转换为小写，以匹配前端期望的格式
          user_type: data.userType?.toLowerCase() || 'student',
          avatar: data.avatar,
          status: data.status,
          create_time: data.createTime,
          last_login_time: data.lastLoginTime
        };

        this.setUserInfo(userInfo);

        // 获取权限
        const permissionStore = usePermissionStore();
        await permissionStore.fetchUserPermissions();

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
        // 后端可能没有实现登出接口，暂时注释掉
        // await logoutApi();
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
      // 确保清除所有存储中的token
      localStorage.removeItem('token');
      localStorage.removeItem('rememberMe');
      sessionStorage.removeItem('token');
      // permission store 的清理在 logout 中完成
    },

    // --- Admin Actions ---
    async fetchUserList(params: any = {}) {
        this.loadingList = true;
        try {
            // 从API获取用户列表数据
            const response = await getUserList(params);
            this.userList = response.data.records;
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

    // 更新用户状态
    async updateUserStatus(id: string | number, status: UserStatus) {
        try {
            // 调用实际API
            await updateUserStatusApi(id, status);

            // 更新本地数据
            const index = this.userList.findIndex(user => user.id === id);
            if (index !== -1) {
                this.userList[index].status = status;
            }

            ElMessage.success('用户状态更新成功');
            return true;
        } catch (error) {
            console.error('Failed to update user status:', error);
            ElMessage.error('更新用户状态失败');
            throw error;
        }
    },

    // 获取用户详情
    async getUserDetail(id: string | number) {
        try {
            // 调用实际API
            const response = await request.get(`/api/admin/users/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Failed to get user detail for id ${id}:`, error);
            ElMessage.error('获取用户详情失败');
            throw error;
        }
    },

    // 批量更新用户状态
    async batchUpdateUserStatus(ids: (string | number)[], status: UserStatus) {
        try {
            // 调用实际API
            await request.post('/api/admin/users/batch-update-status', { ids, status });

            // 更新本地数据
            for (const id of ids) {
                const index = this.userList.findIndex(user => user.id === id);
                if (index !== -1) {
                    this.userList[index].status = status;
                }
            }

            ElMessage.success(`成功更新 ${ids.length} 个用户的状态`);
            return true;
        } catch (error) {
            console.error('Failed to batch update user status:', error);
            ElMessage.error('批量更新用户状态失败');
            throw error;
        }
    },

    // 发送验证码
    async sendVerificationCode(email: string) {
      try {
        // 调用发送验证码的API
        await request.post('/auth/send-verification-code', { email });
        return Promise.resolve();
      } catch (error: any) {
        ElMessage.error(error?.message || '验证码发送失败');
        return Promise.reject(error);
      }
    },

    // 重置密码
    async resetPassword(payload: { email: string; code: string }) {
      try {
        // 调用重置密码的API
        await request.post('/auth/reset-password', payload);
        return Promise.resolve();
      } catch (error: any) {
        ElMessage.error(error?.message || '密码重置失败');
        return Promise.reject(error);
      }
    },

  },
});