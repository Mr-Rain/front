<template>
  <div class="global-search-container">
    <!-- 搜索输入框 -->
    <div class="search-input-container">
      <el-autocomplete
        v-model="searchQuery"
        :fetch-suggestions="querySearchAsync"
        placeholder="搜索职位、企业或关键词..."
        :trigger-on-focus="false"
        :highlight-first-item="true"
        :debounce="300"
        popper-class="search-suggestions-popper"
        @select="handleSelect"
        @keyup.enter="handleSearch"
        class="global-search-input"
      >
        <template #prefix>
          <el-icon class="search-icon"><Search /></el-icon>
        </template>

        <template #default="{ item }">
          <div class="suggestion-item">
            <template v-if="item.type === 'suggestion'">
              <el-icon><Search /></el-icon>
              <span>{{ item.value }}</span>
            </template>
            <template v-else-if="item.type === 'history'">
              <el-icon><Clock /></el-icon>
              <span>{{ item.value }}</span>
              <span class="suggestion-category">历史</span>
            </template>
          </div>
        </template>

        <template #suffix>
          <div class="search-button-container">
            <el-button
              v-if="searchQuery"
              class="clear-button"
              :icon="Delete"
              circle
              plain
              size="small"
              @click.stop="clearSearch"
            />
            <el-button
              class="search-button modern-search-button"
              type="primary"
              :icon="Search"
              circle
              @click="handleSearch"
            />
          </div>
        </template>
      </el-autocomplete>
    </div>

    <!-- 搜索历史 -->
    <div v-if="showHistory && searchStore.searchHistory.length > 0" class="search-history">
      <div class="history-header">
        <h3>搜索历史</h3>
        <el-button
          type="text"
          @click="clearHistory"
        >
          清除历史
        </el-button>
      </div>
      <div class="history-list">
        <el-tag
          v-for="item in searchStore.searchHistory"
          :key="item.id"
          class="history-tag"
          @click="useHistoryItem(item)"
        >
          {{ item.keyword }}
          <template v-if="item.type !== 'all'">
            <span class="history-type">{{ formatSearchType(item.type) }}</span>
          </template>
        </el-tag>
      </div>
    </div>

    <!-- 高级搜索表单 -->
    <el-collapse-transition>
      <div v-if="showAdvancedSearch" class="advanced-search-form">
        <el-form :model="advancedFilters" label-position="top">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="搜索类型">
                <el-radio-group v-model="searchType" @change="handleTypeChange">
                  <el-radio-button label="all">全部</el-radio-button>
                  <el-radio-button label="job">职位</el-radio-button>
                  <el-radio-button label="company">企业</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>

            <template v-if="searchType === 'all' || searchType === 'job'">
              <el-col :span="8">
                <el-form-item label="工作地点">
                  <el-select
                    v-model="advancedFilters.location"
                    placeholder="选择工作地点"
                    clearable
                    filterable
                    allow-create
                  >
                    <el-option
                      v-for="item in locationOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="薪资范围">
                  <el-select
                    v-model="advancedFilters.salary"
                    placeholder="选择薪资范围"
                    clearable
                  >
                    <el-option
                      v-for="item in salaryOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="工作经验">
                  <el-select
                    v-model="advancedFilters.experience"
                    placeholder="选择工作经验"
                    clearable
                  >
                    <el-option
                      v-for="item in experienceOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="学历要求">
                  <el-select
                    v-model="advancedFilters.education"
                    placeholder="选择学历要求"
                    clearable
                  >
                    <el-option
                      v-for="item in educationOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </template>

            <template v-if="searchType === 'all' || searchType === 'company'">
              <el-col :span="8">
                <el-form-item label="企业行业">
                  <el-select
                    v-model="advancedFilters.industry"
                    placeholder="选择企业行业"
                    clearable
                    filterable
                    allow-create
                  >
                    <el-option
                      v-for="item in industryOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="企业规模">
                  <el-select
                    v-model="advancedFilters.size"
                    placeholder="选择企业规模"
                    clearable
                  >
                    <el-option
                      v-for="item in sizeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </template>
          </el-row>

          <div class="form-actions">
            <el-button @click="resetAdvancedFilters">重置</el-button>
            <el-button type="primary" @click="applyAdvancedFilters">应用筛选</el-button>
          </div>
        </el-form>
      </div>
    </el-collapse-transition>

    <!-- 高级搜索切换按钮 -->
    <div class="advanced-search-toggle">
      <el-button
        type="text"
        @click="toggleAdvancedSearch"
      >
        {{ showAdvancedSearch ? '收起高级搜索' : '展开高级搜索' }}
        <el-icon>
          <component :is="showAdvancedSearch ? 'ArrowUp' : 'ArrowDown'" />
        </el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSearchStore } from '@/stores/search';
import type { SearchType, SearchHistory } from '@/api/search';
import { ElMessageBox } from 'element-plus';
import { Search, Clock, Delete, ArrowDown, ArrowUp } from '@element-plus/icons-vue';

// 定义组件属性
const props = defineProps({
  initialKeyword: {
    type: String,
    default: ''
  },
  initialType: {
    type: String as () => SearchType,
    default: 'all'
  },
  showHistoryByDefault: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['search', 'clear', 'type-change']);

const router = useRouter();
const searchStore = useSearchStore();

// 搜索查询
const searchQuery = ref(props.initialKeyword);
const searchType = ref<SearchType>(props.initialType);

// 控制高级搜索和历史记录的显示
const showAdvancedSearch = ref(false);
const showHistory = ref(props.showHistoryByDefault);

// 高级筛选条件
const advancedFilters = reactive({
  location: '',
  salary: '',
  experience: '',
  education: '',
  industry: '',
  size: ''
});

// 选项数据
const locationOptions = [
  { value: '北京', label: '北京' },
  { value: '上海', label: '上海' },
  { value: '广州', label: '广州' },
  { value: '深圳', label: '深圳' },
  { value: '杭州', label: '杭州' },
  { value: '南京', label: '南京' },
  { value: '成都', label: '成都' },
  { value: '武汉', label: '武汉' },
  { value: '西安', label: '西安' },
  { value: '苏州', label: '苏州' }
];

const salaryOptions = [
  { value: '0-5k', label: '5K以下' },
  { value: '5k-10k', label: '5K-10K' },
  { value: '10k-15k', label: '10K-15K' },
  { value: '15k-20k', label: '15K-20K' },
  { value: '20k-30k', label: '20K-30K' },
  { value: '30k-50k', label: '30K-50K' },
  { value: '50k+', label: '50K以上' }
];

const experienceOptions = [
  { value: '应届生', label: '应届生' },
  { value: '1年以下', label: '1年以下' },
  { value: '1-3年', label: '1-3年' },
  { value: '3-5年', label: '3-5年' },
  { value: '5-10年', label: '5-10年' },
  { value: '10年以上', label: '10年以上' }
];

const educationOptions = [
  { value: '不限', label: '不限' },
  { value: '大专', label: '大专' },
  { value: '本科', label: '本科' },
  { value: '硕士', label: '硕士' },
  { value: '博士', label: '博士' }
];

const industryOptions = [
  { value: '互联网', label: '互联网' },
  { value: '金融', label: '金融' },
  { value: '教育', label: '教育' },
  { value: '医疗健康', label: '医疗健康' },
  { value: '人工智能', label: '人工智能' },
  { value: '电子商务', label: '电子商务' },
  { value: '游戏', label: '游戏' },
  { value: '文化娱乐', label: '文化娱乐' },
  { value: '企业服务', label: '企业服务' },
  { value: '硬件', label: '硬件' }
];

const sizeOptions = [
  { value: '少于15人', label: '少于15人' },
  { value: '15-50人', label: '15-50人' },
  { value: '50-150人', label: '50-150人' },
  { value: '150-500人', label: '150-500人' },
  { value: '500-2000人', label: '500-2000人' },
  { value: '2000人以上', label: '2000人以上' }
];

// 获取搜索建议
const querySearchAsync = async (queryString: string, cb: (arg: any[]) => void) => {
  if (!queryString) {
    cb([]);
    return;
  }

  // 获取搜索建议
  await searchStore.fetchSearchSuggestions(queryString);

  // 获取搜索历史
  await searchStore.fetchSearchHistory();

  // 构建建议列表
  const suggestions = searchStore.searchSuggestions.map(item => ({
    value: item,
    type: 'suggestion'
  }));

  // 添加历史记录（最多5条）
  const historyItems = searchStore.searchHistory
    .filter(item => item.keyword.toLowerCase().includes(queryString.toLowerCase()))
    .slice(0, 5)
    .map(item => ({
      value: item.keyword,
      type: 'history',
      searchType: item.type
    }));

  // 合并建议和历史记录
  const results = [...historyItems, ...suggestions];

  cb(results);
};

// 处理选择搜索建议
const handleSelect = (item: any) => {
  searchQuery.value = item.value;

  // 如果是历史记录，则设置搜索类型
  if (item.type === 'history' && item.searchType) {
    searchType.value = item.searchType;
  }

  handleSearch();
};

// 执行搜索
const handleSearch = () => {
  if (!searchQuery.value.trim()) return;

  // 隐藏高级搜索和历史记录
  showAdvancedSearch.value = false;
  showHistory.value = false;

  // 构建搜索参数
  const searchParams = {
    keyword: searchQuery.value,
    type: searchType.value,
    filters: { ...advancedFilters }
  };

  // 执行搜索
  searchStore.performSearch(searchParams);

  // 导航到搜索结果页面
  router.push({
    path: '/search',
    query: {
      q: searchQuery.value,
      type: searchType.value,
      ...Object.fromEntries(
        Object.entries(advancedFilters).filter(([_, value]) => value)
      )
    }
  });

  // 触发搜索事件
  emit('search', searchParams);
};

// 清除搜索
const clearSearch = () => {
  searchQuery.value = '';
  emit('clear');
};

// 清除搜索历史
const clearHistory = async () => {
  try {
    await ElMessageBox.confirm('确定要清除所有搜索历史吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await searchStore.clearHistory();
  } catch (error) {
    // 用户取消操作
  }
};

// 使用历史记录项
const useHistoryItem = (item: SearchHistory) => {
  searchQuery.value = item.keyword;
  searchType.value = item.type;
  handleSearch();
};

// 切换高级搜索
const toggleAdvancedSearch = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value;

  // 如果打开高级搜索，则关闭历史记录
  if (showAdvancedSearch.value) {
    showHistory.value = false;
  }
};

// 重置高级筛选条件
const resetAdvancedFilters = () => {
  Object.keys(advancedFilters).forEach(key => {
    advancedFilters[key as keyof typeof advancedFilters] = '';
  });
};

// 应用高级筛选条件
const applyAdvancedFilters = () => {
  handleSearch();
};

// 处理搜索类型变更
const handleTypeChange = () => {
  emit('type-change', searchType.value);
};

// 格式化搜索类型
const formatSearchType = (type: SearchType): string => {
  const typeMap: Record<SearchType, string> = {
    all: '全部',
    job: '职位',
    company: '企业',
    student: '学生'
  };

  return typeMap[type] || '全部';
};

// 组件挂载时获取搜索历史
onMounted(async () => {
  await searchStore.fetchSearchHistory();
});
</script>

<style scoped>
.global-search-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-input-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.global-search-input {
  width: 100%;
}

.global-search-input :deep(.el-input__wrapper) {
  border-radius: 20px !important;
  padding: 0 8px;
  background: rgba(35, 35, 50, 0.8);
  border: 1px solid rgba(100, 100, 255, 0.3);
  box-shadow: 0 0 10px rgba(80, 80, 255, 0.1);
  transition: all 0.3s ease;
  height: 40px;
  padding-right: 85px; /* 为两个按钮预留空间 */
}

.global-search-input :deep(.el-input__wrapper:hover),
.global-search-input :deep(.el-input__wrapper:focus-within) {
  border-color: rgba(120, 120, 255, 0.8);
  box-shadow: 0 0 15px rgba(100, 100, 255, 0.3);
}

/* 输入框样式 */
.global-search-input :deep(.el-input__inner) {
  height: 40px;
  color: #eaeaea;
  background: transparent;
  font-size: 14px;
}

.global-search-input :deep(.el-input__inner::placeholder) {
  color: rgba(180, 180, 200, 0.6);
}

/* 前缀图标样式 */
.global-search-input :deep(.el-input__prefix) {
  padding-right: 8px;
}

.search-icon {
  color: rgba(150, 150, 255, 0.8);
  font-size: 16px;
}

/* 搜索按钮容器样式 */
.search-button-container {
  display: flex;
  align-items: center;
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  gap: 8px;
}

/* 搜索按钮样式 */
.modern-search-button {
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  background: linear-gradient(135deg, #6e8efb, #a777e3) !important;
  border-color: transparent !important;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.modern-search-button:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 0 8px rgba(150, 150, 255, 0.6) !important;
}

/* 清除按钮样式 */
.clear-button {
  width: 28px !important;
  height: 28px !important;
  padding: 0 !important;
  color: rgba(180, 180, 200, 0.8) !important;
  background: rgba(80, 80, 100, 0.3) !important;
  border-color: transparent !important;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.clear-button:hover {
  color: white !important;
  background: rgba(255, 100, 100, 0.5) !important;
  transform: scale(1.1) !important;
}

/* 添加呼吸光效果 */
@keyframes glow {
  0% { box-shadow: 0 0 5px rgba(100, 100, 255, 0.3); }
  50% { box-shadow: 0 0 15px rgba(120, 120, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(100, 100, 255, 0.3); }
}

.global-search-input :deep(.el-input__wrapper:focus-within) {
  animation: glow 2s infinite;
}

/* 适配浅色主题 */
:root[data-theme="light"] .global-search-input :deep(.el-input__wrapper) {
  background: rgba(245, 245, 250, 0.9);
  border: 1px solid rgba(100, 100, 255, 0.2);
}

:root[data-theme="light"] .global-search-input :deep(.el-input__inner) {
  color: #333;
}

:root[data-theme="light"] .global-search-input :deep(.el-input__inner::placeholder) {
  color: rgba(100, 100, 120, 0.6);
}

:root[data-theme="light"] .search-icon {
  color: rgba(100, 100, 255, 0.7);
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
}

.suggestion-item .el-icon {
  margin-right: 8px;
  color: var(--el-color-primary);
}

.suggestion-category {
  margin-left: auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color-lighter);
  padding: 2px 6px;
  border-radius: 10px;
}

:deep(.search-suggestions-popper) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-history {
  margin-top: 20px;
  padding: 15px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.history-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.history-tag {
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 16px;
  transition: all 0.3s;
}

.history-tag:hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.history-type {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: 5px;
}

.advanced-search-form {
  margin-top: 20px;
  padding: 20px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
}

.advanced-search-toggle {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .global-search-container {
    padding: 15px;
  }

  :deep(.el-input__wrapper) {
    height: 40px;
  }

  :deep(.el-input__inner) {
    font-size: 14px;
    height: 40px;
  }

  .search-icon {
    font-size: 16px;
  }

  .el-col {
    width: 100%;
  }
}
</style>
