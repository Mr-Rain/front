<template>
  <div class="search-results-page">
    <!-- 搜索区域 - 增强设计 -->
    <div class="search-area">
      <div class="search-hero">
        <div class="search-hero-content">
          <h1 class="search-hero-title">
            <el-icon class="hero-icon"><Search /></el-icon>
            智能搜索
          </h1>
          <p class="search-hero-subtitle">发现最适合您的职位和企业</p>
        </div>
        <div class="search-hero-decoration">
          <div class="decoration-circle circle-1"></div>
          <div class="decoration-circle circle-2"></div>
          <div class="decoration-circle circle-3"></div>
        </div>
      </div>

      <div class="search-input-wrapper">
        <GlobalSearch
          :initial-keyword="searchQuery"
          :initial-type="searchType"
          :initial-filters="currentFilters"
          @search="handleSearch"
          @type-change="handleTypeChange"
        />
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results-container">
      <!-- 搜索结果标题 - 重新设计 -->
      <div class="results-header">
        <div class="results-info">
          <div class="results-title-wrapper">
            <h2 class="results-title">
              <template v-if="searchStore.searchResults.total > 0">
                <span class="results-count">{{ searchStore.searchResults.total }}</span>
                条与
                <span class="search-keyword">"{{ searchQuery }}"</span>
                相关的结果
              </template>
              <template v-else-if="searchStore.loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                正在搜索 "{{ searchQuery }}" 的结果...
              </template>
              <template v-else>
                <el-icon class="no-results-icon"><DocumentRemove /></el-icon>
                未找到与 "{{ searchQuery }}" 相关的结果
              </template>
            </h2>
            <div class="search-stats" v-if="searchStore.searchResults.total > 0">
              <span class="stat-item">
                <el-icon><Timer /></el-icon>
                搜索用时 {{ searchTime }}ms
              </span>
              <span class="stat-item">
                <el-icon><Location /></el-icon>
                {{ getLocationStats() }}
              </span>
            </div>
          </div>
        </div>

        <!-- 搜索类型切换 - 现代化标签页 -->
        <div class="search-type-tabs">
          <div class="modern-tabs">
            <button
              v-for="tab in searchTabs"
              :key="tab.value"
              :class="['tab-button', { active: searchType === tab.value }]"
              @click="handleTypeChange(tab.value)"
            >
              <el-icon>
                <component :is="tab.icon" />
              </el-icon>
              <span>{{ tab.label }}</span>
              <span class="tab-count" v-if="getTabCount(tab.value) > 0">
                {{ getTabCount(tab.value) }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- 加载状态 - 美化加载动画 -->
      <div v-if="searchStore.loading" class="loading-container">
        <div class="loading-content">
          <div class="loading-animation">
            <div class="loading-spinner">
              <div class="spinner-ring"></div>
              <div class="spinner-ring"></div>
              <div class="spinner-ring"></div>
            </div>
            <p class="loading-text">正在为您搜索最佳结果...</p>
          </div>
          <el-skeleton :rows="8" animated class="loading-skeleton" />
        </div>
      </div>

      <!-- 空结果提示 - 重新设计 -->
      <div v-else-if="!hasResults" class="empty-results">
        <div class="empty-content">
          <div class="empty-illustration">
            <el-icon class="empty-icon"><Search /></el-icon>
            <div class="empty-circles">
              <div class="empty-circle circle-1"></div>
              <div class="empty-circle circle-2"></div>
              <div class="empty-circle circle-3"></div>
            </div>
          </div>
          <h3 class="empty-title">未找到相关结果</h3>
          <p class="empty-description">
            很抱歉，没有找到与 "<span class="empty-keyword">{{ searchQuery }}</span>" 相关的结果
          </p>
          <div class="empty-suggestions">
            <h4>建议您：</h4>
            <ul>
              <li>检查关键词拼写是否正确</li>
              <li>尝试使用更通用的关键词</li>
              <li>减少筛选条件</li>
              <li>尝试搜索相关的职位或企业</li>
            </ul>
          </div>
          <div class="empty-actions">
            <el-button type="primary" @click="resetSearch">
              <el-icon><Refresh /></el-icon>
              清空搜索条件
            </el-button>
            <el-button @click="goToRecommendations">
              <el-icon><Star /></el-icon>
              查看推荐
            </el-button>
          </div>
        </div>
      </div>

      <!-- 搜索结果列表 - 增强设计 -->
      <div v-else class="results-list">
        <!-- 职位搜索结果 -->
        <template v-if="searchType === 'all' || searchType === 'job'">
          <div v-if="searchStore.searchResults.jobs && searchStore.searchResults.jobs.length > 0" class="result-section">
            <div v-if="searchType === 'all'" class="section-header">
              <h3 class="section-title">
                <el-icon class="section-icon"><Briefcase /></el-icon>
                职位推荐
                <span class="section-count">({{ searchStore.searchResults.jobs.length }})</span>
              </h3>
              <div class="section-actions">
                <el-button size="small" text @click="viewAllJobs">
                  查看全部
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>

            <div class="job-results modern-grid">
              <div
                v-for="(job, index) in searchStore.searchResults.jobs"
                :key="job.id"
                class="result-card-wrapper"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <JobCard :job="job" class="job-card enhanced-card" />
              </div>
            </div>
          </div>
        </template>

        <!-- 企业搜索结果 -->
        <template v-if="searchType === 'all' || searchType === 'company'">
          <div v-if="searchStore.searchResults.companies && searchStore.searchResults.companies.length > 0" class="result-section">
            <div v-if="searchType === 'all'" class="section-header">
              <h3 class="section-title">
                <el-icon class="section-icon"><OfficeBuilding /></el-icon>
                企业推荐
                <span class="section-count">({{ searchStore.searchResults.companies.length }})</span>
              </h3>
              <div class="section-actions">
                <el-button size="small" text @click="viewAllCompanies">
                  查看全部
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>

            <div class="company-results modern-grid">
              <div
                v-for="(company, index) in searchStore.searchResults.companies"
                :key="company.id"
                class="result-card-wrapper"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <CompanyCard :company="company" class="company-card enhanced-card" />
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 分页 - 现代化设计 -->
      <div v-if="hasResults && searchStore.searchResults.total > searchStore.searchParams.pageSize" class="pagination-container">
        <div class="pagination-info">
          <span class="pagination-text">
            显示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, searchStore.searchResults.total) }} 条，
            共 {{ searchStore.searchResults.total }} 条结果
          </span>
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="prev, pager, next, sizes, jumper"
          :total="searchStore.searchResults.total"
          :background="true"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="modern-pagination"
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
import {
  Search,
  Loading,
  DocumentRemove,
  Timer,
  Location,
  Refresh,
  Star,
  Briefcase,
  OfficeBuilding,
  ArrowRight,
  Grid,
  List
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const searchStore = useSearchStore();

// 搜索参数
const searchQuery = ref('');
const searchType = ref<SearchType>('all');
const currentPage = ref(1);
const pageSize = ref(10);
const currentFilters = ref<Record<string, any>>({});

// 新增响应式数据
const searchTime = ref(0);
const searchStartTime = ref(0);

// 搜索标签页配置
const searchTabs = ref([
  { value: 'all', label: '全部', icon: Grid },
  { value: 'job', label: '职位', icon: Briefcase },
  { value: 'company', label: '企业', icon: OfficeBuilding }
]);

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

  searchStartTime.value = Date.now();
  const params = getSearchParamsFromRoute();

  searchStore.performSearch(params).then(() => {
    searchTime.value = Date.now() - searchStartTime.value;
  });
};

// 获取标签页数量
const getTabCount = (type: SearchType) => {
  const { jobs = [], companies = [] } = searchStore.searchResults;

  switch (type) {
    case 'all':
      return jobs.length + companies.length;
    case 'job':
      return jobs.length;
    case 'company':
      return companies.length;
    default:
      return 0;
  }
};

// 获取地区统计信息
const getLocationStats = () => {
  const { jobs = [] } = searchStore.searchResults;
  const locations = jobs.map(job => job.location).filter(Boolean);
  const uniqueLocations = [...new Set(locations)];

  if (uniqueLocations.length === 0) return '全国';
  if (uniqueLocations.length === 1) return uniqueLocations[0];
  return `${uniqueLocations.length}个城市`;
};

// 查看全部职位
const viewAllJobs = () => {
  handleTypeChange('job');
};

// 查看全部企业
const viewAllCompanies = () => {
  handleTypeChange('company');
};

// 前往推荐页面
const goToRecommendations = () => {
  router.push('/student/jobs');
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
/* 主容器样式 */
.search-results-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  margin: 0;
}

/* 搜索区域样式 */
.search-area {
  position: relative;
  padding: 60px 20px 40px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  overflow: hidden;
}

/* 搜索英雄区域 */
.search-hero {
  position: relative;
  text-align: center;
  margin-bottom: 40px;
  z-index: 2;
}

.search-hero-content {
  position: relative;
  z-index: 3;
}

.search-hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 16px 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.hero-icon {
  font-size: 3.5rem;
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.search-hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 400;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

/* 装饰性圆圈 */
.search-hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 80px;
  height: 80px;
  top: 20%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 60px;
  height: 60px;
  bottom: 30%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* 搜索输入包装器 */
.search-input-wrapper {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 3;
}

/* 搜索结果容器 */
.search-results-container {
  background: #f8fafc;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  margin-top: -20px;
  position: relative;
  z-index: 2;
  min-height: 60vh;
}

/* 结果头部 */
.results-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
}

.results-info {
  margin-bottom: 24px;
}

.results-title-wrapper {
  text-align: center;
}

.results-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.results-count {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.search-keyword {
  color: #3b82f6;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.1));
  padding: 2px 8px;
  border-radius: 8px;
}

.loading-icon, .no-results-icon {
  font-size: 1.5rem;
  color: #6b7280;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 搜索统计信息 */
.search-stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 0.875rem;
  background: rgba(148, 163, 184, 0.1);
  padding: 6px 12px;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(148, 163, 184, 0.2);
  transform: translateY(-1px);
}

/* 现代化标签页 */
.modern-tabs {
  display: flex;
  background: white;
  border-radius: 16px;
  padding: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  gap: 4px;
  justify-content: center;
  max-width: 400px;
  margin: 0 auto;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #64748b;
  position: relative;
  overflow: hidden;
}

.tab-button.active {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.tab-button:hover:not(.active) {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.tab-button.active .tab-count {
  background: rgba(255, 255, 255, 0.3);
}

/* 加载状态 */
.loading-container {
  padding: 40px 0;
  text-align: center;
}

.loading-content {
  max-width: 400px;
  margin: 0 auto;
}

.loading-animation {
  margin-bottom: 32px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.spinner-ring {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  animation: bounce 1.4s ease-in-out infinite both;
}

.spinner-ring:nth-child(1) { animation-delay: -0.32s; }
.spinner-ring:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.loading-text {
  color: #64748b;
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0;
}

.loading-skeleton {
  margin-top: 24px;
}

/* 空结果状态 */
.empty-results {
  padding: 60px 20px;
  text-align: center;
}

.empty-content {
  max-width: 500px;
  margin: 0 auto;
}

.empty-illustration {
  position: relative;
  margin-bottom: 32px;
  display: inline-block;
}

.empty-icon {
  font-size: 4rem;
  color: #cbd5e1;
  position: relative;
  z-index: 2;
}

.empty-circles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.empty-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(203, 213, 225, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.empty-circle.circle-1 {
  width: 80px;
  height: 80px;
  top: -40px;
  left: -40px;
  animation-delay: 0s;
}

.empty-circle.circle-2 {
  width: 120px;
  height: 120px;
  top: -60px;
  left: -60px;
  animation-delay: 0.5s;
}

.empty-circle.circle-3 {
  width: 160px;
  height: 160px;
  top: -80px;
  left: -80px;
  animation-delay: 1s;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.1; transform: scale(1.1); }
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.empty-description {
  color: #6b7280;
  font-size: 1rem;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.empty-keyword {
  color: #3b82f6;
  font-weight: 600;
}

.empty-suggestions {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin: 24px 0;
  text-align: left;
}

.empty-suggestions h4 {
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.empty-suggestions ul {
  margin: 0;
  padding-left: 20px;
  color: #6b7280;
}

.empty-suggestions li {
  margin-bottom: 6px;
  line-height: 1.5;
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 结果列表 */
.results-list {
  margin-top: 24px;
}

.result-section {
  margin-bottom: 48px;
}

.section-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  position: relative;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.section-icon {
  font-size: 1.5rem;
  color: #3b82f6;
}

.section-count {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.1));
  color: #3b82f6;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.section-actions {
  display: flex;
  gap: 8px;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}

/* 现代化网格布局 */
.modern-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  padding: 0;
}

.result-card-wrapper {
  animation: slideInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.enhanced-card {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.enhanced-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* 分页容器 */
.pagination-container {
  margin-top: 48px;
  padding: 32px 0;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.pagination-info {
  text-align: center;
}

.pagination-text {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.modern-pagination {
  background: white;
  padding: 12px 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 深度样式覆盖分页组件 */
.modern-pagination :deep(.el-pagination__total) {
  color: #64748b;
  font-weight: 500;
}

.modern-pagination :deep(.el-pager li) {
  background: transparent;
  border-radius: 8px;
  margin: 0 2px;
  transition: all 0.3s ease;
}

.modern-pagination :deep(.el-pager li:hover) {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.modern-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.modern-pagination :deep(.btn-prev),
.modern-pagination :deep(.btn-next) {
  background: transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modern-pagination :deep(.btn-prev:hover),
.modern-pagination :deep(.btn-next:hover) {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-results-page {
    padding: 0;
  }

  .search-area {
    padding: 40px 15px 30px;
  }

  .search-hero-title {
    font-size: 2.5rem;
    flex-direction: column;
    gap: 12px;
  }

  .hero-icon {
    font-size: 2.5rem;
  }

  .search-hero-subtitle {
    font-size: 1rem;
  }

  .search-results-container {
    padding: 24px 15px;
    border-radius: 16px 16px 0 0;
  }

  .results-title {
    font-size: 1.25rem;
    flex-direction: column;
    gap: 8px;
  }

  .search-stats {
    flex-direction: column;
    gap: 12px;
  }

  .modern-tabs {
    max-width: 100%;
    padding: 4px;
  }

  .tab-button {
    padding: 10px 16px;
    font-size: 0.875rem;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
    padding: 16px;
    justify-content: center;
  }

  .section-title {
    justify-content: center;
  }

  .section-actions {
    position: static;
    transform: none;
    justify-content: center;
  }

  .modern-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .pagination-container {
    margin-top: 32px;
    padding: 24px 0;
  }

  .modern-pagination {
    padding: 8px 16px;
  }

  .empty-results {
    padding: 40px 15px;
  }

  .empty-suggestions {
    padding: 16px;
  }

  .empty-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .search-hero-title {
    font-size: 2rem;
  }

  .hero-icon {
    font-size: 2rem;
  }

  .decoration-circle {
    display: none;
  }

  .results-title {
    font-size: 1.125rem;
  }

  .tab-button {
    padding: 8px 12px;
    font-size: 0.8rem;
  }

  .modern-grid {
    gap: 12px;
  }
}
</style>
