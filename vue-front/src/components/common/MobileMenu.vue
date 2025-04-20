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
      size="70%"
      :with-header="true"
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
          
          <el-menu-item index="/jobs">
            <el-icon><Briefcase /></el-icon>
            <span>职位列表</span>
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
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Menu, House, Briefcase, User, OfficeBuilding, 
  Setting, Key, UserFilled, SwitchButton 
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const drawerVisible = ref(false);
const defaultAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png');

// 计算当前活动菜单项
const activeIndex = computed(() => route.path);

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
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  margin-bottom: 16px;
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
}

/* 在小屏幕上显示移动菜单 */
@media (max-width: 768px) {
  .mobile-menu {
    display: block;
  }
}
</style>
