<template>
  <div class="common-page-container">
    <el-result
      icon="warning"
      title="401 - 无权限访问"
      sub-title="抱歉，您没有权限访问此页面。"
    >
      <template #extra>
        <el-button type="primary" @click="goBack">返回上一页</el-button>
        <el-button @click="goHome">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.go(-1);
};

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