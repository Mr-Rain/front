<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import RouterTransition from '@/components/common/RouterTransition.vue'

const themeStore = useThemeStore()

onMounted(() => {
  // 初始化主题
  themeStore.initTheme()
})
</script>

<template>
  <router-transition>
    <RouterView />
  </router-transition>
</template>

<style scoped>
/* Remove or replace default styles */
/* Example: Add some global layout styles if needed */
/*
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
*/
</style>
