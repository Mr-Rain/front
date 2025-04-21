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
            <p>{{ getUserTypeText(userStore.userInfo.user_type) }}</p>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="mobile-search">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索..."
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
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
          <template v-if="userStore.userInfo?.user_type === 'student'">
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
          <template v-if="userStore.userInfo?.user_type === 'company'">
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
          <template v-if="userStore.userInfo?.user_type === 'admin'">
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
const defaultAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png');
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

  const userType = userStore.userInfo.user_type;
  if (userType === 'student') return '/student/jobs';
  if (userType === 'company') return '/company/jobs';
  if (userType === 'admin') return '/admin/jobs';

  return '/jobs';
};

// 根据用户角色获取企业列表路径
const getCompaniesPath = () => {
  if (!userStore.token || !userStore.userInfo) return '/companies';

  const userType = userStore.userInfo.user_type;
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
  padding: 10px 16px;
  margin-bottom: 10px;
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
