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
            <!-- 搜索历史按钮 -->
            <el-button
              class="history-button"
              :icon="Clock"
              circle
              plain
              size="small"
              :type="showHistory ? 'primary' : 'default'"
              @click.stop="toggleHistory"
            />

            <!-- 清除按钮 -->
            <el-button
              v-if="searchQuery"
              class="clear-button"
              :icon="Delete"
              circle
              plain
              size="small"
              @click.stop="clearSearch"
            />

            <!-- 搜索按钮 -->
            <el-button
              class="search-button modern-search-button"
              :icon="Search"
              circle
              plain
              @click="handleSearch"
            />
          </div>
        </template>
      </el-autocomplete>
    </div>

    <!-- 搜索历史 -->
    <SearchHistoryComponent
      v-if="showHistory"
      @use-history="useHistoryItem"
      @close="showHistory = false"
    />

    <!-- 当前筛选条件显示 -->
    <div v-if="hasActiveFilters" class="active-filters">
      <div class="filter-tags">
        <el-tag
          v-for="(filter, key) in activeFiltersDisplay"
          :key="key"
          :closable="true"
          @close="removeFilter(key)"
          class="filter-tag"
          type="primary"
        >
          {{ filter.label }}: {{ filter.value }}
        </el-tag>
        <el-button
          v-if="hasActiveFilters"
          size="small"
          type="danger"
          text
          @click="clearAllFilters"
          class="clear-all-btn"
        >
          清除所有筛选
        </el-button>
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
        type="primary"
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
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSearchStore } from '@/stores/search';
import type { SearchType, SearchHistory } from '@/api/search';
import { ElMessageBox } from 'element-plus';
import { Search, Clock, Delete, ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import SearchHistoryComponent from './SearchHistory.vue';

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
  },
  initialFilters: {
    type: Object,
    default: () => ({})
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
  location: props.initialFilters.location || '',
  salary: props.initialFilters.salary || '',
  experience: props.initialFilters.experience || '',
  education: props.initialFilters.education || '',
  industry: props.initialFilters.industry || '',
  size: props.initialFilters.size || ''
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

// 计算属性：是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return Object.values(advancedFilters).some(value => value !== '');
});

// 计算属性：活跃筛选条件的显示格式
const activeFiltersDisplay = computed(() => {
  const filters: Record<string, { label: string; value: string }> = {};

  const labelMap: Record<string, string> = {
    location: '工作地点',
    salary: '薪资范围',
    experience: '工作经验',
    education: '学历要求',
    industry: '企业行业',
    size: '企业规模'
  };

  const valueMap: Record<string, Record<string, string>> = {
    salary: {
      '0-5k': '5K以下',
      '5k-10k': '5K-10K',
      '10k-15k': '10K-15K',
      '15k-20k': '15K-20K',
      '20k-30k': '20K-30K',
      '30k-50k': '30K-50K',
      '50k+': '50K以上'
    }
  };

  Object.entries(advancedFilters).forEach(([key, value]) => {
    if (value) {
      filters[key] = {
        label: labelMap[key] || key,
        value: valueMap[key]?.[value] || value
      };
    }
  });

  return filters;
});

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

  // 隐藏历史记录，但如果有筛选条件则保持高级搜索面板显示
  showHistory.value = false;
  if (!hasActiveFilters.value) {
    showAdvancedSearch.value = false;
  }

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

// 切换搜索历史显示
const toggleHistory = () => {
  showHistory.value = !showHistory.value;

  // 如果打开历史记录，则关闭高级搜索
  if (showHistory.value) {
    showAdvancedSearch.value = false;
  }
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

// 移除单个筛选条件
const removeFilter = (key: string) => {
  advancedFilters[key as keyof typeof advancedFilters] = '';
  handleSearch();
};

// 清除所有筛选条件
const clearAllFilters = () => {
  Object.keys(advancedFilters).forEach(key => {
    advancedFilters[key as keyof typeof advancedFilters] = '';
  });
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

// 监听初始筛选条件的变化
watch(
  () => props.initialFilters,
  (newFilters) => {
    if (newFilters) {
      Object.keys(advancedFilters).forEach(key => {
        advancedFilters[key as keyof typeof advancedFilters] = newFilters[key] || '';
      });
    }
  },
  { deep: true, immediate: true }
);

// 监听初始关键词和类型的变化
watch(
  () => [props.initialKeyword, props.initialType],
  ([newKeyword, newType]) => {
    searchQuery.value = newKeyword;
    searchType.value = newType as SearchType;
  },
  { immediate: true }
);

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
  position: relative;
}

/* 主输入框容器样式 - 现代化设计 */
.global-search-input :deep(.el-input__wrapper) {
  border-radius: 24px !important;
  padding: 0 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
  border: 2px solid rgba(99, 102, 241, 0.2);
  box-shadow:
    0 4px 20px rgba(99, 102, 241, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 48px;
  padding-right: 120px; /* 为三个按钮预留合适空间 */
  padding-left: 52px; /* 为前缀图标预留空间 */
  backdrop-filter: blur(10px);
}

/* 悬停和聚焦状态 - 增强交互反馈 */
.global-search-input :deep(.el-input__wrapper:hover) {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow:
    0 8px 30px rgba(99, 102, 241, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.global-search-input :deep(.el-input__wrapper:focus-within) {
  border-color: rgba(99, 102, 241, 0.6);
  box-shadow:
    0 12px 40px rgba(99, 102, 241, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 1),
    0 0 0 4px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

/* 输入框文本样式 - 优化可读性 */
.global-search-input :deep(.el-input__inner) {
  height: 48px;
  color: #1f2937;
  background: transparent;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  padding: 0;
  border: none;
}

.global-search-input :deep(.el-input__inner::placeholder) {
  color: rgba(107, 114, 128, 0.7);
  font-weight: 400;
}

/* 前缀图标容器 - 改进布局 */
.global-search-input :deep(.el-input__prefix) {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

/* 搜索图标样式 - 统一尺寸 */
.search-icon {
  color: rgba(99, 102, 241, 0.7);
  font-size: 18px;
  transition: all 0.3s ease;
}

.global-search-input :deep(.el-input__wrapper:focus-within) .search-icon {
  color: rgba(99, 102, 241, 1);
  transform: scale(1.1);
}

/* 搜索按钮容器样式 */
.search-button-container {
  display: flex;
  align-items: center;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  gap: 6px;
  padding: 3px !important;
  border-radius: 18px !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  width: auto !important;
  height: auto !important;
  flex-shrink: 0 !important;
}

/* 搜索按钮样式 - 使用更强的选择器覆盖Element Plus默认样式 */
.search-button-container .modern-search-button.el-button.el-button--default.is-circle {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  max-width: 24px !important;
  min-height: 24px !important;
  max-height: 24px !important;
  padding: 0 !important;
  margin: 0 !important;
  color: white !important;
  background: linear-gradient(135deg, #10b981, #059669) !important;
  background-color: #10b981 !important;
  border: none !important;
  border-color: transparent !important;
  border-width: 0 !important;
  border-radius: 50% !important;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3) !important;
  font-size: 14px !important;
  line-height: 1 !important;
}

.search-button-container .modern-search-button.el-button.el-button--default.is-circle:hover,
.search-button-container .modern-search-button.el-button.el-button--default.is-circle:focus {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  max-width: 24px !important;
  min-height: 24px !important;
  max-height: 24px !important;
  color: white !important;
  background: linear-gradient(135deg, #059669, #047857) !important;
  background-color: #059669 !important;
  border-color: transparent !important;
  border-width: 0 !important;
  transform: scale(1.1) translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4) !important;
}

.search-button-container .modern-search-button.el-button.el-button--default.is-circle:active {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  max-width: 24px !important;
  min-height: 24px !important;
  max-height: 24px !important;
  color: white !important;
  background: linear-gradient(135deg, #047857, #065f46) !important;
  background-color: #047857 !important;
  border-color: transparent !important;
  border-width: 0 !important;
  transform: scale(1.05) translateY(0) !important;
}

.search-button-container .modern-search-button.el-button .el-icon {
  font-size: 14px !important;
  color: white !important;
  margin: 0 !important;
}

/* 深度选择器确保覆盖所有嵌套样式 */
.search-button-container .modern-search-button :deep(.el-button) {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  max-width: 24px !important;
  min-height: 24px !important;
  max-height: 24px !important;
  padding: 0 !important;
  background: linear-gradient(135deg, #10b981, #059669) !important;
  border: none !important;
  border-radius: 50% !important;
}

.search-button-container .modern-search-button :deep(.el-icon) {
  font-size: 14px !important;
  color: white !important;
}

/* 额外的强制样式确保按钮为正方形 */
.modern-search-button.el-button {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  max-width: 24px !important;
  min-height: 24px !important;
  max-height: 24px !important;
  padding: 0 !important;
  margin: 0 !important;
  border: 0 !important;
  outline: none !important;
  box-sizing: border-box !important;
}

/* 使用属性选择器进一步强化 */
.search-button-container button.modern-search-button[class*="el-button"] {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  max-width: 24px !important;
  min-height: 24px !important;
  max-height: 24px !important;
  padding: 0 !important;
  margin: 0 !important;
  border: 0 !important;
  border-radius: 50% !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

/* 强制覆盖所有可能的Element Plus样式 */
.search-button-container .modern-search-button.el-button * {
  padding: 0 !important;
  margin: 0 !important;
  border: 0 !important;
}

/* 针对按钮内部的span元素 */
.search-button-container .modern-search-button.el-button > span {
  width: 24px !important;
  height: 24px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* 最强优先级的样式 */
.search-button-container .modern-search-button.el-button.el-button--default.is-circle.is-plain {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  max-width: 24px !important;
  min-height: 24px !important;
  max-height: 24px !important;
  padding: 0 !important;
  margin: 0 !important;
  border: 0 !important;
  border-width: 0 !important;
  line-height: 1 !important;
  font-size: 14px !important;
}

/* 搜索历史按钮样式 - 使用更强的选择器 */
.search-button-container .history-button.el-button {
  width: 24px !important;
  height: 24px !important;
  min-height: 24px !important;
  padding: 0 !important;
  margin: 0 !important;
  color: white !important;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
  background-color: #3b82f6 !important;
  border: none !important;
  border-color: transparent !important;
  border-radius: 50% !important;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3) !important;
}

.search-button-container .history-button.el-button:hover,
.search-button-container .history-button.el-button:focus {
  color: white !important;
  background: linear-gradient(135deg, #2563eb, #1e40af) !important;
  background-color: #2563eb !important;
  border-color: transparent !important;
  transform: scale(1.1) translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
}

.search-button-container .history-button.el-button--primary,
.search-button-container .history-button.el-button.is-active {
  color: white !important;
  background: linear-gradient(135deg, #1d4ed8, #1e3a8a) !important;
  background-color: #1d4ed8 !important;
  border-color: transparent !important;
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.5) !important;
}

.search-button-container .history-button.el-button .el-icon {
  font-size: 14px !important;
  color: white !important;
  margin: 0 !important;
}

/* 清除按钮样式 - 使用更强的选择器 */
.search-button-container .clear-button.el-button {
  width: 24px !important;
  height: 24px !important;
  min-height: 24px !important;
  padding: 0 !important;
  margin: 0 !important;
  color: white !important;
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  background-color: #ef4444 !important;
  border: none !important;
  border-color: transparent !important;
  border-radius: 50% !important;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3) !important;
}

.search-button-container .clear-button.el-button:hover,
.search-button-container .clear-button.el-button:focus {
  color: white !important;
  background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
  background-color: #dc2626 !important;
  border-color: transparent !important;
  transform: scale(1.1) translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4) !important;
}

.search-button-container .clear-button.el-button .el-icon {
  font-size: 14px !important;
  color: white !important;
  margin: 0 !important;
}



/* 深色主题适配 */
[data-theme="dark"] .global-search-input :deep(.el-input__wrapper) {
  background: linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(25, 25, 35, 0.9)) !important;
  border-color: rgba(99, 102, 241, 0.3) !important;
  box-shadow:
    0 4px 20px rgba(99, 102, 241, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
}

[data-theme="dark"] .global-search-input :deep(.el-input__inner) {
  color: #e5e7eb !important;
}

[data-theme="dark"] .global-search-input :deep(.el-input__inner::placeholder) {
  color: rgba(156, 163, 175, 0.7) !important;
}

[data-theme="dark"] .search-icon {
  color: rgba(99, 102, 241, 0.8) !important;
}

[data-theme="dark"] .search-button-container {
  background: transparent !important;
  backdrop-filter: none !important;
}

/* 浅色主题保持默认样式，无需额外覆盖 */

/* 自动主题适配 */
@media (prefers-color-scheme: dark) {
  .global-search-input :deep(.el-input__wrapper) {
    background: linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(25, 25, 35, 0.9)) !important;
    border-color: rgba(99, 102, 241, 0.3) !important;
  }

  .global-search-input :deep(.el-input__inner) {
    color: #e5e7eb !important;
  }

  .global-search-input :deep(.el-input__inner::placeholder) {
    color: rgba(156, 163, 175, 0.7) !important;
  }

  .search-icon {
    color: rgba(99, 102, 241, 0.8) !important;
  }
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

/* 当前筛选条件显示 */
.active-filters {
  margin: 15px 0;
  padding: 15px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.filter-tag {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  border: none !important;
  color: white !important;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  transition: all 0.3s ease;
}

.filter-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.filter-tag :deep(.el-tag__close) {
  color: rgba(255, 255, 255, 0.8) !important;
  font-weight: bold;
}

.filter-tag :deep(.el-tag__close:hover) {
  color: white !important;
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.clear-all-btn {
  margin-left: 8px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.clear-all-btn:hover {
  transform: scale(1.05);
}

.advanced-search-toggle {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .global-search-container {
    padding: 15px;
  }

  .global-search-input :deep(.el-input__wrapper) {
    height: 44px !important;
    padding-right: 140px !important;
    padding-left: 48px !important;
    border-radius: 22px !important;
  }

  .global-search-input :deep(.el-input__inner) {
    font-size: 14px !important;
    height: 44px !important;
  }

  .search-icon {
    font-size: 16px !important;
  }

  .global-search-input :deep(.el-input__prefix) {
    left: 16px !important;
  }

  .search-button-container {
    right: 8px !important;
    gap: 6px !important;
    padding: 3px !important;
  }

  .modern-search-button {
    width: 20px !important;
    height: 20px !important;
  }

  .modern-search-button .el-icon {
    font-size: 12px !important;
  }

  .history-button,
  .clear-button {
    width: 20px !important;
    height: 20px !important;
  }

  .el-col {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .global-search-input :deep(.el-input__wrapper) {
    height: 42px !important;
    padding-right: 120px !important;
    padding-left: 44px !important;
  }

  .global-search-input :deep(.el-input__inner) {
    font-size: 13px !important;
    height: 42px !important;
  }

  .modern-search-button {
    width: 18px !important;
    height: 18px !important;
  }

  .modern-search-button .el-icon {
    font-size: 10px !important;
  }

  .history-button,
  .clear-button {
    width: 18px !important;
    height: 18px !important;
  }

  .search-button-container {
    gap: 4px !important;
    padding: 2px !important;
  }
}
</style>
