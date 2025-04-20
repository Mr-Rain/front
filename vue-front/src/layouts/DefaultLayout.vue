<template>
  <div class="app-wrapper">
    <!-- Main Container (includes Navbar and Content) -->
    <div class="main-container">
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
                  <component :is="Component" :key="route.path" />
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
// 引入通用组件
import Navbar from '@/components/common/Navbar.vue';
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
