<template>
  <div class="job-list-page responsive-padding job-list-container">
    <!-- 添加面包屑导航 -->
    <Breadcrumb />

    <div class="page-header">
      <div class="title-section">
        <el-button
          v-if="showBackButton"
          @click="goBack"
          type="primary"
          plain
          class="back-button"
        >
          <el-icon class="back-icon"><ArrowLeft /></el-icon>
          <span class="back-text">返回</span>
        </el-button>
        <h2 class="page-title">职位列表</h2>
      </div>
      <div class="header-actions">
        <el-button
          type="primary"
          plain
          size="small"
          icon="Filter"
          class="filter-button show-on-mobile"
          @click="showFilterForm = !showFilterForm"
        >
          {{ showFilterForm ? '隐藏筛选' : '筛选' }}
        </el-button>
      </div>
    </div>
    <el-card shadow="hover" class="filter-card responsive-card">
      <!-- 搜索表单 -->
      <el-form
        :inline="true"
        :model="listQuery"
        @submit.prevent="handleFilter"
        class="filter-form"
        :class="{ 'mobile-hidden': !showFilterForm && isMobileView }"
      >
        <div class="search-form-container">
          <div class="search-inputs-group">
            <el-form-item label="关键词" class="search-form-item">
              <el-input
                v-model="listQuery.keyword"
                placeholder="职位名称/公司"
                clearable
                @clear="handleFilter"
                prefix-icon="Search"
              />
            </el-form-item>
            <el-form-item label="地点" class="search-form-item">
              <el-input
                v-model="listQuery.location"
                placeholder="城市"
                clearable
                @clear="handleFilter"
                prefix-icon="Location"
              />
            </el-form-item>
            <el-form-item label="职位类型" class="search-form-item">
              <el-select
                v-model="listQuery.jobType"
                placeholder="选择类型"
                clearable
                @change="handleFilter"
                class="type-select"
              >
                <el-option label="全职" value="全职"></el-option>
                <el-option label="兼职" value="兼职"></el-option>
                <el-option label="实习" value="实习"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="职位状态" class="search-form-item">
              <el-select
                v-model="listQuery.status"
                placeholder="职位状态"
                @change="handleFilter"
                class="type-select"
              >
                <el-option label="开放中" value="open"></el-option>
                <el-option label="已关闭" value="closed"></el-option>
                <el-option label="所有状态" value="all"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="search-button-group">
            <el-form-item class="search-button-item">
              <el-button type="primary" @click="handleFilter" :icon="Search" class="search-button">搜索</el-button>
            </el-form-item>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 添加调试信息 -->
    <!-- <el-card v-if="showDebug" shadow="hover" class="debug-card responsive-card">
      <div class="debug-info">
        <p><strong>路由信息：</strong> {{ route.path }} ({{ route.name }})</p>
        <p><strong>查询参数：</strong> {{ JSON.stringify(route.query) }}</p>
        <p><strong>加载状态：</strong> {{ jobStore.loadingList ? '加载中' : '已加载' }}</p>
        <p><strong>职位列表：</strong> {{ jobStore.jobList.length > 0 ? '已获取' : '未获取' }}</p>
        <p><strong>职位总数：</strong> {{ jobStore.jobTotal }}</p>
        <el-button size="small" @click="forceRefreshData">强制刷新数据</el-button>
        <el-button size="small" @click="showDebug = false">隐藏调试信息</el-button>
      </div>
    </el-card> -->

    <el-card shadow="never" class="list-card responsive-card" v-loading="jobStore.loadingList">
      <!-- 搜索结果摘要 -->
      <div class="search-summary" v-if="jobStore.jobTotal > 0">
        <span>找到 <strong>{{ jobStore.jobTotal }}</strong> 个职位</span>
        <el-button v-if="hasActiveFilters" link type="primary" @click="clearFilters">清除筛选</el-button>
      </div>

      <!-- 职位列表 -->
      <template v-if="jobStore.jobList.length > 0">
        <JobCard v-for="job in jobStore.jobList" :key="job.id" :job="job" />
      </template>
      <el-empty v-else description="未找到相关职位"></el-empty>

      <!-- 分页器 -->
      <Pagination
        v-if="jobStore.jobTotal > 0"
        :total="jobStore.jobTotal"
        v-model:page="listQuery.page"
        v-model:limit="listQuery.pageSize"
        @pagination="fetchData"
        class="list-pagination"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useJobStore } from '@/stores/job';
import JobCard from '@/components/common/JobCard.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/common/Breadcrumb.vue';
import type { JobListParams } from '@/types/job';
import { Search, ArrowLeft } from '@element-plus/icons-vue';
import { onUnmounted } from 'vue';

const router = useRouter();
const route = useRoute();
const jobStore = useJobStore();
const showDebug = ref(true); // 默认显示调试信息

// 强制刷新数据
const forceRefreshData = () => {
  console.log('强制刷新职位列表数据');
  jobStore.clearJobList();
  fetchData();
};

// 判断是否显示返回按钮（只在/jobs路径下显示，在/student/jobs下不显示）
const showBackButton = computed(() => {
  return route.path === '/jobs';
});

// 移动端适配相关变量
// 是否显示筛选表单（移动端默认隐藏）
const showFilterForm = ref(window.innerWidth > 576);
// 是否为移动端视图
const isMobileView = ref(window.innerWidth <= 576);

// 监听窗口大小变化
const handleResize = () => {
  isMobileView.value = window.innerWidth <= 576;
  // 如果不是移动端，始终显示筛选表单
  if (!isMobileView.value) {
    showFilterForm.value = true;
  }
};

// 查询参数
const listQuery = reactive<JobListParams>({
  page: 1,
  pageSize: 10,
  keyword: '',
  location: '',
  jobType: undefined,
  // 默认获取开放中的职位
  status: 'open'
});

// 计算属性：是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return !!listQuery.keyword || !!listQuery.location || !!listQuery.jobType || listQuery.status !== 'open';
});

// 获取数据
const fetchData = () => {
  // 创建一个新的查询参数对象
  const params = { ...listQuery };

  // 处理职位状态参数
  if (params.status === 'all') {
    // 如果选择了"所有状态"，则传递空字符串作为status参数
    params.status = '';
    params._allStatus = true; // 添加内部标记，表示这是"所有状态"请求
    console.log('Selected "all" status, set status to empty string, added _allStatus flag');
  } else if (params.status) {
    // 确保status参数是有效的JobStatus类型
    console.log(`Selected specific status: ${params.status}`);
    // 确保不带有_allStatus标记
    delete params._allStatus;
  }

  console.log('Fetching jobs with params:', params);
  jobStore.fetchJobList(params);
};

// 处理筛选
const handleFilter = () => {
  listQuery.page = 1; // Reset page number on filter change
  fetchData();
};

// 清除筛选条件
const clearFilters = () => {
  listQuery.keyword = '';
  listQuery.location = '';
  listQuery.jobType = undefined;
  // 重置职位状态为"开放中"
  listQuery.status = 'open';

  // 重新获取数据
  handleFilter();
};

// 返回上一页
const goBack = () => {
  router.go(-1); // 返回上一页
  // 如果没有上一页，则返回首页
  setTimeout(() => {
    if (router.currentRoute.value.fullPath === '/jobs') {
      router.push('/');
    }
  }, 100);
};

// 监听路由变化，实现页面刷新
watch(route, (to, from) => {
  console.log('Route changed:', from.path, '->', to.path);
  console.log('Route query params:', to.query);

  // 如果路由参数中有时间戳，说明需要刷新数据
  if (to.query.t) {
    console.log('Time parameter detected, refreshing data...');

    // 清除之前的职位列表/详情，加载新数据
    jobStore.clearJobList();
    jobStore.clearCurrentJob();
    fetchData();
  }
});

onMounted(() => {
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
  handleResize(); // 初始化时调用一次

  // 清除之前的职位列表/详情，加载新数据
  jobStore.clearJobList();
  jobStore.clearCurrentJob();
  fetchData();
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.job-list-container {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.job-list-page {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  position: relative;
}

.title-section {
  display: flex;
  align-items: center;
}

.back-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  height: 32px;
  box-sizing: border-box;
  margin-right: 15px;
}

.back-icon {
  margin-right: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  height: 14px;
}

.back-text {
  font-size: 14px;
  line-height: 14px;
  height: 14px;
  display: inline-block;
  vertical-align: middle;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #303133;
  margin: 0;
  padding-left: 12px;
  position: relative;
}

.page-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 4px;
  background: var(--el-color-primary);
  border-radius: 2px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
  transition: all 0.3s;
  padding: 20px;
}

/* 搜索表单容器 */
.search-form-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 15px;
}

.search-inputs-group {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  gap: 15px;
}

.search-form-item {
  margin-right: 0 !important;
  margin-bottom: 0 !important;
  flex: 1;
  min-width: 200px;
}

.search-button-group {
  display: flex;
  align-items: flex-end;
}

.search-button-item {
  margin-right: 0 !important;
  margin-bottom: 0 !important;
}

.search-button {
  min-width: 100px;
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
}

.type-select {
  width: 100%;
}

/* Make form items wrap nicely */
.el-form--inline .el-form-item {
  margin-right: 10px;
  margin-bottom: 10px;
}

.list-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.list-pagination {
  margin-top: 20px;
  text-align: center;
}

/* 筛选按钮 - 移动端显示 */
.filter-button {
  display: none;
}

/* 搜索结果摘要 */
.search-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

/* 移动端适配 */
@media (max-width: 576px) {
  .job-list-page {
    padding: 10px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .title-section {
    flex-wrap: wrap;
    gap: 10px;
  }

  .back-button {
    margin-right: 10px;
  }

  .filter-card {
    margin-bottom: 15px;
  }

  .filter-button {
    display: flex;
  }

  .mobile-hidden {
    display: none;
  }

  /* 调试信息样式 */
.debug-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.debug-info {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
  font-size: 14px;
}

.debug-info p {
  margin: 5px 0;
}

/* 调整表单布局 */
  .filter-form {
    display: flex;
    flex-direction: column;
  }

  .search-form-container {
    flex-direction: column;
    gap: 10px;
  }

  .search-inputs-group {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }

  .search-form-item {
    width: 100%;
  }

  .search-button-group {
    width: 100%;
  }

  .search-button {
    width: 100%;
  }

  .filter-form .el-form-item {
    margin-right: 0;
    width: 100%;
  }

  .filter-form .el-input,
  .filter-form .el-select {
    width: 100%;
  }
}

/* 响应式卡片 */
.responsive-card {
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important;
}

.responsive-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1) !important;
}

/* 响应式边距 */
@media (max-width: 768px) {
  .responsive-padding {
    padding: 15px;
  }
}

@media (max-width: 576px) {
  .responsive-padding {
    padding: 10px;
  }

  .show-on-mobile {
    display: block !important;
  }
}
</style>