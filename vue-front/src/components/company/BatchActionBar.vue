<template>
  <div class="batch-action-bar" v-if="selectedCount > 0">
    <div class="selected-info">
      已选择 <span class="selected-count">{{ selectedCount }}</span> 项
    </div>
    <div class="action-buttons">
      <el-dropdown @command="handleBatchAction" trigger="click">
        <el-button type="primary" size="small">
          批量操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="viewed" :disabled="!canMarkAsViewed">标记为已查看</el-dropdown-item>
            <el-dropdown-item command="interview" :disabled="!canInviteInterview">邀请面试</el-dropdown-item>
            <el-dropdown-item command="offer" :disabled="!canSendOffer">发放Offer</el-dropdown-item>
            <el-dropdown-item command="rejected" :disabled="!canReject">标记不合适</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button type="info" size="small" @click="handleClearSelection">
        清除选择
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import type { ApplicationInfo, ApplicationStatus } from '@/types/application';

// 定义组件属性
const props = defineProps({
  selectedItems: {
    type: Array as () => ApplicationInfo[],
    required: true
  }
});

// 定义事件
const emit = defineEmits(['batch-action', 'clear-selection']);

// 计算选中项数量
const selectedCount = computed(() => props.selectedItems.length);

// 检查是否可以标记为已查看
const canMarkAsViewed = computed(() => {
  return props.selectedItems.some(item => item.status === 'pending');
});

// 检查是否可以邀请面试
const canInviteInterview = computed(() => {
  return props.selectedItems.some(item => 
    item.status === 'pending' || item.status === 'viewed'
  );
});

// 检查是否可以发放Offer
const canSendOffer = computed(() => {
  return props.selectedItems.some(item => 
    item.status === 'pending' || item.status === 'viewed' || item.status === 'interview'
  );
});

// 检查是否可以拒绝
const canReject = computed(() => {
  return props.selectedItems.some(item => 
    item.status !== 'rejected' && item.status !== 'withdrawn'
  );
});

// 处理批量操作
const handleBatchAction = (action: ApplicationStatus) => {
  // 根据操作类型筛选可以执行该操作的项
  let eligibleItems: ApplicationInfo[] = [];
  
  switch (action) {
    case 'viewed':
      eligibleItems = props.selectedItems.filter(item => item.status === 'pending');
      break;
    case 'interview':
      eligibleItems = props.selectedItems.filter(item => 
        item.status === 'pending' || item.status === 'viewed'
      );
      break;
    case 'offer':
      eligibleItems = props.selectedItems.filter(item => 
        item.status === 'pending' || item.status === 'viewed' || item.status === 'interview'
      );
      break;
    case 'rejected':
      eligibleItems = props.selectedItems.filter(item => 
        item.status !== 'rejected' && item.status !== 'withdrawn'
      );
      break;
    default:
      return;
  }
  
  if (eligibleItems.length > 0) {
    emit('batch-action', { action, items: eligibleItems });
  }
};

// 处理清除选择
const handleClearSelection = () => {
  emit('clear-selection');
};
</script>

<style scoped>
.batch-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 4px;
  margin-bottom: 15px;
}

.selected-info {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.selected-count {
  font-weight: bold;
  color: var(--el-color-primary);
  margin: 0 3px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .batch-action-bar {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
