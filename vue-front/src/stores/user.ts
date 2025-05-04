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

  // 登录状态
  loading: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || sessionStorage.getItem('token') || null,
    userInfo: JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || 'null'),

    // Admin User List Management Initial State
    userList: [],
    userTotal: 0,
    loadingList: false,
    loading: false,
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

      // 持久化存储用户信息
      if (userInfo) {
        // 检查是否选择了"记住我"
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        if (rememberMe) {
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        } else {
          sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
          localStorage.removeItem('userInfo');
        }
      } else {
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
      }
    },

    // 登录
    async login(payload: LoginPayload, remember: boolean = false) {
      this.loading = true;

      // 最大重试次数
      const maxRetries = 3;
      // 当前重试次数
      let retryCount = 0;
      // 重试延迟（毫秒）
      const retryDelay = 1000;

      while (retryCount <= maxRetries) {
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
            userType: data.userType?.toLowerCase() || 'student',
            avatar: data.avatar,
            status: data.status,
            createTime: data.createTime,
            lastLoginTime: data.lastLoginTime,
            previousLoginTime: data.previousLoginTime
          };

          this.setUserInfo(userInfo);

          // 获取权限
          const permissionStore = usePermissionStore();
          await permissionStore.fetchUserPermissions();

          // 保存权限到本地存储
          const permissionsData = {
            roles: permissionStore.roles,
            permissions: permissionStore.permissions
          };

          if (remember) {
            localStorage.setItem('permissionsData', JSON.stringify(permissionsData));
          } else {
            sessionStorage.setItem('permissionsData', JSON.stringify(permissionsData));
            localStorage.removeItem('permissionsData');
          }

          this.loading = false;
          return Promise.resolve(); // 返回成功状态
        } catch (error: any) {
          console.error(`登录尝试 ${retryCount + 1} 失败:`, error);

          // 如果是网络错误或超时错误，并且还有重试次数，则重试
          if (retryCount < maxRetries &&
              (error.type === 'network' ||
              (error.originalError && error.originalError.code === 'ECONNABORTED'))) {
            retryCount++;
            console.log(`正在重试登录 (${retryCount}/${maxRetries})...`);
            // 等待一段时间后重试
            await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
          } else {
            // 其他错误或已达到最大重试次数，抛出错误
            this.resetAuth(); // 登录失败，重置状态
            this.loading = false;
            ElMessage.error(error?.message || '登录失败，请检查用户名和密码');
            return Promise.reject(error);
          }
        }
      }

      // 如果所有重试都失败
      this.loading = false;
      ElMessage.error('多次尝试登录失败，请稍后再试');
      return Promise.reject(new Error('多次尝试登录失败'));
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

      this.loading = true;
      try {
        const response = await getUserInfoApi();
        this.setUserInfo(response.data);

        // 获取权限
        const permissionStore = usePermissionStore();
        if (permissionStore.roles.length === 0) {
          await permissionStore.fetchUserPermissions();

          // 保存权限到本地存储
          const permissionsData = {
            roles: permissionStore.roles,
            permissions: permissionStore.permissions
          };

          const rememberMe = localStorage.getItem('rememberMe') === 'true';
          if (rememberMe) {
            localStorage.setItem('permissionsData', JSON.stringify(permissionsData));
          } else {
            sessionStorage.setItem('permissionsData', JSON.stringify(permissionsData));
          }
        }

        return response.data;
      } catch (error) {
        // 获取用户信息失败，可能 token 失效
        console.error('Failed to get user info:', error);
        this.resetAuth(); // 重置认证状态
        ElMessage.error('获取用户信息失败或登录已过期，请重新登录');
        router.push('/login'); // 跳转到登录页
        throw error;
      } finally {
        this.loading = false;
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
      // 确保清除所有存储中的token和用户信息
      localStorage.removeItem('token');
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('permissionsData');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userInfo');
      sessionStorage.removeItem('permissionsData');
      // permission store 的清理在 logout 中完成
    },

    // --- Admin Actions ---
    async fetchUserList(params: any = {}) {
        this.loadingList = true;
        try {
            // 从API获取用户列表数据
            const response = await getUserList(params);
            console.log('用户列表响应数据:', response.data);

            // 检查响应数据结构
            if (response.data && Array.isArray(response.data.list)) {
                // 使用正确的数据结构
                this.userList = response.data.list;
                this.userTotal = response.data.total || 0;
            } else if (response.data && Array.isArray(response.data.records)) {
                // 兼容旧的数据结构
                this.userList = response.data.records;
                this.userTotal = response.data.total || 0;
            } else if (Array.isArray(response.data)) {
                // 直接是数组的情况
                this.userList = response.data;
                this.userTotal = response.data.length;
            } else {
                // 未知结构，清空数据
                console.error('未知的用户列表数据结构:', response.data);
                this.userList = [];
                this.userTotal = 0;
            }
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
            const response = await request.post('/api/admin/users/batch-update-status', { ids, status });

            // 获取更新结果
            const result = response.data;

            // 刷新用户列表，确保数据是最新的
            await this.fetchUserList({
                page: 1,
                pageSize: this.userList.length,
                // 保持当前的筛选条件
            });

            return result;
        } catch (error) {
            console.error('Failed to batch update user status:', error);
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