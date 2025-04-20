<template>
  <div class="app-wrapper">
    <!-- Navbar - Now at the top of the entire layout -->
    <header class="navbar-container">
      <Navbar />
    </header>

    <div class="content-wrapper">
      <!-- Sidebar - Now below navbar -->
      <aside class="sidebar-container" :class="{ 'is-collapsed': isCollapsed }">
        <el-scrollbar>
          <el-menu
            router
            :default-active="activeMenu"
            :collapse="isCollapsed"
            class="sidebar-menu"
          >
            <el-menu-item index="/admin/dashboard">
              <el-icon><Platform /></el-icon>
              <template #title>工作台</template>
            </el-menu-item>
            <el-menu-item index="/admin/users">
              <el-icon><User /></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>
            <el-menu-item index="/admin/companies">
              <el-icon><OfficeBuilding /></el-icon>
              <template #title>企业审核</template>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
        <!-- 折叠按钮 -->
        <div class="collapse-button" @click="toggleCollapse">
          <el-icon>
            <component :is="isCollapsed ? Expand : Fold" />
          </el-icon>
        </div>
      </aside>

      <!-- Main Container -->
      <div class="main-container" :class="{ 'sidebar-collapsed': isCollapsed }">

      <!-- Main Content Area -->
      <main class="app-main">
        <div class="el-scrollbar">
          <div class="el-scrollbar__wrap el-scrollbar__wrap--hidden-default">
            <div class="el-scrollbar__view">
              <router-view v-slot="{ Component, route }">
                <transition name="fade-transform" mode="out-in">
                  <component :is="Component" :key="route.path" />
                </transition>
              </router-view>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { Platform, User, OfficeBuilding, ArrowDown, Fold, Expand } from '@element-plus/icons-vue';
import Navbar from '@/components/common/Navbar.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 侧边栏折叠状态
const isCollapsed = ref(false);

const activeMenu = computed(() => {
  const { path } = route;
  return path;
});

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    await userStore.logout();
    router.push('/login');
  }
};
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.navbar-container {
  height: 60px;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 1002; /* 确保导航栏在最上层 */
}

.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar-container {
  position: relative;
  width: 200px;
  height: calc(100vh - 60px); /* 减去导航栏高度 */
  transition: width 0.28s;
  overflow: hidden;
  z-index: 1001;
  background-color: #304156;
  color: #bfcbd9;
}

.sidebar-container.is-collapsed {
  width: 64px;
}

.sidebar-menu {
  border-right: none;
  background-color: transparent;
}

.sidebar-menu .el-menu-item {
  color: #bfcbd9;
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-sub-menu__title:hover {
  background-color: #263445;
}

.sidebar-menu .el-menu-item.is-active {
  color: #409EFF;
  background-color: #263445;
}

.collapse-button {
  height: 40px;
  line-height: 40px;
  text-align: center;
  cursor: pointer;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #bfcbd9;
}

.collapse-button:hover {
  background-color: #263445;
}

.main-container {
  position: relative;
  height: calc(100vh - 60px); /* 减去导航栏高度 */
  width: calc(100% - 200px);
  transition: width 0.28s;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.sidebar-collapsed {
  width: calc(100% - 64px);
}

.app-main {
  flex: 1;
  padding: 0;
  overflow: hidden;
  position: relative;
}

.el-scrollbar {
  height: 100%;
}

.el-scrollbar__view {
  padding: 20px;
}

/* Transition styles */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all .5s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>