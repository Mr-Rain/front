<template>
  <div class="mobile-tab-bar" v-if="isMobile">
    <div 
      v-for="(item, index) in visibleTabs" 
      :key="index"
      class="tab-item"
      :class="{ active: isActive(item.route) }"
      @click="handleTabClick(item)"
    >
      <el-badge :value="item.badge" :hidden="!item.badge" class="tab-badge">
        <el-icon class="tab-icon"><component :is="item.icon" /></el-icon>
      </el-badge>
      <span class="tab-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useNotificationStore } from '@/stores/notification';
import {
  House, Briefcase, User, OfficeBuilding,
  Document, Bell, ChatLineRound, Setting
} from '@element-plus/icons-vue';

// 定义标签项类型
interface TabItem {
  label: string;
  icon: any;
  route: string;
  badge?: number;
  roles?: string[];
  requireAuth?: boolean;
}

// 定义组件属性
const props = defineProps({
  // 是否强制显示
  forceShow: {
    type: Boolean,
    default: false
  }
});

// 获取路由和用户状态
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

// 计算是否为移动端
const isMobile = computed(() => {
  return props.forceShow || window.innerWidth <= 768;
});

// 未读通知数量
const unreadCount = computed(() => notificationStore.unreadCount);

// 定义标签项
const tabs = computed<TabItem[]>(() => {
  const commonTabs: TabItem[] = [
    { label: '首页', icon: House, route: '/' }
  ];
  
  // 学生标签
  const studentTabs: TabItem[] = [
    { label: '职位', icon: Briefcase, route: '/student/jobs' },
    { label: '简历', icon: Document, route: '/student/resume' },
    { label: '消息', icon: Bell, route: '/notifications', badge: unreadCount.value },
    { label: '我的', icon: User, route: '/student/profile' }
  ];
  
  // 企业标签
  const companyTabs: TabItem[] = [
    { label: '职位', icon: Briefcase, route: '/company/jobs' },
    { label: '申请', icon: Document, route: '/company/applications' },
    { label: '消息', icon: Bell, route: '/notifications', badge: unreadCount.value },
    { label: '企业', icon: OfficeBuilding, route: '/company/profile' }
  ];
  
  // 管理员标签
  const adminTabs: TabItem[] = [
    { label: '用户', icon: User, route: '/admin/users' },
    { label: '企业', icon: OfficeBuilding, route: '/admin/companies' },
    { label: '消息', icon: Bell, route: '/notifications', badge: unreadCount.value },
    { label: '设置', icon: Setting, route: '/admin/dashboard' }
  ];
  
  // 未登录标签
  const guestTabs: TabItem[] = [
    { label: '职位', icon: Briefcase, route: '/jobs' },
    { label: '企业', icon: OfficeBuilding, route: '/companies' },
    { label: '登录', icon: User, route: '/login' }
  ];
  
  // 根据用户角色返回对应标签
  if (!userStore.token) {
    return [...commonTabs, ...guestTabs];
  }
  
  const userType = userStore.userInfo?.user_type;
  
  if (userType === 'student') {
    return [...commonTabs, ...studentTabs];
  } else if (userType === 'company') {
    return [...commonTabs, ...companyTabs];
  } else if (userType === 'admin') {
    return [...commonTabs, ...adminTabs];
  }
  
  return commonTabs;
});

// 计算可见标签
const visibleTabs = computed(() => {
  return tabs.value.slice(0, 5); // 最多显示5个标签
});

// 判断标签是否激活
const isActive = (path: string) => {
  // 精确匹配
  if (route.path === path) return true;
  
  // 前缀匹配
  if (path !== '/' && route.path.startsWith(path)) return true;
  
  return false;
};

// 处理标签点击
const handleTabClick = (item: TabItem) => {
  router.push(item.route);
};

// 监听路由变化，更新通知数量
watch(
  () => route.path,
  () => {
    if (route.path === '/notifications') {
      notificationStore.markAllAsRead();
    }
  }
);
</script>

<style scoped>
.mobile-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: var(--mobile-footer-height, 50px);
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  user-select: none;
  border-top: 1px solid var(--el-border-color-lighter);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  padding: 4px 0;
  transition: all 0.3s;
  color: var(--el-text-color-secondary);
}

.tab-item.active {
  color: var(--el-color-primary);
}

.tab-icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.tab-label {
  font-size: 12px;
  line-height: 1;
}

.tab-badge :deep(.el-badge__content) {
  transform: scale(0.8);
  transform-origin: top right;
}

/* 适配底部安全区域 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .mobile-tab-bar {
    padding-bottom: env(safe-area-inset-bottom);
    height: calc(var(--mobile-footer-height, 50px) + env(safe-area-inset-bottom));
  }
}
</style>
