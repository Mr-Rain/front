<template>
  <el-container class="app-layout company-layout">
    <!-- Sidebar -->
    <Sidebar class="sidebar-container" />

    <el-container class="main-container">
      <!-- Navbar -->
      <Navbar />

      <!-- Main Content Area -->
      <el-main class="app-main">
        <el-scrollbar>
          <router-view v-slot="{ Component, route }">
            <transition name="fade-transform" mode="out-in">
              <!-- Add keep-alive based on needs -->
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </el-scrollbar>
      </el-main>

      <!-- Optional Footer -->
      <!-- <Footer /> -->
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
// Reusing common components
import Navbar from '@/components/common/Navbar.vue';
import Sidebar from '@/components/common/Sidebar.vue'; 
// import Footer from '@/components/common/Footer.vue';

// No specific logic needed for basic layout
</script>

<style lang="scss" scoped>
// Styles can be identical or similar to StudentLayout
.app-layout {
  height: 100vh;
  background-color: #f0f2f5; 
}

.sidebar-container {
  transition: width 0.28s;
  height: 100%; 
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;
  overflow: hidden;
}

.main-container {
  min-height: 100%;
  transition: margin-left .28s;
  margin-left: 200px; // TODO: Make dynamic based on actual sidebar state
  position: relative;
}

.app-main {
  min-height: calc(100vh - 60px); /* Adjust if navbar height changes */
  width: 100%;
  position: relative;
  overflow: hidden;
  padding: 20px; 
}

.el-main {
    padding: 0; 
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