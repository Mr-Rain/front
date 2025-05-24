<template>
  <div class="search-history-container">
    <!-- 搜索历史头部 -->
    <div class="history-header">
      <h3>搜索历史</h3>
      <div class="header-actions">
        <!-- 类型筛选 -->
        <el-select
          v-model="selectedType"
          placeholder="筛选类型"
          size="small"
          style="width: 120px; margin-right: 10px;"
          @change="handleTypeChange"
        >
          <el-option label="全部" value="" />
          <el-option label="全部搜索" value="all" />
          <el-option label="职位" value="job" />
          <el-option label="企业" value="company" />
          <el-option label="学生" value="student" />
        </el-select>
        
        <!-- 清除所有历史 -->
        <el-button
          type="danger"
          size="small"
          @click="handleClearAll"
          :loading="searchStore.historyLoading"
        >
          清除全部
        </el-button>
      </div>
    </div>

    <!-- 搜索历史列表 -->
    <div v-if="displayHistory.length > 0" class="history-list">
      <!-- 按类型分组显示 -->
      <div v-if="groupByType" class="history-groups">
        <div
          v-for="(group, type) in groupedHistory"
          :key="type"
          class="history-group"
        >
          <div class="group-title">
            <el-icon><Search /></el-icon>
            <span>{{ formatSearchType(type as SearchType) }}</span>
            <span class="group-count">({{ group.length }})</span>
          </div>
          <div class="group-items">
            <div
              v-for="item in group"
              :key="item.id"
              class="history-item"
              @click="handleUseHistory(item)"
            >
              <div class="item-content">
                <span class="keyword">{{ item.keyword }}</span>
                <span class="timestamp">{{ formatTimestamp(item.timestamp) }}</span>
              </div>
              <el-button
                type="danger"
                size="small"
                text
                @click.stop="handleDeleteHistory(item)"
                :loading="deletingIds.includes(item.id)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表显示 -->
      <div v-else class="history-items">
        <div
          v-for="item in displayHistory"
          :key="item.id"
          class="history-item"
          @click="handleUseHistory(item)"
        >
          <div class="item-content">
            <span class="keyword">{{ item.keyword }}</span>
            <el-tag
              v-if="item.type !== 'all'"
              size="small"
              class="type-tag"
            >
              {{ formatSearchType(item.type) }}
            </el-tag>
            <span class="timestamp">{{ formatTimestamp(item.timestamp) }}</span>
          </div>
          <el-button
            type="danger"
            size="small"
            text
            @click.stop="handleDeleteHistory(item)"
            :loading="deletingIds.includes(item.id)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty
        description="暂无搜索历史"
        :image-size="80"
      >
        <template #image>
          <el-icon size="80" color="#c0c4cc"><Search /></el-icon>
        </template>
      </el-empty>
    </div>

    <!-- 显示设置 -->
    <div class="history-settings">
      <el-checkbox v-model="groupByType" size="small">
        按类型分组显示
      </el-checkbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Delete } from '@element-plus/icons-vue';
import { useSearchStore } from '@/stores/search';
import type { SearchHistory, SearchType } from '@/api/search';

// Props
interface Props {
  visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: true
});

// Emits
const emit = defineEmits<{
  useHistory: [item: SearchHistory];
  close: [];
}>();

// Store
const searchStore = useSearchStore();

// 响应式数据
const selectedType = ref<string>('');
const groupByType = ref(false);
const deletingIds = ref<(string | number)[]>([]);

// 计算属性
const displayHistory = computed(() => {
  if (!selectedType.value) {
    return searchStore.searchHistory;
  }
  return searchStore.searchHistory.filter(item => item.type === selectedType.value);
});

const groupedHistory = computed(() => {
  const groups: Record<string, SearchHistory[]> = {};
  displayHistory.value.forEach(item => {
    if (!groups[item.type]) {
      groups[item.type] = [];
    }
    groups[item.type].push(item);
  });
  return groups;
});

// 方法
const handleTypeChange = async () => {
  if (selectedType.value) {
    await searchStore.fetchSearchHistoryByType(selectedType.value as SearchType);
  } else {
    await searchStore.fetchSearchHistory();
  }
};

const handleUseHistory = (item: SearchHistory) => {
  emit('useHistory', item);
};

const handleDeleteHistory = async (item: SearchHistory) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除搜索历史"${item.keyword}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    deletingIds.value.push(item.id);
    await searchStore.deleteHistory(item.id);
  } catch (error) {
    // 用户取消操作
  } finally {
    deletingIds.value = deletingIds.value.filter(id => id !== item.id);
  }
};

const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清除所有搜索历史吗？此操作不可恢复。',
      '确认清除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await searchStore.clearHistory();
  } catch (error) {
    // 用户取消操作
  }
};

const formatSearchType = (type: SearchType): string => {
  const typeMap: Record<SearchType, string> = {
    all: '全部',
    job: '职位',
    company: '企业',
    student: '学生'
  };
  return typeMap[type] || '全部';
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`;
  }
  
  // 小于1天
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
  }
  
  // 小于7天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
  }
  
  // 超过7天显示具体日期
  return date.toLocaleDateString();
};

// 生命周期
onMounted(async () => {
  await searchStore.fetchSearchHistory();
});
</script>

<style scoped>
.search-history-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.history-header h3 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
}

.history-groups {
  space-y: 20px;
}

.history-group {
  margin-bottom: 20px;
}

.group-title {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 6px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.group-title .el-icon {
  margin-right: 8px;
  color: var(--el-color-primary);
}

.group-count {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.group-items,
.history-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-item:hover {
  background-color: var(--el-fill-color-light);
  border-color: var(--el-color-primary);
  transform: translateY(-1px);
}

.item-content {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 12px;
}

.keyword {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.type-tag {
  margin: 0;
}

.timestamp {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: auto;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.history-settings {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid var(--el-border-color-lighter);
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-history-container {
    padding: 15px;
  }
  
  .history-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .item-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .timestamp {
    margin-left: 0;
  }
}
</style>
