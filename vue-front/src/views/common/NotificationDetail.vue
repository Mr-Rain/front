<template>
  <div class="notification-detail-page responsive-padding">
    <el-card shadow="never" class="page-card responsive-card">
      <template #header>
        <div class="card-header">
          <div class="header-left-actions">
            <el-button @click="goBack" type="primary" plain class="back-button">
              <el-icon class="back-icon"><ArrowLeft /></el-icon>
              <span class="back-text">返回</span>
            </el-button>
            <span class="page-title">通知详情</span>
          </div>
          <div class="header-actions">
            <el-button
              v-if="notification && notification.status === 'unread'"
              type="success"
              @click="markAsRead"
            >
              标为已读
            </el-button>
            <el-popconfirm
              title="确定要删除这条通知吗？"
              @confirm="deleteNotification"
            >
              <template #reference>
                <el-button type="danger" plain>
                  删除通知
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </template>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 通知详情内容 -->
      <div v-else-if="notification" class="notification-detail">
        <!-- 通知头部信息 -->
        <div class="notification-header">
          <div class="notification-meta">
            <div class="notification-type">
              <el-tag
                :type="getTypeTagType(notification.type)"
                size="large"
              >
                {{ getTypeLabel(notification.type) }}
              </el-tag>
            </div>
            <div class="notification-priority" v-if="notification.priority">
              <el-tag
                :type="getPriorityTagType(notification.priority)"
                size="small"
              >
                {{ getPriorityLabel(notification.priority) }}
              </el-tag>
            </div>
            <div class="notification-status">
              <el-tag
                :type="notification.status === 'read' ? 'success' : 'warning'"
                size="small"
              >
                {{ notification.status === 'read' ? '已读' : '未读' }}
              </el-tag>
            </div>
          </div>
          <div class="notification-time">
            <span class="create-time">发送时间：{{ formatTime(notification.createTime) }}</span>
            <span v-if="notification.readTime" class="read-time">
              阅读时间：{{ formatTime(notification.readTime) }}
            </span>
          </div>
        </div>

        <!-- 通知标题 -->
        <div class="notification-title">
          <h1>{{ notification.title }}</h1>
        </div>

        <!-- 发送者信息 -->
        <div class="notification-sender" v-if="notification.senderName">
          <div class="sender-info">
            <el-avatar
              :size="40"
              :src="notification.senderAvatar || defaultAvatar"
            />
            <div class="sender-details">
              <div class="sender-name">{{ notification.senderName }}</div>
              <div class="sender-role">{{ getSenderRole(notification.senderId) }}</div>
            </div>
          </div>
        </div>

        <!-- 通知内容 -->
        <div class="notification-content">
          <div class="content-text" v-html="formatContent(notification.content)"></div>
        </div>

        <!-- 附加数据 -->
        <div v-if="notification.data && Object.keys(notification.data).length > 0" class="notification-data">
          <el-divider content-position="left">
            <span class="divider-text">相关信息</span>
          </el-divider>
          <div class="data-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item
                v-for="(value, key) in notification.data"
                :key="key"
                :label="formatDataKey(key)"
              >
                {{ formatDataValue(value) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <!-- 相关链接 -->
        <div v-if="notification.link && notification.link !== currentRoute" class="notification-actions">
          <el-divider content-position="left">
            <span class="divider-text">相关操作</span>
          </el-divider>
          <div class="action-buttons">
            <el-button type="primary" @click="navigateToLink">
              <el-icon><Link /></el-icon>
              查看相关内容
            </el-button>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else class="error-container">
        <el-result
          icon="warning"
          title="通知不存在"
          sub-title="该通知可能已被删除或您没有权限查看"
        >
          <template #extra>
            <el-button type="primary" @click="goBack">返回通知列表</el-button>
          </template>
        </el-result>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, Link } from '@element-plus/icons-vue';
import { useNotificationStore } from '@/stores/notification';
import { useUserStore } from '@/stores/user';
import type { NotificationInfo } from '@/types/notification';
import { DEFAULT_AVATAR } from '@/utils/defaultImages';
import { getNotificationById } from '@/api/notification';
import { navigateTo } from '@/utils/routeHelper';

// 路由和状态管理
const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();
const userStore = useUserStore();

// 响应式数据
const loading = ref(true);
const notification = ref<NotificationInfo | null>(null);

// 计算属性
const defaultAvatar = computed(() => DEFAULT_AVATAR);
const currentRoute = computed(() => route.path);

// 获取通知详情
const fetchNotificationDetail = async () => {
  const notificationId = route.params.id as string;

  if (!notificationId) {
    ElMessage.error('通知ID无效');
    router.push('/notifications');
    return;
  }

  loading.value = true;
  try {
    // 先从store中查找通知
    const existingNotification = notificationStore.notifications.find(
      n => n.id.toString() === notificationId
    );

    if (existingNotification) {
      notification.value = existingNotification;
    } else {
      // 如果store中没有，调用API获取通知详情
      try {
        const response = await getNotificationById(notificationId);
        notification.value = response.data;
      } catch (apiError) {
        // 如果API调用失败，尝试从通知列表中获取
        await notificationStore.fetchNotifications();
        const foundNotification = notificationStore.notifications.find(
          n => n.id.toString() === notificationId
        );

        if (foundNotification) {
          notification.value = foundNotification;
        } else {
          ElMessage.error('通知不存在');
          router.push('/notifications');
          return;
        }
      }
    }

    // 如果通知未读，自动标记为已读
    if (notification.value && notification.value.status === 'unread') {
      await notificationStore.markAsRead(notification.value.id);
      notification.value.status = 'read';
      notification.value.readTime = new Date().toISOString();
    }
  } catch (error) {
    console.error('Failed to fetch notification detail:', error);
    ElMessage.error('获取通知详情失败');
    router.push('/notifications');
  } finally {
    loading.value = false;
  }
};

// 标记为已读
const markAsRead = async () => {
  if (!notification.value) return;

  try {
    await notificationStore.markAsRead(notification.value.id);
    notification.value.status = 'read';
    notification.value.readTime = new Date().toISOString();
    ElMessage.success('已标记为已读');
  } catch (error) {
    console.error('Failed to mark as read:', error);
    ElMessage.error('标记已读失败');
  }
};

// 删除通知
const deleteNotification = async () => {
  if (!notification.value) return;

  try {
    await notificationStore.deleteNotification(notification.value.id);
    ElMessage.success('通知已删除');
    router.push('/notifications');
  } catch (error) {
    console.error('Failed to delete notification:', error);
    ElMessage.error('删除通知失败');
  }
};

// 跳转到相关链接 - 使用与项目其他部分一致的简单跳转逻辑
const navigateToLink = async () => {
  if (!notification.value?.link) return;

  await navigateTo(router, notification.value.link);
};

// 返回上一页
const goBack = () => {
  router.push('/notifications');
};

// 格式化时间
const formatTime = (timeStr: string): string => {
  const date = new Date(timeStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 格式化内容（支持简单的HTML）
const formatContent = (content: string): string => {
  // 简单的换行处理
  return content.replace(/\n/g, '<br>');
};

// 获取类型标签类型
const getTypeTagType = (type: string): string => {
  switch (type) {
    case 'system': return 'info';
    case 'application': return 'success';
    case 'interview': return 'warning';
    default: return 'info';
  }
};

// 获取类型标签文本
const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'system': return '系统通知';
    case 'application': return '申请通知';
    case 'interview': return '面试通知';
    default: return '未知类型';
  }
};

// 获取优先级标签类型
const getPriorityTagType = (priority: string): string => {
  switch (priority) {
    case 'high': return 'danger';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'info';
  }
};

// 获取优先级标签文本
const getPriorityLabel = (priority: string): string => {
  switch (priority) {
    case 'high': return '重要';
    case 'medium': return '一般';
    case 'low': return '普通';
    default: return '普通';
  }
};

// 获取发送者角色
const getSenderRole = (senderId?: string | number): string => {
  if (!senderId) return '系统';
  // 这里可以根据实际需求获取发送者角色信息
  return '系统管理员';
};

// 格式化数据键名
const formatDataKey = (key: string): string => {
  const keyMap: Record<string, string> = {
    'jobId': '职位ID',
    'applicationId': '申请ID',
    'companyId': '企业ID',
    'studentId': '学生ID',
    'interviewTime': '面试时间',
    'interviewLocation': '面试地点',
    'status': '状态',
    'reason': '原因'
  };
  return keyMap[key] || key;
};

// 格式化数据值
const formatDataValue = (value: any): string => {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};

// 组件挂载时获取通知详情
onMounted(() => {
  fetchNotificationDetail();
});
</script>

<style scoped>
.notification-detail-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.page-card {
  margin: 0 auto;
  max-width: 800px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.back-icon {
  font-size: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.loading-container {
  padding: 20px;
}

.notification-detail {
  padding: 20px 0;
}

.notification-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.notification-time {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #909399;
}

.notification-title {
  margin-bottom: 20px;
}

.notification-title h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  line-height: 1.4;
}

.notification-sender {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.sender-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sender-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sender-name {
  font-weight: 600;
  color: #303133;
}

.sender-role {
  font-size: 12px;
  color: #909399;
}

.notification-content {
  margin-bottom: 24px;
}

.content-text {
  font-size: 16px;
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap;
}

.notification-data {
  margin-bottom: 24px;
}

.divider-text {
  font-weight: 600;
  color: #303133;
}

.data-content {
  margin-top: 16px;
}

.notification-actions {
  margin-bottom: 24px;
}

.action-buttons {
  margin-top: 16px;
}

.error-container {
  padding: 40px 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .responsive-padding {
    padding: 12px;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-left-actions {
    justify-content: space-between;
  }

  .header-actions {
    justify-content: center;
  }

  .notification-title h1 {
    font-size: 20px;
  }

  .notification-meta {
    justify-content: center;
  }

  .sender-info {
    flex-direction: column;
    text-align: center;
  }

  .notification-time {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .back-text {
    display: none;
  }

  .page-title {
    font-size: 16px;
  }

  .notification-title h1 {
    font-size: 18px;
  }

  .header-actions {
    flex-direction: column;
  }
}
</style>
