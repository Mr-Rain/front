<template>
  <div class="mobile-menu">
    <!-- 移动端菜单按钮 -->
    <el-button class="menu-toggle" @click="drawerVisible = true" text>
      <el-icon size="24"><Menu /></el-icon>
    </el-button>

    <!-- 抽屉菜单 -->
    <el-drawer
      v-model="drawerVisible"
      title="菜单"
      direction="ltr"
      size="80%"
      :with-header="true"
      class="mobile-drawer"
    >
      <div class="drawer-content">
        <!-- 用户信息区域 -->
        <div v-if="userStore.token && userStore.userInfo" class="user-info">
          <el-avatar :size="50" :src="userStore.userInfo.avatar || defaultAvatar" />
          <div class="user-details">
            <h3>{{ userStore.userInfo.username }}</h3>
            <p>{{ getUserTypeText(userStore.userInfo.userType) }}</p>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="mobile-search">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索..."
            clearable
            class="mobile-search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon class="search-icon"><Search /></el-icon>
            </template>
            <template #suffix>
              <div class="search-button-container">
                <el-icon class="search-button mobile-search-button" @click="handleSearch"><Search /></el-icon>
              </div>
            </template>
          </el-input>
        </div>

        <!-- 菜单项 -->
        <el-menu
          :default-active="activeIndex"
          class="drawer-menu"
          @select="handleSelect"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <el-menu-item :index="getJobsPath()">
            <el-icon><Briefcase /></el-icon>
            <span>职位列表</span>
          </el-menu-item>

          <el-menu-item :index="getCompaniesPath()">
            <el-icon><OfficeBuilding /></el-icon>
            <span>企业列表</span>
          </el-menu-item>

          <!-- 学生专属菜单 -->
          <template v-if="userStore.userInfo?.userType === 'student'">
            <el-sub-menu index="student">
              <template #title>
                <el-icon><User /></el-icon>
                <span>学生中心</span>
              </template>
              <el-menu-item index="/student/dashboard">个人工作台</el-menu-item>
              <el-menu-item index="/student/profile">个人信息</el-menu-item>
              <el-menu-item index="/student/resume">我的简历</el-menu-item>
              <el-menu-item index="/student/applications">我的申请</el-menu-item>
              <el-menu-item index="/student/recommendations">推荐职位</el-menu-item>
              <el-menu-item index="/notifications">
                消息通知
                <el-badge v-if="unreadCount > 0" :value="unreadCount" class="notification-badge" />
              </el-menu-item>
            </el-sub-menu>
          </template>

          <!-- 企业专属菜单 -->
          <template v-if="userStore.userInfo?.userType === 'company'">
            <el-sub-menu index="company">
              <template #title>
                <el-icon><OfficeBuilding /></el-icon>
                <span>企业中心</span>
              </template>
              <el-menu-item index="/company/dashboard">企业工作台</el-menu-item>
              <el-menu-item index="/company/profile">企业信息</el-menu-item>
              <el-menu-item index="/company/jobs">职位管理</el-menu-item>
              <el-menu-item index="/company/applications">申请管理</el-menu-item>
              <el-menu-item index="/notifications">
                消息通知
                <el-badge v-if="unreadCount > 0" :value="unreadCount" class="notification-badge" />
              </el-menu-item>
            </el-sub-menu>
          </template>

          <!-- 管理员专属菜单 -->
          <template v-if="userStore.userInfo?.userType === 'admin'">
            <el-sub-menu index="admin">
              <template #title>
                <el-icon><Setting /></el-icon>
                <span>管理中心</span>
              </template>
              <el-menu-item index="/admin/dashboard">管理工作台</el-menu-item>
              <el-menu-item index="/admin/users">用户管理</el-menu-item>
              <el-menu-item index="/admin/companies">企业审核</el-menu-item>
              <el-menu-item index="/notifications">
                消息通知
                <el-badge v-if="unreadCount > 0" :value="unreadCount" class="notification-badge" />
              </el-menu-item>
            </el-sub-menu>
          </template>

          <!-- 未登录用户显示登录注册 -->
          <template v-if="!userStore.token">
            <el-menu-item index="/login">
              <el-icon><Key /></el-icon>
              <span>登录</span>
            </el-menu-item>
            <el-menu-item index="/register">
              <el-icon><UserFilled /></el-icon>
              <span>注册</span>
            </el-menu-item>
          </template>

          <!-- 已登录用户显示退出登录 -->
          <template v-else>
            <el-menu-item index="logout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-menu-item>
          </template>
        </el-menu>

        <!-- 底部版权信息 -->
        <div class="mobile-footer">
          <p>&copy; {{ new Date().getFullYear() }} 校园招聘系统</p>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useNotificationStore } from '@/stores/notification';
import { ElMessage, ElMessageBox } from 'element-plus';
import { DEFAULT_AVATAR } from '@/utils/defaultImages';
import {
  Menu, House, Briefcase, User, OfficeBuilding,
  Setting, Key, UserFilled, SwitchButton, Search,
  Bell, ChatLineRound, Document, Star
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const drawerVisible = ref(false);
const defaultAvatar = ref(DEFAULT_AVATAR);
const searchKeyword = ref('');

// 计算当前活动菜单项
const activeIndex = computed(() => route.path);

// 未读通知数量
const unreadCount = computed(() => notificationStore.unreadCount);

// 处理搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) return;

  // 根据关键词搜索菜单项
  const keyword = searchKeyword.value.toLowerCase();

  // 搜索逻辑
  if (keyword.includes('职位') || keyword.includes('job')) {
    router.push(getJobsPath());
  } else if (keyword.includes('公司') || keyword.includes('企业') || keyword.includes('company')) {
    router.push(getCompaniesPath());
  } else if (keyword.includes('简历') || keyword.includes('resume')) {
    router.push('/student/resume');
  } else if (keyword.includes('申请') || keyword.includes('application')) {
    router.push('/student/applications');
  } else if (keyword.includes('推荐') || keyword.includes('recommend')) {
    router.push('/student/recommendations');
  } else if (keyword.includes('通知') || keyword.includes('消息') || keyword.includes('notification')) {
    router.push('/notifications');
  } else if (keyword.includes('个人') || keyword.includes('profile')) {
    router.push('/student/profile');
  } else {
    // 如果没有匹配项，默认搜索职位
    router.push({
      path: getJobsPath(),
      query: { keyword: searchKeyword.value }
    });
  }

  // 关闭抽屉菜单
  drawerVisible.value = false;
  // 清空搜索关键词
  searchKeyword.value = '';
};

// 根据用户角色获取职位列表路径
const getJobsPath = () => {
  if (!userStore.token || !userStore.userInfo) return '/jobs';

  const userType = userStore.userInfo.userType;
  if (userType === 'student') return '/student/jobs';
  if (userType === 'company') return '/company/jobs';
  if (userType === 'admin') return '/admin/jobs';

  return '/jobs';
};

// 根据用户角色获取企业列表路径
const getCompaniesPath = () => {
  if (!userStore.token || !userStore.userInfo) return '/companies';

  const userType = userStore.userInfo.userType;
  if (userType === 'student') return '/student/companies';
  if (userType === 'company') return '/company/companies';
  if (userType === 'admin') return '/admin/company-list';

  return '/companies';
};

// 处理菜单项选择
const handleSelect = async (index: string) => {
  if (index === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      await userStore.logout();
      ElMessage.success('已退出登录');
      drawerVisible.value = false;
    } catch (action) {
      // 用户取消退出登录
    }
  } else {
    router.push(index);
    drawerVisible.value = false;
  }
};

// 获取用户类型文本
const getUserTypeText = (userType: string | undefined) => {
  switch (userType) {
    case 'student':
      return '学生用户';
    case 'company':
      return '企业用户';
    case 'admin':
      return '管理员';
    default:
      return '普通用户';
  }
};
</script>

<style scoped>
.mobile-menu {
  display: none; /* 默认隐藏，在小屏幕上显示 */
}

.menu-toggle {
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.menu-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  margin-bottom: 16px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 8px;
  margin: 10px;
}

.user-details {
  margin-left: 12px;
}

.user-details h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.user-details p {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.drawer-menu {
  border-right: none;
  flex: 1;
  margin-top: 10px;
}

.mobile-search {
  margin: 15px 0;
  padding: 0 15px;
  position: relative;
}

.mobile-search-input :deep(.el-input__wrapper) {
  border-radius: 20px !important;
  padding: 0 8px;
  background: rgba(35, 35, 50, 0.8);
  border: 1px solid rgba(100, 100, 255, 0.3);
  box-shadow: 0 0 10px rgba(80, 80, 255, 0.1);
  transition: all 0.3s ease;
  height: 40px;
  padding-right: 45px; /* 为搜索按钮预留空间 */
}

.mobile-search-input :deep(.el-input__wrapper:hover),
.mobile-search-input :deep(.el-input__wrapper:focus-within) {
  border-color: rgba(120, 120, 255, 0.8);
  box-shadow: 0 0 15px rgba(100, 100, 255, 0.3);
}

/* 输入框样式 */
.mobile-search-input :deep(.el-input__inner) {
  height: 40px;
  color: #eaeaea;
  background: transparent;
  font-size: 14px;
}

.mobile-search-input :deep(.el-input__inner::placeholder) {
  color: rgba(180, 180, 200, 0.6);
}

/* 前缀图标样式 */
.mobile-search-input :deep(.el-input__prefix) {
  padding-right: 8px;
}

.search-icon {
  color: rgba(150, 150, 255, 0.8);
  font-size: 16px;
}

/* 搜索按钮容器样式 */
.search-button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  height: 32px;
  width: 32px;
  z-index: 2;
}

/* 搜索按钮样式 */
.mobile-search-button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.mobile-search-button:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(150, 150, 255, 0.6);
}

/* 删除按钮样式 */
.mobile-search-input :deep(.el-input__clear) {
  color: rgba(180, 180, 200, 0.8);
  background: rgba(80, 80, 100, 0.3);
  border-radius: 50%;
  font-size: 14px;
  margin-right: 8px;
  transition: all 0.3s ease;
  height: 20px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  right: 0;
  z-index: 3;
}

.mobile-search-input :deep(.el-input__clear:hover) {
  color: white;
  background: rgba(255, 100, 100, 0.5);
  transform: scale(1.1);
}

/* 添加呼吸光效果 */
@keyframes glow {
  0% { box-shadow: 0 0 5px rgba(100, 100, 255, 0.3); }
  50% { box-shadow: 0 0 15px rgba(120, 120, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(100, 100, 255, 0.3); }
}

.mobile-search-input :deep(.el-input__wrapper:focus-within) {
  animation: glow 2s infinite;
}

/* 适配浅色主题 */
:root[data-theme="light"] .mobile-search-input :deep(.el-input__wrapper) {
  background: rgba(245, 245, 250, 0.9);
  border: 1px solid rgba(100, 100, 255, 0.2);
}

:root[data-theme="light"] .mobile-search-input :deep(.el-input__inner) {
  color: #333;
}

:root[data-theme="light"] .mobile-search-input :deep(.el-input__inner::placeholder) {
  color: rgba(100, 100, 120, 0.6);
}

:root[data-theme="light"] .search-icon {
  color: rgba(100, 100, 255, 0.7);
}

.mobile-footer {
  text-align: center;
  padding: 16px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  border-top: 1px solid var(--el-border-color-light);
  margin-top: auto;
}

.notification-badge {
  margin-left: 8px;
}

/* 在小屏幕上显示移动菜单 */
@media (max-width: 768px) {
  .mobile-menu {
    display: block;
  }

  /* 优化移动端抽屉菜单 */
  :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  :deep(.el-drawer__body) {
    padding: 0;
    overflow-y: auto;
  }

  /* 优化菜单项样式 */
  :deep(.el-menu-item) {
    height: 50px;
    line-height: 50px;
  }

  :deep(.el-sub-menu__title) {
    height: 50px;
    line-height: 50px;
  }
}
</style>
