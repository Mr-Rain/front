<template>
  <div class="navbar-content">
    <!-- 移动端菜单 - 仅在小屏幕显示 -->
    <MobileMenu class="mobile-menu-component" />

    <div class="left-section">
      <div class="logo-area">
        <a @click="navigateToHome" class="logo-link" style="cursor: pointer;">
          <!-- Replace with your actual logo or text -->
          <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="logo-img" />
          <span v-else class="logo-text">校园招聘</span>
        </a>
      </div>

      <!-- 导航链接 -->
      <div class="nav-links hide-on-mobile">
        <router-link :to="getJobsPath()"
          class="nav-link"
          :class="{ 'active': isJobsActive() }">
          职位列表
        </router-link>
        <router-link :to="getCompaniesPath()"
          class="nav-link"
          :class="{ 'active': isCompaniesActive() }">
          企业列表
        </router-link>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-container hide-on-mobile">
      <el-input
        v-model="searchQuery"
        placeholder="搜索职位、企业或关键词..."
        class="search-input"
        @keyup.enter="handleSearch"
        clearable
        :suffix-icon="null"
      >
        <template #prefix>
          <el-icon class="search-icon"><Search /></el-icon>
        </template>
        <template #suffix>
          <div class="search-button-container">
            <el-icon class="search-button navbar-search-button" @click="handleSearch"><Search /></el-icon>
          </div>
        </template>
      </el-input>
    </div>

      <div class="spacer"></div>

      <!-- 通知中心 -->
      <div v-if="userStore.token && userStore.userInfo" class="notification-center-container hide-on-mobile">
        <notification-center />
      </div>

      <!-- 主题切换器 -->
      <div class="theme-switcher-container hide-on-mobile">
        <theme-switcher />
      </div>

      <div class="user-area hide-on-mobile">
        <template v-if="userStore.token && userStore.userInfo">
          <el-dropdown @command="handleUserCommand">
            <span class="el-dropdown-link">
              <el-avatar :size="32" :src="userStore.userInfo.avatar || defaultAvatar" class="user-avatar" />
              <span class="username">{{ userStore.userInfo.username }}</span>
              <el-tooltip v-if="lastLoginTime" effect="dark" :content="'上次登录: ' + lastLoginTime" placement="bottom">
                <el-icon class="login-time-icon"><Clock /></el-icon>
              </el-tooltip>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="notifications">消息通知</el-dropdown-item>
                <el-dropdown-item command="settings">账号设置</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" plain @click="goToLogin">登录</el-button>
          <el-button plain @click="goToRegister">注册</el-button>
        </template>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { usePermissionStore } from '@/stores/permission';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  ArrowDown,
  Search,
  Clock
} from '@element-plus/icons-vue';
import MobileMenu from './MobileMenu.vue';
import NotificationCenter from './NotificationCenter.vue';
import ThemeSwitcher from './ThemeSwitcher.vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const permissionStore = usePermissionStore();

const logoUrl = ref(''); // Optional: Provide URL for logo image
const defaultAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'); // Default avatar
const searchQuery = ref('');

// 格式化上次登录时间
const lastLoginTime = computed(() => {
  if (!userStore.userInfo || !userStore.userInfo.lastLoginTime) {
    return null;
  }

  try {
    // 创建一个日期对象
    const date = new Date(userStore.userInfo.lastLoginTime);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return null;
    }

    // 格式化为本地时间字符串（北京时间）
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (e) {
    console.error('日期格式化错误:', e);
    return null;
  }
});

// 不需要计算属性，直接使用route.path

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

// 判断职位列表是否激活
const isJobsActive = () => {
  const path = route.path;
  return path === '/jobs' ||
         path === '/student/jobs' ||
         path === '/company/jobs' ||
         path === '/admin/jobs';
};

// 判断企业列表是否激活
const isCompaniesActive = () => {
  const path = route.path;
  return path === '/companies' ||
         path === '/student/companies' ||
         path === '/company/companies' ||
         path === '/admin/company-list';
};

// 处理搜索
const handleSearch = () => {
  if (!searchQuery.value.trim()) return;

  // 导航到搜索结果页面
  router.push({
    path: '/search',
    query: { q: searchQuery.value }
  });

  // 清空搜索框
  searchQuery.value = '';
};

const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/register');
};

// 根据用户角色导航到首页或对应的仪表盘
const navigateToHome = () => {
  // 检查用户是否已登录
  if (userStore.token && userStore.userInfo) {
    // 已登录，根据用户角色导航到对应的仪表盘
    const userType = userStore.userInfo.userType?.toLowerCase();

    if (userType === 'student') {
      router.push('/student/dashboard');
    } else if (userType === 'company') {
      router.push('/company/dashboard');
    } else if (userType === 'admin') {
      router.push('/admin/dashboard');
    } else {
      // 如果无法确定用户类型，导航到首页
      router.push('/');
    }
  } else {
    // 未登录，导航到首页
    router.push('/');
  }
};

const handleUserCommand = async (command: string | number | object) => {
  switch (command) {
    case 'profile':
      // Determine profile path based on user type
      const userType = userStore.userInfo?.userType;
      if (userType === 'student') {
        router.push('/student/profile'); // TODO: Define student profile route
      } else if (userType === 'company') {
        router.push('/company/profile'); // TODO: Define company profile route
      } else {
         router.push('/'); // Fallback or admin profile
      }
      break;
    case 'notifications':
      router.push('/notifications');
      break;
    case 'settings':
      router.push('/account-settings');
      break;
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        });
        await userStore.logout();
        ElMessage.success('已退出登录');
      } catch (action) {
        if (action === 'cancel') {
          // User cancelled logout
        } else {
            console.error('Logout failed:', action)
        }
      }
      break;
  }
};
</script>

<style scoped>
.navbar-content {
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  background-color: #fff;
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0 20px;
  user-select: none; /* Prevent text selection */
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
}

.logo-area {
  display: flex;
  align-items: center;
  margin-right: 40px;
  min-width: 120px;
}

.logo-link {
  text-decoration: none;
  display: flex;
  align-items: center;
}

.logo-img {
  height: 40px; /* Adjust as needed */
  vertical-align: middle;
}

.logo-text {
  font-size: 1.6em;
  font-weight: bold;
  color: var(--el-color-primary);
  vertical-align: middle;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 左侧区域样式 */
.left-section {
  display: flex;
  align-items: center;
}

/* 导航链接样式 */
.nav-links {
  display: flex;
  margin-left: 20px;
}

.nav-link {
  padding: 0 15px;
  height: 60px;
  line-height: 60px;
  color: var(--el-text-color-primary);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
  position: relative;
  user-select: none; /* Prevent text selection */
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
}

.nav-link:hover {
  color: var(--el-color-primary);
}

.nav-link.active {
  color: var(--el-color-primary);
  font-weight: 500;
}

.nav-link.active:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 15px;
  right: 15px;
  height: 2px;
  background-color: var(--el-color-primary);
}

/* 搜索框容器样式 */
.search-container {
  width: 350px;
  margin: 0 20px;
  flex-shrink: 0;
  position: relative;
}

@media (max-width: 768px) {
  .search-container {
    width: 100%;
    max-width: 300px;
    margin: 0 10px;
  }
}

/* 搜索框样式 */
.search-input :deep(.el-input__wrapper) {
  border-radius: 20px !important;
  padding: 0 8px;
  background: rgba(35, 35, 50, 0.8);
  border: 1px solid rgba(100, 100, 255, 0.3);
  box-shadow: 0 0 10px rgba(80, 80, 255, 0.1);
  transition: all 0.3s ease;
  height: 40px;
  padding-right: 45px; /* 为搜索按钮预留空间 */
}

.search-input :deep(.el-input__wrapper:hover),
.search-input :deep(.el-input__wrapper:focus-within) {
  border-color: rgba(120, 120, 255, 0.8);
  box-shadow: 0 0 15px rgba(100, 100, 255, 0.3);
}

/* 输入框样式 */
.search-input :deep(.el-input__inner) {
  height: 40px;
  color: #eaeaea;
  background: transparent;
  font-size: 14px;
}

.search-input :deep(.el-input__inner::placeholder) {
  color: rgba(180, 180, 200, 0.6);
}

/* 前缀图标样式 */
.search-input :deep(.el-input__prefix) {
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
.navbar-search-button {
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

.navbar-search-button:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(150, 150, 255, 0.6);
}

/* 删除按钮样式 */
.search-input :deep(.el-input__clear) {
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

/* 添加呼吸光效果 */
@keyframes glow {
  0% { box-shadow: 0 0 5px rgba(100, 100, 255, 0.3); }
  50% { box-shadow: 0 0 15px rgba(120, 120, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(100, 100, 255, 0.3); }
}

.search-input :deep(.el-input__wrapper:focus-within) {
  animation: glow 2s infinite;
}

/* 适配浅色主题 */
:root[data-theme="light"] .search-input :deep(.el-input__wrapper) {
  background: rgba(245, 245, 250, 0.9);
  border: 1px solid rgba(100, 100, 255, 0.2);
}

:root[data-theme="light"] .search-input :deep(.el-input__inner) {
  color: #333;
}

:root[data-theme="light"] .search-input :deep(.el-input__inner::placeholder) {
  color: rgba(100, 100, 120, 0.6);
}

:root[data-theme="light"] .search-icon {
  color: rgba(100, 100, 255, 0.7);
}

.spacer {
  flex-grow: 1; /* Pushes user area to the right */
}

.notification-center-container,
.theme-switcher-container {
  margin-right: 15px;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 10px; /* Space between buttons */
  user-select: none; /* Prevent text selection */
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  outline: none; /* Remove focus outline */
}

.user-avatar {
  margin-right: 8px;
}

.username {
    max-width: 100px; /* Prevent long usernames from breaking layout */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 4px;
}

.login-time-icon {
    color: var(--el-color-info);
    font-size: 14px;
    margin: 0 6px;
}

/* 移动端菜单组件样式 */
.mobile-menu-component {
  display: none; /* 默认隐藏，在小屏幕上显示 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .mobile-menu-component {
    display: block; /* 在小屏幕上显示移动端菜单 */
  }

  .hide-on-mobile {
    display: none !important;
  }

  .left-section {
    flex-grow: 1;
    justify-content: center;
  }

  .logo-area {
    margin: 0;
    display: flex;
    justify-content: center; /* 居中对齐 */
  }

  .navbar-content {
    padding: 0 10px;
  }

  /* 在移动端上调整logo大小 */
  .logo-text {
    font-size: 1.3em; /* 稍微增大字体，使其更突出 */
  }

  .logo-img {
    height: 32px;
  }

  /* 移动端搜索框样式 - 如果需要在移动端显示 */
  .search-container.show-on-mobile {
    display: block !important;
    width: 100%;
    margin: 10px 0;
    padding: 0 15px;
  }
}

/* 平板设备优化 */
@media (min-width: 769px) and (max-width: 992px) {
  .navbar-content {
    padding: 0 15px;
  }

  .logo-area {
    margin-right: 15px;
  }

  .nav-links {
    margin-left: 10px;
  }

  .nav-link {
    padding: 0 10px;
  }

  .search-container {
    width: 200px;
    margin-right: 15px;
  }

  .search-container:hover {
    width: 240px;
  }
}
</style>