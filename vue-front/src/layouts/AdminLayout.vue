<template>
  <el-container class="admin-layout">
    <el-aside width="200px" class="admin-sidebar">
      <el-scrollbar>
        <el-menu router :default-active="activeMenu">
          <div class="sidebar-logo">管理后台</div>
          <el-menu-item index="/admin/dashboard">
            <el-icon><Platform /></el-icon>
            <span>工作台</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/companies">
            <el-icon><OfficeBuilding /></el-icon>
            <span>企业审核</span>
          </el-menu-item>
           <!-- Add more admin menu items here -->
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
         <div><!-- Placeholder for breadcrumbs or other header items --></div>
         <div class="user-info">
            <el-dropdown>
                <span class="el-dropdown-link">
                管理员 <el-icon><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
                </template>
            </el-dropdown>
         </div>
      </el-header>

      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElContainer, ElAside, ElScrollbar, ElMenu, ElMenuItem, ElIcon, ElHeader, ElMain, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import { Platform, User, OfficeBuilding, ArrowDown } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const activeMenu = computed(() => {
  const { path } = route;
  return path;
});

const logout = async () => {
    await userStore.logout();
    router.push('/login');
}

</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.admin-sidebar {
  background-color: #304156; /* Dark sidebar background */
  overflow-x: hidden; /* Prevent horizontal scroll */
}

.admin-sidebar .el-menu {
  border-right: none; /* Remove default menu border */
  background-color: transparent; /* Inherit background */
}

.admin-sidebar .el-menu-item,
.admin-sidebar .el-sub-menu__title {
  color: #bfcbd9; /* Light text color */
}

.admin-sidebar .el-menu-item:hover,
.admin-sidebar .el-sub-menu__title:hover {
  background-color: #263445; /* Darker hover */
}

.admin-sidebar .el-menu-item.is-active {
  color: #409EFF; /* Element Plus primary color */
  background-color: #263445;
}

.sidebar-logo {
    height: 60px;
    line-height: 60px;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    background-color: #2b2f3a;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  height: 50px; /* Adjust header height */
}

.user-info {
    cursor: pointer;
}

.admin-main {
  background-color: #f0f2f5; /* Light grey background for content */
  padding: 20px;
}
</style> 