<template>
  <div class="job-list-page responsive-padding job-list-container">
    <el-card shadow="never" class="filter-card responsive-card">
      <!-- 移动端简化搜索按钮 -->
      <div class="mobile-search-toggle show-on-mobile">
        <el-button type="primary" @click="showFilterForm = !showFilterForm">
          {{ showFilterForm ? '隐藏筛选' : '显示筛选' }}
        </el-button>
      </div>

      <!-- 搜索表单 -->
      <el-form
        :inline="true"
        :model="listQuery"
        @submit.prevent="handleFilter"
        class="filter-form"
        :class="{ 'mobile-hidden': !showFilterForm && isMobileView }"
      >
        <el-form-item label="关键词">
          <el-input v-model="listQuery.keyword" placeholder="职位名称/公司" clearable @clear="handleFilter"/>
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="listQuery.location" placeholder="城市" clearable @clear="handleFilter"/>
        </el-form-item>
        <el-form-item label="职位类型">
          <el-select v-model="listQuery.job_type" placeholder="选择类型" clearable @change="handleFilter">
            <el-option label="全职" value="全职"></el-option>
            <el-option label="兼职" value="兼职"></el-option>
            <el-option label="实习" value="实习"></el-option>
          </el-select>
        </el-form-item>
        <!-- Add more filters as needed (experience, education, salary) -->
        <el-form-item>
          <el-button type="primary" @click="handleFilter" :icon="Search">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

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
import { ref, reactive, onMounted, computed } from 'vue';
import { useJobStore } from '@/stores/job';
import JobCard from '@/components/common/JobCard.vue';
import Pagination from '@/components/common/Pagination.vue';
import type { JobListParams } from '@/types/job';
import { Search } from '@element-plus/icons-vue';

const jobStore = useJobStore();

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
  job_type: undefined,
  // Initialize other filters
});

// 计算属性：是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return !!listQuery.keyword || !!listQuery.location || !!listQuery.job_type;
});

// 获取数据
const fetchData = () => {
  jobStore.fetchJobList(listQuery);
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
  listQuery.job_type = undefined;
  // 重置其他筛选条件

  // 重新获取数据
  handleFilter();
};

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
import { onUnmounted } from 'vue';
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

.filter-card {
  margin-bottom: 20px;
}

/* Make form items wrap nicely */
.el-form--inline .el-form-item {
  margin-right: 10px;
  margin-bottom: 10px;
}

.list-card {
  margin-bottom: 20px;
}

.list-pagination {
  margin-top: 20px;
}

/* 移动端搜索切换按钮 */
.mobile-search-toggle {
  display: none;
  margin-bottom: 10px;
  text-align: center;
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

  .filter-card {
    margin-bottom: 15px;
  }

  .mobile-search-toggle {
    display: block;
  }

  .mobile-hidden {
    display: none;
  }

  /* 调整表单布局 */
  .filter-form {
    display: flex;
    flex-direction: column;
  }

  .filter-form .el-form-item {
    margin-right: 0;
    width: 100%;
  }

  .filter-form .el-input,
  .filter-form .el-select {
    width: 100%;
  }

  /* 搜索按钮占满宽度 */
  .filter-form .el-form-item:last-child .el-button {
    width: 100%;
  }

  /* 搜索结果摘要调整 */
  .search-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}

/* 平板设备适配 */
@media (min-width: 577px) and (max-width: 992px) {
  .job-list-page {
    padding: 15px;
  }

  .filter-card {
    margin-bottom: 15px;
  }

  /* 调整表单布局 */
  .el-form--inline .el-form-item {
    margin-right: 8px;
  }
}
</style>