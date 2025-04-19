<template>
  <el-container class="app-layout student-layout">
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
              <keep-alive> 
                <component :is="Component" :key="route.path" />
              </keep-alive>
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
import Navbar from '@/components/common/Navbar.vue';
import Sidebar from '@/components/common/Sidebar.vue';
// import Footer from '@/components/common/Footer.vue'; // Optional
</script>

<style lang="scss" scoped>
.app-layout {
  height: 100vh;
  background-color: #f0f2f5; /* Background for the main area */
}

.sidebar-container {
  // Sidebar styles are mostly handled within the Sidebar component itself
  transition: width 0.28s;
  height: 100%; 
  position: fixed; /* Or relative depending on layout needs */
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;
  overflow: hidden;
}

.main-container {
  min-height: 100%;
  transition: margin-left .28s;
  // Adjust margin based on sidebar width (example)
  margin-left: 200px; // Same as expanded sidebar width
  position: relative;
}

// Adjust main container margin when sidebar collapses (example)
// You might need a global state (e.g., Pinia store) to track collapse state
// .sidebar-collapsed .main-container {
//   margin-left: 64px; 
// }

.app-main {
  /* Navbar height */
  min-height: calc(100vh - 60px);
  width: 100%;
  position: relative;
  overflow: hidden;
  padding: 20px; 
}

.el-main {
    padding: 0; /* Remove default padding */
}

/* Transition for router view */
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