<template>
  <div class="common-page-container">
    <el-result
      icon="error"
      title="404 - 页面未找到"
      sub-title="抱歉，您访问的页面不存在。"
    >
      <template #extra>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.common-page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style> 