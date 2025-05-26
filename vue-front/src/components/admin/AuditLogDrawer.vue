<template>
  <el-drawer
    v-model="drawerVisible"
    title="审核记录"
    direction="rtl"
    size="50%"
    :before-close="handleClose"
  >
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    <div v-else-if="auditLogs && auditLogs.length > 0" class="audit-log-content">
      <el-timeline>
        <el-timeline-item
          v-for="log in auditLogs"
          :key="log.id"
          :timestamp="formatTime(log.auditTime)"
          :type="getTimelineItemType(log.action)"
          :hollow="log.action === 'view'"
        >
          <div class="timeline-content">
            <div class="timeline-title">
              <span class="action-text">{{ formatAction(log.action) }}</span>
              <el-tag v-if="log.action === 'approve' || log.action === 'reject'" :type="log.action === 'approve' ? 'success' : 'danger'" size="small">
                {{ log.action === 'approve' ? '通过' : '拒绝' }}
              </el-tag>
            </div>
            <div class="timeline-operator">
              操作人: {{ log.operatorName || '系统' }}
            </div>
            <div v-if="log.message" class="timeline-message">
              {{ log.message }}
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
    <el-empty v-else description="暂无审核记录"></el-empty>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { formatDateTime } from '@/utils/dateUtils';

// 审核记录类型
interface AuditLog {
  id: string | number;
  companyId: string | number;  // 后端使用驼峰命名法
  action: 'view' | 'approve' | 'reject' | 'comment';
  operatorId?: string | number;  // 后端使用驼峰命名法
  operatorName?: string;  // 后端使用驼峰命名法
  auditTime: string;  // 后端使用驼峰命名法
  message?: string;
}

// 定义组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  companyId: {
    type: [String, Number],
    default: ''
  },
  auditLogs: {
    type: Array as () => AuditLog[],
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['update:visible', 'close']);

// 抽屉可见状态
const drawerVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

// 格式化时间 - 使用统一的日期格式化函数
const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return '-';
  const formatted = formatDateTime(timeStr, { format: 'full' });
  return formatted || '-';
};

// 格式化操作类型
const formatAction = (action: string): string => {
  const actionMap: Record<string, string> = {
    view: '查看企业资料',
    approve: '审核通过',
    reject: '审核拒绝',
    comment: '添加备注'
  };
  return actionMap[action] || action;
};

// 获取时间线项目类型
const getTimelineItemType = (action: string): string => {
  const typeMap: Record<string, string> = {
    view: 'info',
    approve: 'success',
    reject: 'danger',
    comment: 'warning'
  };
  return typeMap[action] || 'primary';
};

// 处理关闭抽屉
const handleClose = () => {
  drawerVisible.value = false;
  emit('close');
};
</script>

<style scoped>
.loading-container {
  padding: 20px;
}

.audit-log-content {
  padding: 0 20px;
}

.timeline-content {
  padding: 10px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

.timeline-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.action-text {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.timeline-operator {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.timeline-message {
  font-size: 14px;
  color: var(--el-text-color-regular);
  white-space: pre-line;
  line-height: 1.5;
  padding: 8px;
  background-color: var(--el-fill-color);
  border-radius: 4px;
  margin-top: 8px;
}
</style>
