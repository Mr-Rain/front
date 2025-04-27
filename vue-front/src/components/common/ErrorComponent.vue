<template>
  <div class="error-container">
    <el-result
      icon="error"
      title="组件加载失败"
      sub-title="无法加载请求的组件，请检查控制台获取详细错误信息。"
    >
      <template #extra>
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="reload">刷新页面</el-button>
      </template>
    </el-result>
    
    <div v-if="errorDetails" class="error-details">
      <h3>错误详情：</h3>
      <pre>{{ errorDetails }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const errorDetails = ref('');

// 获取控制台最近的错误信息
onMounted(() => {
  // 重写 console.error 以捕获错误信息
  const originalError = console.error;
  console.error = (...args) => {
    // 调用原始的 console.error
    originalError.apply(console, args);
    
    // 保存错误信息
    errorDetails.value = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join('\n');
  };
  
  // 在组件卸载时恢复原始的 console.error
  return () => {
    console.error = originalError;
  };
});

// 导航到首页
const goHome = () => {
  router.push('/');
};

// 刷新页面
const reload = () => {
  window.location.reload();
};
</script>

<style scoped>
.error-container {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.error-details {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #f56c6c;
}

.error-details h3 {
  margin-top: 0;
  color: #f56c6c;
}

.error-details pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
  background-color: #f1f1f1;
  padding: 10px;
  border-radius: 4px;
}
</style>
