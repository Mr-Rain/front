<template>
  <div class="breadcrumb-container">
    <el-icon class="breadcrumb-icon"><Location /></el-icon>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index" :to="item.path">
        {{ item.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Location } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

// 定义面包屑项的接口
interface BreadcrumbItem {
  title: string;
  path: string;
}

// 路径映射表，将路径映射到中文标题
const pathMap: Record<string, string> = {
  'student': '学生端',
  'company': '企业端',
  'admin': '管理端',
  'jobs': '职位列表',
  'companies': '企业列表',
  'dashboard': '仪表盘',
  'profile': '个人信息',
  'resume': '我的简历',
  'applications': '我的申请',
  'recommendations': '智能推荐',
  'job-manage': '职位管理',
  'application-manage': '申请管理',
  'users': '用户管理',
  'companies-audit': '企业审核'
};

// 计算面包屑数据
const breadcrumbs = computed(() => {
  const result: BreadcrumbItem[] = [];

  // 添加首页
  result.push({
    title: '首页',
    path: '/'
  });

  // 解析当前路径
  const pathSegments = route.path.split('/').filter(Boolean);

  // 构建面包屑
  let currentPath = '';

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // 获取标题，如果映射表中没有则使用路径名
    const title = pathMap[segment] || segment;

    // 添加到面包屑
    result.push({
      title,
      path: currentPath
    });
  });

  return result;
});

// 监听路由变化，更新面包屑
watch(() => route.path, () => {
  // 面包屑会自动通过计算属性更新
}, { immediate: true });
</script>

<style scoped>
.breadcrumb-container {
  padding: 8px 0;
  margin-bottom: 16px;
  user-select: none; /* 禁用文本选择 */
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  font-size: 14px;
  display: flex;
  align-items: center;
  color: #606266;
  background-color: transparent;
}

.breadcrumb-icon {
  margin-right: 8px;
  color: #409EFF;
  font-size: 16px;
}

:deep(.el-breadcrumb__item) {
  display: inline-flex;
  align-items: center;
}

:deep(.el-breadcrumb__inner) {
  color: #606266;
  transition: color 0.3s;
}

:deep(.el-breadcrumb__inner.is-link) {
  color: #409EFF;
  font-weight: normal;
}

:deep(.el-breadcrumb__inner.is-link:hover) {
  color: #66b1ff;
  text-decoration: underline;
}

:deep(.el-breadcrumb__separator) {
  margin: 0 8px;
  color: #C0C4CC;
}

/* 移动端适配 */
@media (max-width: 576px) {
  .breadcrumb-container {
    font-size: 12px;
    padding: 6px 0;
    margin-bottom: 12px;
  }

  :deep(.el-breadcrumb__separator) {
    margin: 0 4px;
  }
}
</style>
