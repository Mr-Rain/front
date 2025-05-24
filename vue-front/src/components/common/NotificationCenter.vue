<template>
  <div class="notification-center">
    <!-- 通知图标和未读数量 -->
    <el-badge :value="unreadCount > 0 ? unreadCount : ''" :max="99" class="notification-badge">
      <el-popover
        placement="bottom"
        :width="320"
        trigger="click"
        popper-class="notification-popover"
        @show="handlePopoverShow"
      >
        <template #reference>
          <el-button class="notification-button" :icon="Bell" circle />
        </template>

        <!-- 通知弹出框内容 -->
        <div class="notification-popover-content">
          <div class="notification-header">
            <h3 class="notification-title">通知中心</h3>
            <div class="notification-actions">
              <el-button v-if="hasUnread" type="primary" size="small" @click="markAllAsRead">
                全部已读
              </el-button>
              <el-button type="primary" size="small" @click="viewAllNotifications">
                查看全部
              </el-button>
            </div>
          </div>

          <el-tabs v-model="activeTab" class="notification-tabs">
            <el-tab-pane label="全部" name="all">
              <div v-loading="loading" class="notification-list">
                <template v-if="notifications.length > 0">
                  <div
                    v-for="notification in notifications"
                    :key="notification.id"
                    class="notification-item"
                    :class="{ 'unread': notification.status === 'unread' }"
                    @click="handleNotificationClick(notification)"
                  >
                    <div class="notification-icon">
                      <el-avatar v-if="notification.senderAvatar" :src="notification.senderAvatar" :size="32" />
                      <el-icon v-else :size="20" :class="getNotificationIconClass(notification.type)">
                        <component :is="getNotificationIcon(notification.type)" />
                      </el-icon>
                    </div>
                    <div class="notification-content">
                      <div class="notification-title-row">
                        <span class="notification-item-title">{{ notification.title }}</span>
                        <span class="notification-time">{{ formatTime(notification.createTime) }}</span>
                      </div>
                      <div class="notification-message">{{ notification.content }}</div>
                    </div>
                  </div>
                </template>
                <el-empty v-else description="暂无通知" :image-size="64" />
              </div>
            </el-tab-pane>

            <el-tab-pane label="未读" name="unread">
              <div v-loading="loading" class="notification-list">
                <template v-if="unreadNotifications.length > 0">
                  <div
                    v-for="notification in unreadNotifications"
                    :key="notification.id"
                    class="notification-item unread"
                    @click="handleNotificationClick(notification)"
                  >
                    <div class="notification-icon">
                      <el-avatar v-if="notification.senderAvatar" :src="notification.senderAvatar" :size="32" />
                      <el-icon v-else :size="20" :class="getNotificationIconClass(notification.type)">
                        <component :is="getNotificationIcon(notification.type)" />
                      </el-icon>
                    </div>
                    <div class="notification-content">
                      <div class="notification-title-row">
                        <span class="notification-item-title">{{ notification.title }}</span>
                        <span class="notification-time">{{ formatTime(notification.createTime) }}</span>
                      </div>
                      <div class="notification-message">{{ notification.content }}</div>
                    </div>
                  </div>
                </template>
                <el-empty v-else description="暂无未读通知" :image-size="64" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-popover>
    </el-badge>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import type { NotificationInfo } from '@/types/notification';
import {
  Bell,
  Message,
  InfoFilled,
  Promotion,
  ChatDotRound
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const notificationStore = useNotificationStore();

// 状态
const loading = ref(false);
const activeTab = ref('all');
const notifications = ref<NotificationInfo[]>([]);
const unreadCount = ref(0);

// 计算属性
const unreadNotifications = computed(() => {
  return notifications.value.filter(n => n.status === 'unread');
});

const hasUnread = computed(() => {
  return unreadCount.value > 0;
});

// 初始化
onMounted(async () => {
  await fetchUnreadCount();
  await fetchNotifications();
});

// 监听标签页变化
watch(activeTab, (newTab) => {
  if (newTab === 'unread') {
    fetchUnreadNotifications();
  } else {
    fetchNotifications();
  }
});

// 获取未读通知数量
const fetchUnreadCount = async () => {
  unreadCount.value = await notificationStore.fetchUnreadCount();
};

// 获取通知列表
const fetchNotifications = async () => {
  loading.value = true;
  try {
    const response = await notificationStore.fetchNotifications({ limit: 5 });
    if (response) {
      notifications.value = response.list;
    }
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  } finally {
    loading.value = false;
  }
};

// 获取未读通知列表
const fetchUnreadNotifications = async () => {
  loading.value = true;
  try {
    const response = await notificationStore.fetchNotifications({
      limit: 5,
      status: 'unread'
    });
    if (response) {
      notifications.value = response.list;
    }
  } catch (error) {
    console.error('Failed to fetch unread notifications:', error);
  } finally {
    loading.value = false;
  }
};

// 处理弹出框显示
const handlePopoverShow = () => {
  fetchNotifications();
};

// 标记所有通知为已读
const markAllAsRead = async () => {
  try {
    await notificationStore.markAsRead();
    ElMessage.success('已将所有通知标记为已读');
    unreadCount.value = 0;
    fetchNotifications();
  } catch (error) {
    console.error('Failed to mark all as read:', error);
  }
};

// 查看所有通知
const viewAllNotifications = () => {
  router.push('/notifications');
};

// 处理通知点击
const handleNotificationClick = async (notification: NotificationInfo) => {
  // 跳转到通知详情页面
  router.push(`/notifications/${notification.id}`);
};

// 获取通知图标
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'system':
      return InfoFilled;
    case 'application':
      return Promotion;
    case 'interview':
      return ChatDotRound;
    default:
      return Message;
  }
};

// 获取通知图标样式类
const getNotificationIconClass = (type: string) => {
  return {
    'system-icon': type === 'system',
    'application-icon': type === 'application',
    'interview-icon': type === 'interview'
  };
};

// 格式化时间
const formatTime = (timeStr: string): string => {
  const now = new Date();
  const time = new Date(timeStr);
  const diff = now.getTime() - time.getTime();

  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }

  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`;
  }

  // 小于24小时
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
  }

  // 小于7天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
  }

  // 大于7天，显示具体日期
  return time.toLocaleDateString();
};
</script>

<style scoped>
.notification-center {
  display: flex;
  align-items: center;
}

.notification-badge {
  margin-right: 10px;
}

.notification-button {
  font-size: 18px;
  color: var(--el-text-color-regular);
  transition: color 0.3s;
}

.notification-button:hover {
  color: var(--el-color-primary);
}

.notification-popover-content {
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  margin-bottom: 10px;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.notification-actions {
  display: flex;
  gap: 10px;
}

.notification-tabs {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content) {
  flex-grow: 1;
  overflow: auto;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  padding: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: var(--el-fill-color-light);
}

.notification-item.unread {
  background-color: var(--el-color-primary-light-9);
}

.notification-item.unread:hover {
  background-color: var(--el-color-primary-light-8);
}

.notification-icon {
  margin-right: 10px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.system-icon {
  color: var(--el-color-info);
}

.application-icon {
  color: var(--el-color-success);
}

.interview-icon {
  color: var(--el-color-warning);
}

.notification-content {
  flex-grow: 1;
  min-width: 0; /* 防止内容溢出 */
}

.notification-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.notification-item-title {
  font-weight: 500;
  font-size: 14px;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.notification-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.notification-message {
  font-size: 12px;
  color: var(--el-text-color-regular);
  /* autoprefixer: ignore next */
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; /* 显示两行 */
  line-clamp: 2; /* 标准属性 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
}

/* 移动端适配 */
@media (max-width: 768px) {
  :deep(.el-popover.notification-popover) {
    width: 280px !important;
  }

  .notification-item-title {
    max-width: 160px;
  }
}
</style>
