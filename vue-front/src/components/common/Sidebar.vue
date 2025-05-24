<template>
  <el-aside :width="isCollapsed ? '64px' : '200px'" class="sidebar">
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :unique-opened="true"
        :collapse-transition="false"
        mode="vertical"
        router
      >
        <!-- Dynamic Menu Items based on Role -->
        <template v-for="item in menuItems" :key="item.path">
          <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
            <template #title>
              <el-icon v-if="item.meta?.icon"><component :is="item.meta.icon" /></el-icon>
              <span>{{ item.meta?.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
            >
             <el-icon v-if="child.meta?.icon"><component :is="child.meta.icon" /></el-icon>
             <span>{{ child.meta?.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.path">
            <el-icon v-if="item.meta?.icon"><component :is="item.meta.icon" /></el-icon>
            <template #title>{{ item.meta?.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
    <!-- Optional: Collapse button -->
    <div class="collapse-button" @click="toggleCollapse">
       <el-icon :class="{ 'is-rotated': isCollapsed }">
           <component :is="isCollapsed ? Expand : Fold" />
       </el-icon>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePermissionStore } from '@/stores/permission';
import { useUserStore } from '@/stores/user';
import {
    Document,
    Menu as IconMenu,
    Setting,
    User,
    Briefcase,
    DataAnalysis,
    Fold,
    Expand
} from '@element-plus/icons-vue'; // Import icons
import type { Component } from 'vue'; // Import Component type

const route = useRoute();
const permissionStore = usePermissionStore();

const isCollapsed = ref(false);

// 定义事件
const emit = defineEmits(['collapse-change']);

// Calculate active menu based on current route
const activeMenu = computed(() => {
  const { meta, path } = route;
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu as string;
  }
  return path;
});

// Define type for menu items
interface MenuItem {
  path: string;
  meta: {
    title: string;
    icon?: Component; // Icon is optional and should be a Vue component
    activeMenu?: string; // Optional: for highlighting a different menu item
  };
  children?: MenuItem[]; // Children are optional
}

// 生成菜单项
const menuItems = computed((): MenuItem[] => { // Specify return type
  console.log('Sidebar roles:', permissionStore.roles); // 调试用

  // 获取用户类型
  const userStore = useUserStore();
  const userType = userStore.userInfo?.userType?.toLowerCase();
  console.log('User type from userInfo:', userType); // 调试用

  // 检查用户是否有学生角色（不区分大小写）
  const hasStudentRole = permissionStore.roles.some(role =>
    typeof role === 'string' && role.toLowerCase() === 'student'
  );

  // 检查用户是否有企业角色（不区分大小写）
  const hasCompanyRole = permissionStore.roles.some(role =>
    typeof role === 'string' && role.toLowerCase() === 'company'
  );

  // 检查用户是否有管理员角色（不区分大小写）
  const hasAdminRole = permissionStore.roles.some(role =>
    typeof role === 'string' && role.toLowerCase() === 'admin'
  );

  // 首先检查权限存储中的角色
  if (hasStudentRole || userType === 'student') {
    console.log('Generating student menu');
    return [
      { path: '/student/dashboard', meta: { title: '我的主页', icon: DataAnalysis } },
      { path: '/student/profile', meta: { title: '个人信息', icon: User } },
      { path: '/student/jobs', meta: { title: '浏览职位', icon: Briefcase } },
      { path: '/student/resume', meta: { title: '我的简历', icon: Document } },
      { path: '/student/applications', meta: { title: '我的申请', icon: IconMenu } },
      { path: '/student/recommendations', meta: { title: '智能推荐', icon: Setting } },
    ];
  } else if (hasCompanyRole || userType === 'company') {
    console.log('Generating company menu');
    return [
       { path: '/company/dashboard', meta: { title: '招聘管理', icon: DataAnalysis } },
       { path: '/company/profile', meta: { title: '公司信息', icon: User } },
       { path: '/company/jobs', meta: { title: '职位管理', icon: Briefcase } },
       { path: '/company/applications', meta: { title: '收到申请', icon: Document } },
    ];
  } else if (hasAdminRole || userType === 'admin') {
    console.log('Generating admin menu');
    return [
        { path: '/admin/dashboard', meta: { title: '管理后台', icon: DataAnalysis } },
        { path: '/admin/users', meta: { title: '用户管理', icon: User } },
        { path: '/admin/companies', meta: { title: '企业审核', icon: Briefcase } },
     ];
  }

  // 如果没有匹配的角色，但有用户信息，尝试根据用户类型返回菜单
  if (userStore.userInfo) {
    console.log('Fallback to user type menu generation'); // 调试用

    // 根据用户类型生成菜单
    if (userType === 'student') {
      console.log('Generating student menu based on user type');
      return [
        { path: '/student/dashboard', meta: { title: '我的主页', icon: DataAnalysis } },
        { path: '/student/profile', meta: { title: '个人信息', icon: User } },
        { path: '/student/jobs', meta: { title: '浏览职位', icon: Briefcase } },
        { path: '/student/resume', meta: { title: '我的简历', icon: Document } },
        { path: '/student/applications', meta: { title: '我的申请', icon: IconMenu } },
        { path: '/student/recommendations', meta: { title: '智能推荐', icon: Setting } },
      ];
    } else if (userType === 'company') {
      console.log('Generating company menu based on user type');
      return [
        { path: '/company/dashboard', meta: { title: '招聘管理', icon: DataAnalysis } },
        { path: '/company/profile', meta: { title: '公司信息', icon: User } },
        { path: '/company/jobs', meta: { title: '职位管理', icon: Briefcase } },
        { path: '/company/applications', meta: { title: '收到申请', icon: Document } },
      ];
    } else if (userType === 'admin') {
      console.log('Generating admin menu based on user type');
      return [
        { path: '/admin/dashboard', meta: { title: '管理后台', icon: DataAnalysis } },
        { path: '/admin/users', meta: { title: '用户管理', icon: User } },
        { path: '/admin/companies', meta: { title: '企业审核', icon: Briefcase } },
      ];
    }
  }

  console.log('No matching role or user type found, returning empty menu');
  return []; // 默认返回空菜单
});

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  // 触发折叠状态变化事件
  emit('collapse-change', isCollapsed.value);
};

// 监听折叠状态变化
watch(isCollapsed, (newValue) => {
  emit('collapse-change', newValue);
});
</script>

<style scoped>
.sidebar {
  height: 100vh; /* Fill viewport height */
  border-right: 1px solid var(--el-border-color-light);
  background-color: #fff; /* Or your desired sidebar background */
  display: flex;
  flex-direction: column;
  transition: width 0.28s; /* Smooth collapse transition */
}

.el-scrollbar {
    flex-grow: 1;
    overflow: hidden;
}

/* Ensure menu fills the scrollbar area */
.el-menu {
  border-right: none; /* Remove the default border */
  height: 100%;
  user-select: none; /* Prevent text selection */
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
}

/* Remove border for collapsed menu */
.el-menu--collapse {
  width: 100%;
}

.collapse-button {
    height: 40px;
    line-height: 40px;
    text-align: center;
    cursor: pointer;
    border-top: 1px solid var(--el-border-color-light);
    flex-shrink: 0; /* Prevent button from shrinking */
    width: 100%; /* Make button width 100% of parent container */
    transition: width 0.28s; /* Add transition to match sidebar */
    user-select: none; /* Prevent text selection */
    -webkit-user-select: none; /* Safari */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE10+/Edge */
}

.collapse-button .el-icon {
    font-size: 18px;
    vertical-align: middle;
    transition: transform 0.3s; /* Add transition for icon rotation */
}

.collapse-button .el-icon.is-rotated {
    transform: rotate(180deg);
}

</style>