<template>
  <div class="navbar-content">
    <!-- 移动端菜单 - 仅在小屏幕显示 -->
    <MobileMenu class="mobile-menu-component" />

    <div class="logo-area">
      <router-link to="/">
        <!-- Replace with your actual logo or text -->
        <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="logo-img" />
        <span v-else class="logo-text">校园招聘</span>
      </router-link>
    </div>

      <!-- 导航菜单 - 在大屏幕显示 -->
      <el-menu
        mode="horizontal"
        :ellipsis="false"
        :default-active="activeIndex"
        class="nav-menu hide-on-mobile"
        router
      >
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/jobs">职位列表</el-menu-item>
        <!-- 学生角色菜单 -->
        <el-sub-menu v-if="userStore.userInfo?.user_type === 'student'" index="/student">
          <template #title>学生中心</template>
          <el-menu-item index="/student/dashboard">个人工作台</el-menu-item>
          <el-menu-item index="/student/profile">个人信息</el-menu-item>
          <el-menu-item index="/student/resume">我的简历</el-menu-item>
          <el-menu-item index="/student/applications">我的申请</el-menu-item>
          <el-menu-item index="/student/recommendations">推荐职位</el-menu-item>
        </el-sub-menu>
        <!-- 企业角色菜单 -->
        <el-sub-menu v-if="userStore.userInfo?.user_type === 'company'" index="/company">
          <template #title>企业中心</template>
          <el-menu-item index="/company/dashboard">企业工作台</el-menu-item>
          <el-menu-item index="/company/profile">企业信息</el-menu-item>
          <el-menu-item index="/company/jobs">职位管理</el-menu-item>
          <el-menu-item index="/company/applications">申请管理</el-menu-item>
        </el-sub-menu>
        <!-- 管理员角色菜单 -->
        <el-sub-menu v-if="userStore.userInfo?.user_type === 'admin'" index="/admin">
          <template #title>管理中心</template>
          <el-menu-item index="/admin/dashboard">管理工作台</el-menu-item>
          <el-menu-item index="/admin/users">用户管理</el-menu-item>
          <el-menu-item index="/admin/companies">企业审核</el-menu-item>
        </el-sub-menu>
      </el-menu>

      <div class="spacer"></div>

      <div class="user-area hide-on-mobile">
        <template v-if="userStore.token && userStore.userInfo">
          <el-dropdown @command="handleUserCommand">
            <span class="el-dropdown-link">
              <el-avatar :size="32" :src="userStore.userInfo.avatar || defaultAvatar" class="user-avatar" />
              <span class="username">{{ userStore.userInfo.username }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import MobileMenu from './MobileMenu.vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const logoUrl = ref(''); // Optional: Provide URL for logo image
const defaultAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'); // Default avatar

// Computed property for active menu item based on current route
const activeIndex = computed(() => route.path);

const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/register');
};

const handleUserCommand = async (command: string | number | object) => {
  switch (command) {
    case 'profile':
      // Determine profile path based on user type
      const userType = userStore.userInfo?.user_type;
      if (userType === 'student') {
        router.push('/student/profile'); // TODO: Define student profile route
      } else if (userType === 'company') {
        router.push('/company/profile'); // TODO: Define company profile route
      } else {
         router.push('/'); // Fallback or admin profile
      }
      break;
    case 'settings':
      // router.push('/account/settings'); // TODO: Define settings route
      ElMessage.info('账号设置功能待开发');
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
}

.logo-area {
  display: flex;
  align-items: center;
  margin-right: 40px;
}

.logo-img {
  height: 40px; /* Adjust as needed */
  vertical-align: middle;
}

.logo-text {
  font-size: 1.4em;
  font-weight: bold;
  color: var(--el-color-primary);
  vertical-align: middle;
}

/* Remove border from horizontal menu */
.nav-menu {
  border-bottom: none !important;
  height: 100%;
}

/* Adjust menu item padding/styles if needed */
.el-menu--horizontal > .el-menu-item {
    border-bottom: none;
    height: 100%;
    display: inline-flex; /* Align items vertically */
    align-items: center;
}

.spacer {
  flex-grow: 1; /* Pushes user area to the right */
}

.user-area {
  display: flex;
  align-items: center;
  gap: 10px; /* Space between buttons */
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

/* 移动端菜单组件样式 */
.mobile-menu-component {
  display: none; /* 默认隐藏，在小屏幕上显示 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .mobile-menu-component {
    display: block; /* 在小屏幕上显示移动端菜单 */
  }

  .logo-area {
    margin: 0 auto; /* 将logo居中显示 */
    flex-grow: 1;
    display: flex;
    justify-content: center;
  }

  .navbar-content {
    padding: 0 10px;
  }

  /* 在移动端上调整logo大小 */
  .logo-text {
    font-size: 1.2em;
  }

  .logo-img {
    height: 32px;
  }
}

/* 平板设备优化 */
@media (min-width: 769px) and (max-width: 992px) {
  .navbar-content {
    padding: 0 15px;
  }

  .logo-area {
    margin-right: 20px;
  }

  /* 减少菜单项间距 */
  .el-menu--horizontal > .el-menu-item {
    padding: 0 15px;
  }
}
</style>