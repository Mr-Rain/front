<template>
  <div class="app-wrapper">
    <!-- Sidebar -->
    <Sidebar class="sidebar-container" @collapse-change="handleSidebarCollapse" />

    <!-- Main Container (includes Navbar and Content) -->
    <div class="main-container" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <!-- Navbar -->
      <header class="navbar-container">
        <Navbar />
      </header>

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
}

.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 200px;
  height: 100%;
  z-index: 1001;
  transition: width 0.28s;
  overflow: hidden;
}

.main-container {
  position: relative;
  height: 100vh;
  margin-left: 200px;
  width: calc(100% - 200px);
  transition: margin-left 0.28s, width 0.28s;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.sidebar-collapsed .main-container {
  margin-left: 64px;
  width: calc(100% - 64px);
}

.navbar-container {
  height: 60px;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
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