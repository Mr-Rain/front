<template>
  <div class="app-wrapper">
    <!-- Main Container (includes Navbar and Content) -->
    <div class="main-container">
      <!-- Navbar -->
      <header class="navbar-container">
        <Navbar />
      </header>

      <!-- Main Content Area -->
      <main class="app-main" :class="{ 'has-tab-bar': isMobile }">
        <pull-to-refresh
          v-if="isMobile && enablePullToRefresh"
          @refresh="handleRefresh"
          :refreshing="refreshing"
        >
          <div class="el-scrollbar">
            <div class="el-scrollbar__wrap el-scrollbar__wrap--hidden-default">
              <div class="el-scrollbar__view">
                <router-view v-slot="{ Component, route }">
                  <transition name="fade-transform" mode="out-in">
                    <!-- 不使用 keep-alive，避免组件缓存导致的问题 -->
                    <component :is="Component" :key="route.fullPath" />
                  </transition>
                </router-view>
              </div>
            </div>
          </div>
        </pull-to-refresh>

        <div v-else class="el-scrollbar">
          <div class="el-scrollbar__wrap el-scrollbar__wrap--hidden-default">
            <div class="el-scrollbar__view">
              <router-view v-slot="{ Component, route }">
                <transition name="fade-transform" mode="out-in">
                  <!-- 不使用 keep-alive，避免组件缓存导致的问题 -->
                  <component :is="Component" :key="route.fullPath" />
                </transition>
              </router-view>
            </div>
          </div>
        </div>
      </main>

      <!-- Mobile Tab Bar -->
      <mobile-tab-bar v-if="isMobile" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
// 引入通用组件
import Navbar from '@/components/common/Navbar.vue';
import MobileTabBar from '@/components/common/MobileTabBar.vue';
import PullToRefresh from '@/components/common/PullToRefresh.vue';

const route = useRoute();

// 移动端相关状态
const isMobile = ref(false);
const refreshing = ref(false);
const enablePullToRefresh = computed(() => {
  // 只在特定页面启用下拉刷新
  const refreshableRoutes = [
    '/jobs',
    '/companies',
    '/student/jobs',
    '/student/companies',
    '/student/applications',
    '/student/recommendations',
    '/company/applications',
    '/notifications'
  ];

  return refreshableRoutes.some(path => route.path.startsWith(path));
});

// 处理下拉刷新
const handleRefresh = () => {
  refreshing.value = true;

  // 模拟刷新操作
  setTimeout(() => {
    // 刷新当前页面
    window.location.reload();
    refreshing.value = false;
  }, 1000);
};

// 检测设备类型
const checkDeviceType = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 组件挂载时添加事件监听
onMounted(() => {
  checkDeviceType();
  window.addEventListener('resize', checkDeviceType);
});

// 组件卸载前移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkDeviceType);
});
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;
}

.main-container {
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
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

.app-main.has-tab-bar {
  padding-bottom: var(--mobile-footer-height, 50px);
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

/* 移动端适配 */
@media (max-width: 768px) {
  .navbar-container {
    height: var(--mobile-header-height, 56px);
  }

  .el-scrollbar__view {
    padding: var(--mobile-padding, 10px);
  }

  /* 适配底部安全区域 */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .app-main.has-tab-bar {
      padding-bottom: calc(var(--mobile-footer-height, 50px) + env(safe-area-inset-bottom));
    }
  }
}
</style>
