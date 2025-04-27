<template>
  <div class="api-test-container">
    <h2>API测试</h2>
    <div class="test-controls">
      <el-button type="primary" @click="testGetUserInfo" :loading="loading">测试获取用户信息</el-button>
      <el-button type="success" @click="testGetPermissions" :loading="loading">测试获取权限</el-button>
      <el-button type="warning" @click="testCustomRequest" :loading="loading">测试自定义请求</el-button>
    </div>
    
    <div v-if="result" class="result-container">
      <h3>测试结果：</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
    
    <div v-if="error" class="error-container">
      <h3>错误信息：</h3>
      <pre>{{ JSON.stringify(error, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getUserInfo } from '@/api/user';
import { getUserPermissions } from '@/api/permission';
import request from '@/utils/request';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const result = ref(null);
const error = ref(null);

// 测试获取用户信息
const testGetUserInfo = async () => {
  loading.value = true;
  result.value = null;
  error.value = null;
  
  try {
    console.log('Testing getUserInfo API...');
    const response = await getUserInfo();
    console.log('getUserInfo response:', response);
    result.value = response;
    ElMessage.success('获取用户信息成功');
  } catch (err) {
    console.error('getUserInfo error:', err);
    error.value = err;
    ElMessage.error('获取用户信息失败');
  } finally {
    loading.value = false;
  }
};

// 测试获取权限
const testGetPermissions = async () => {
  loading.value = true;
  result.value = null;
  error.value = null;
  
  try {
    console.log('Testing getUserPermissions API...');
    const response = await getUserPermissions();
    console.log('getUserPermissions response:', response);
    result.value = response;
    ElMessage.success('获取权限信息成功');
  } catch (err) {
    console.error('getUserPermissions error:', err);
    error.value = err;
    ElMessage.error('获取权限信息失败');
  } finally {
    loading.value = false;
  }
};

// 测试自定义请求
const testCustomRequest = async () => {
  loading.value = true;
  result.value = null;
  error.value = null;
  
  try {
    console.log('Testing custom request...');
    // 这里可以替换为你想测试的任何API端点
    const response = await request({
      url: '/api/users/me',
      method: 'get'
    });
    console.log('Custom request response:', response);
    result.value = response;
    ElMessage.success('自定义请求成功');
  } catch (err) {
    console.error('Custom request error:', err);
    error.value = err;
    ElMessage.error('自定义请求失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.api-test-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.result-container, .error-container {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
}

.result-container {
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
}

.error-container {
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #f8f8f8;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  max-height: 400px;
}
</style>
