<template>
  <el-header class="navbar">
    <div class="navbar-content">
      <div class="logo-area">
        <router-link to="/">
          <!-- Replace with your actual logo or text -->
          <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="logo-img" />
          <span v-else class="logo-text">校园招聘</span>
        </router-link>
      </div>

      <!-- Navigation Links - Can be dynamic based on user role -->
      <el-menu
        mode="horizontal"
        :ellipsis="false" 
        :default-active="activeIndex"
        class="nav-menu"
        router 
      >
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/jobs">职位列表</el-menu-item> 
        <!-- Add more links based on roles -->
        <el-menu-item v-if="userStore.userInfo?.user_type === 'student'" index="/student/applications">我的申请</el-menu-item>
        <el-menu-item v-if="userStore.userInfo?.user_type === 'company'" index="/company/jobs">职位管理</el-menu-item>
      </el-menu>

      <div class="spacer"></div>

      <div class="user-area">
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
  </el-header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';

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
.navbar {
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: #fff;
  height: 60px; /* Standard header height */
}

.navbar-content {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 1200px; /* Or your desired max width */
  margin: 0 auto; /* Center content */
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

/* Responsive considerations (Example using media query) */
@media (max-width: 768px) {
  .nav-menu {
    display: none; /* Hide menu items on smaller screens, use a drawer menu instead */
  }
  .username {
      display: none; /* Hide username on smaller screens */
  }
  .logo-area {
    margin-right: 10px;
  }
  .navbar-content {
      padding: 0 10px;
  }
}
</style> 