<template>
  <div class="app-wrapper">
    <!-- Navbar - Now at the top of the entire layout -->
    <header class="navbar-container">
      <Navbar />
    </header>

    <div class="content-wrapper">
      <!-- Sidebar - Now below navbar -->
      <Sidebar class="sidebar-container" :class="{ 'collapsed': isSidebarCollapsed }" @collapse-change="handleSidebarCollapse" />

      <!-- Main Container -->
      <div class="main-container" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">

      <!-- Main Content Area -->
      <main class="app-main">
        <div class="el-scrollbar">
          <div class="el-scrollbar__wrap el-scrollbar__wrap--hidden-default">
            <div class="el-scrollbar__view">
              <router-view v-slot="{ Component, route }">
                <transition name="fade-transform" mode="out-in">
                  <keep-alive>
                    <component :is="Component" :key="route.path" />
                  </keep-alive>
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
import { ref } from 'vue';
// Reusing common components
import Navbar from '@/components/common/Navbar.vue';
import Sidebar from '@/components/common/Sidebar.vue';

// 侧边栏折叠状态
const isSidebarCollapsed = ref(false);

// 处理侧边栏折叠状态变化
const handleSidebarCollapse = (collapsed: boolean) => {
  isSidebarCollapsed.value = collapsed;
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
  background-color: #fff;
  border-right: 1px solid var(--el-border-color-light);
}

/* 折叠时的侧边栏宽度 */
.app-wrapper .sidebar-container.collapsed {
  width: 64px;
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

.sidebar-collapsed .main-container {
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