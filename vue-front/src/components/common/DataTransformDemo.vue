<template>
  <div class="data-transform-demo">
    <h2>数据转换演示</h2>
    
    <el-card shadow="hover" class="demo-card">
      <template #header>
        <div class="card-header">
          <span>原始数据</span>
        </div>
      </template>
      <pre>{{ JSON.stringify(originalData, null, 2) }}</pre>
    </el-card>
    
    <div class="transform-arrows">
      <el-icon class="transform-icon"><ArrowDown /></el-icon>
    </div>
    
    <el-card shadow="hover" class="demo-card">
      <template #header>
        <div class="card-header">
          <span>转换后数据 ({{ transformDirection }})</span>
          <el-button type="primary" size="small" @click="toggleTransform">切换转换方向</el-button>
        </div>
      </template>
      <pre>{{ JSON.stringify(transformedData, null, 2) }}</pre>
    </el-card>
    
    <div class="transform-controls">
      <el-button type="success" @click="sendRequest">发送测试请求</el-button>
      <el-button type="info" @click="resetData">重置数据</el-button>
    </div>
    
    <el-card v-if="responseData" shadow="hover" class="demo-card response-card">
      <template #header>
        <div class="card-header">
          <span>API 响应数据</span>
        </div>
      </template>
      <pre>{{ JSON.stringify(responseData, null, 2) }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { snakeToCamel, camelToSnake } from '@/utils/dataTransformer';
import request from '@/utils/request';

// 原始数据示例
const originalData = ref({
  userId: 1,
  firstName: 'John',
  lastName: 'Doe',
  companyInfo: {
    companyName: 'Acme Inc',
    companyAddress: {
      streetName: 'Main St',
      cityName: 'New York'
    }
  },
  tags: ['tag1', 'tag2']
});

// 转换方向
const transformToCamel = ref(false);
const transformDirection = computed(() => transformToCamel.value ? 'Snake → Camel' : 'Camel → Snake');

// 转换后的数据
const transformedData = computed(() => {
  return transformToCamel.value
    ? snakeToCamel(camelToSnake(originalData.value))
    : camelToSnake(originalData.value);
});

// 切换转换方向
const toggleTransform = () => {
  transformToCamel.value = !transformToCamel.value;
};

// API响应数据
const responseData = ref(null);
const loading = ref(false);

// 发送测试请求
const sendRequest = async () => {
  loading.value = true;
  try {
    // 使用转换后的数据发送请求
    const response = await request({
      url: '/api/test/transform',
      method: 'post',
      data: transformedData.value
    });
    
    responseData.value = response.data;
    ElMessage.success('请求发送成功');
  } catch (error) {
    console.error('Request failed:', error);
    ElMessage.error('请求发送失败');
  } finally {
    loading.value = false;
  }
};

// 重置数据
const resetData = () => {
  originalData.value = {
    userId: 1,
    firstName: 'John',
    lastName: 'Doe',
    companyInfo: {
      companyName: 'Acme Inc',
      companyAddress: {
        streetName: 'Main St',
        cityName: 'New York'
      }
    },
    tags: ['tag1', 'tag2']
  };
  responseData.value = null;
};
</script>

<style scoped>
.data-transform-demo {
  padding: 20px;
}

.demo-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transform-arrows {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.transform-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.transform-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.response-card {
  margin-top: 30px;
  border: 1px solid var(--el-color-success);
}

pre {
  background-color: var(--el-fill-color-light);
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  max-height: 300px;
}
</style>
