<template>
  <div class="search-results-page">
    <!-- 搜索区域 -->
    <div class="search-area">
      <GlobalSearch
        :initial-keyword="searchQuery"
        :initial-type="searchType"
        :initial-filters="currentFilters"
        @search="handleSearch"
        @type-change="handleTypeChange"
      />
    </div>

    <!-- 搜索结果 -->
    <div class="search-results-container">
      <!-- 搜索结果标题 -->
      <div class="results-header">
        <h2 class="results-title">
          <template v-if="searchStore.searchResults.total > 0">
            找到 {{ searchStore.searchResults.total }} 条与 "{{ searchQuery }}" 相关的结果
          </template>
          <template v-else-if="searchStore.loading">
            正在搜索 "{{ searchQuery }}" 的结果...
          </template>
          <template v-else>
            未找到与 "{{ searchQuery }}" 相关的结果
          </template>
        </h2>

        <!-- 搜索类型切换 -->
        <div class="search-type-tabs">
          <el-tabs v-model="searchType" @tab-change="handleTypeChange">
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="职位" name="job" />
            <el-tab-pane label="企业" name="company" />
          </el-tabs>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="searchStore.loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- 空结果提示 -->
      <el-empty
        v-else-if="!hasResults"
        description="未找到相关结果，请尝试其他关键词或筛选条件"
      >
        <template #image>
          <img src="@/assets/images/empty-search.svg" alt="No results" class="empty-image" />
        </template>
        <el-button @click="resetSearch">清空搜索条件</el-button>
      </el-empty>

      <!-- 搜索结果列表 -->
      <div v-else class="results-list">
        <!-- 职位搜索结果 -->
        <template v-if="searchType === 'all' || searchType === 'job'">
          <div v-if="searchStore.searchResults.jobs && searchStore.searchResults.jobs.length > 0" class="result-section">
            <h3 v-if="searchType === 'all'" class="section-title">职位 ({{ searchStore.searchResults.jobs.length }})</h3>

            <div class="job-results">
              <JobCard
                v-for="job in searchStore.searchResults.jobs"
                :key="job.id"
                :job="job"
                class="job-card"
              />
            </div>
          </div>
        </template>

        <!-- 企业搜索结果 -->
        <template v-if="searchType === 'all' || searchType === 'company'">
          <div v-if="searchStore.searchResults.companies && searchStore.searchResults.companies.length > 0" class="result-section">
            <h3 v-if="searchType === 'all'" class="section-title">企业 ({{ searchStore.searchResults.companies.length }})</h3>

            <div class="company-results">
              <CompanyCard
                v-for="company in searchStore.searchResults.companies"
                :key="company.id"
                :company="company"
                class="company-card"
              />
            </div>
          </div>
        </template>
      </div>

      <!-- 分页 -->
      <div v-if="hasResults && searchStore.searchResults.total > searchStore.searchParams.pageSize" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="searchStore.searchResults.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSearchStore } from '@/stores/search';
import type { SearchType } from '@/api/search';
import GlobalSearch from '@/components/common/GlobalSearch.vue';
import JobCard from '@/components/common/JobCard.vue';
import CompanyCard from '@/components/common/CompanyCard.vue';

const route = useRoute();
const router = useRouter();
const searchStore = useSearchStore();

// 搜索参数
const searchQuery = ref('');
const searchType = ref<SearchType>('all');
const currentPage = ref(1);
const pageSize = ref(10);
const currentFilters = ref<Record<string, any>>({});

// 计算属性：是否有搜索结果
const hasResults = computed(() => {
  const { jobs = [], companies = [] } = searchStore.searchResults;

  if (searchType.value === 'all') {
    return jobs.length > 0 || companies.length > 0;
  } else if (searchType.value === 'job') {
    return jobs.length > 0;
  } else if (searchType.value === 'company') {
    return companies.length > 0;
  }

  return false;
});

// 从路由参数中获取搜索条件
const getSearchParamsFromRoute = () => {
  const query = route.query;

  searchQuery.value = query.q as string || '';
  searchType.value = (query.type as SearchType) || 'all';
  currentPage.value = parseInt(query.page as string) || 1;
  pageSize.value = parseInt(query.pageSize as string) || 10;

  // 提取高级筛选条件
  const filters: Record<string, any> = {};

  ['location', 'salary', 'experience', 'education', 'industry', 'size'].forEach(key => {
    if (query[key]) {
      filters[key] = query[key];
    }
  });

  // 更新当前筛选条件
  currentFilters.value = filters;

  return {
    keyword: searchQuery.value,
    type: searchType.value,
    page: currentPage.value,
    pageSize: pageSize.value,
    filters
  };
};

// 执行搜索
const performSearch = () => {
  if (!searchQuery.value) return;

  const params = getSearchParamsFromRoute();
  searchStore.performSearch(params);
};

// 处理搜索
const handleSearch = (params: any) => {
  searchQuery.value = params.keyword;
  searchType.value = params.type;
  currentPage.value = 1;

  // 更新筛选条件
  if (params.filters) {
    currentFilters.value = { ...params.filters };
  }

  updateRouteQuery();
  performSearch();
};

// 处理搜索类型变更
const handleTypeChange = (type: SearchType) => {
  searchType.value = type;
  currentPage.value = 1;

  updateRouteQuery();
  performSearch();
};

// 处理页码变更
const handleCurrentChange = (page: number) => {
  currentPage.value = page;

  updateRouteQuery();
  performSearch();
};

// 处理每页数量变更
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;

  updateRouteQuery();
  performSearch();
};

// 更新路由查询参数
const updateRouteQuery = () => {
  const query: Record<string, string> = {
    q: searchQuery.value,
    type: searchType.value,
    page: currentPage.value.toString(),
    pageSize: pageSize.value.toString()
  };

  // 添加高级筛选条件
  if (currentFilters.value) {
    Object.entries(currentFilters.value).forEach(([key, value]) => {
      if (value) {
        query[key] = value as string;
      }
    });
  }

  router.push({ path: '/search', query });
};

// 重置搜索
const resetSearch = () => {
  searchStore.resetSearchParams();
  searchStore.resetFilters();
  currentFilters.value = {};

  router.push({ path: '/search' });
};

// 监听路由变化
watch(
  () => route.query,
  () => {
    const params = getSearchParamsFromRoute();

    // 只有当搜索关键词存在时才执行搜索
    if (params.keyword) {
      performSearch();
    }
  },
  { immediate: true }
);

// 组件挂载时执行搜索
onMounted(() => {
  const params = getSearchParamsFromRoute();

  // 只有当搜索关键词存在时才执行搜索
  if (params.keyword) {
    performSearch();
  }
});
</script>

<style scoped>
.search-results-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-area {
  margin-bottom: 30px;
}

.search-results-container {
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.results-header {
  margin-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 15px;
}

.results-title {
  font-size: 18px;
  color: var(--el-text-color-primary);
  margin: 0 0 15px 0;
}

.search-type-tabs {
  margin-top: 15px;
}

:deep(.el-tabs__nav) {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-tabs__item) {
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
}

.loading-container {
  padding: 20px 0;
}

.empty-image {
  width: 200px;
  height: 200px;
}

.result-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 16px;
  color: var(--el-text-color-primary);
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.job-results,
.company-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.job-card,
.company-card {
  height: 100%;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-results-page {
    padding: 10px;
  }

  .search-results-container {
    padding: 15px;
  }

  .job-results,
  .company-results {
    grid-template-columns: 1fr;
  }
}
</style>
