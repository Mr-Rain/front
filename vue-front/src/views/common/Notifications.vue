<template>
  <div class="notifications-page responsive-padding">
    <el-card shadow="never" class="page-card responsive-card">
      <template #header>
        <div class="card-header">
          <div class="header-left-actions">
            <el-button @click="goBackToDashboard" type="primary" plain class="back-button">
              <el-icon class="back-icon"><ArrowLeft /></el-icon>
              <span class="back-text">返回</span>
            </el-button>
            <span class="page-title">消息通知</span>
          </div>
          <div class="header-actions">
            <el-button v-if="hasUnread" type="primary" plain @click="markAllAsRead">
              全部标为已读
            </el-button>
            <el-button type="primary" @click="goToSettings">
              通知设置
            </el-button>
          </div>
        </div>
      </template>

      <div class="notifications-content">
        <!-- 左侧筛选区域 -->
        <div class="filter-sidebar">
          <div class="filter-section">
            <h3 class="filter-title">通知类型</h3>
            <el-menu
              :default-active="currentType || 'all'"
              class="filter-menu"
              @select="handleTypeSelect"
            >
              <el-menu-item index="all">
                <el-icon><Message /></el-icon>
                <span>全部通知</span>
                <el-badge :value="stats.total" class="filter-badge" />
              </el-menu-item>
              <el-menu-item index="system">
                <el-icon><InfoFilled /></el-icon>
                <span>系统通知</span>
                <el-badge :value="stats.system" class="filter-badge" />
              </el-menu-item>
              <el-menu-item index="application">
                <el-icon><Promotion /></el-icon>
                <span>申请通知</span>
                <el-badge :value="stats.application" class="filter-badge" />
              </el-menu-item>
              <el-menu-item index="interview">
                <el-icon><ChatDotRound /></el-icon>
                <span>面试通知</span>
                <el-badge :value="stats.interview" class="filter-badge" />
              </el-menu-item>
            </el-menu>
          </div>

          <div class="filter-section">
            <h3 class="filter-title">通知状态</h3>
            <el-menu
              :default-active="currentStatus"
              class="filter-menu"
              @select="handleStatusSelect"
            >
              <el-menu-item index="all">
                <el-icon><List /></el-icon>
                <span>全部</span>
              </el-menu-item>
              <el-menu-item index="unread">
                <el-icon><View /></el-icon>
                <span>未读</span>
                <el-badge :value="stats.unread" class="filter-badge" />
              </el-menu-item>
              <el-menu-item index="read">
                <el-icon><Check /></el-icon>
                <span>已读</span>
              </el-menu-item>
            </el-menu>
          </div>
        </div>

        <!-- 右侧通知列表 -->
        <div class="notifications-list-container">
          <!-- 搜索框 -->
          <div class="search-container">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索通知..."
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button @click="handleSearch">搜索</el-button>
              </template>
            </el-input>
          </div>

          <!-- 通知列表 -->
          <div v-loading="loading" class="notifications-list">
            <template v-if="notifications.length > 0">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="notification-item"
                :class="{ 'unread': notification.status === 'unread' }"
              >
                <div class="notification-icon">
                  <el-avatar
                    :size="30"
                    :src="notification.senderAvatar || defaultAvatar"
                  />
                </div>
                <div class="notification-content" @click="handleNotificationClick(notification)">
                  <div class="notification-header">
                    <h3 class="notification-title">{{ notification.title }}</h3>
                    <div class="notification-meta">
                      <span class="notification-time">{{ formatTime(notification.createTime) }}</span>
                      <el-tag v-if="notification.priority === 'high'" type="danger" size="small">重要</el-tag>
                      <el-tag v-else-if="notification.priority === 'medium'" type="warning" size="small">一般</el-tag>
                      <el-tag v-else type="info" size="small">普通</el-tag>
                    </div>
                  </div>
                  <div class="notification-message">{{ notification.content }}</div>
                  <div class="notification-footer">
                    <div class="notification-sender">
                      <el-link type="primary" class="sender-name">
                        {{ notification.senderName || '系统' }}
                      </el-link>
                    </div>
                    <div class="notification-actions">
                      <el-button
                        v-if="notification.status === 'unread'"
                        type="success"
                        size="small"
                        @click.stop="markAsRead(notification.id)"
                      >
                        标为已读
                      </el-button>
                      <el-button
                        v-if="notification.link"
                        type="primary"
                        size="small"
                        @click.stop="handleNavigateToLink(notification.link)"
                      >
                        查看详情
                      </el-button>
                      <el-popconfirm
                        title="确定要删除这条通知吗？"
                        @confirm="deleteNotification(notification.id)"
                      >
                        <template #reference>
                          <el-button
                            type="danger"
                            size="small"
                            @click.stop
                          >
                            删除
                          </el-button>
                        </template>
                      </el-popconfirm>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <el-empty v-else description="暂无通知" />
          </div>

          <!-- 分页 -->
          <div class="pagination-container" v-if="total > 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import { usePermissionStore } from '@/stores/permission';
import type { NotificationInfo, NotificationType } from '@/types/notification';
import {
  Message,
  InfoFilled,
  Promotion,
  ChatDotRound,
  Search,
  List,
  View,
  Check,
  ArrowLeft
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { navigateTo } from '@/utils/routeHelper';

const router = useRouter();
const notificationStore = useNotificationStore();
const permissionStore = usePermissionStore();

// 默认头像 URL 或空字符串
const defaultAvatar = ref(''); // 或者是一个默认头像的 URL

const loading = ref(false);
const notifications = ref<NotificationInfo[]>([]);
const total = ref(0);
const stats = ref({
  total: 0,
  unread: 0,
  system: 0,
  application: 0,
  interview: 0
});
const currentPage = ref(1);
const pageSize = ref(10);
const currentType = ref<string | null>(null);
const currentStatus = ref('all');
const searchKeyword = ref('');

// 计算属性
const hasUnread = computed(() => {
  return stats.value.unread > 0;
});

// 初始化
onMounted(async () => {
  // Determine default notification type based on user role
  const userRoles = permissionStore.roles;
  let defaultFilterType: string | null = null;

  if (userRoles && userRoles.length > 0) {
    const primaryRole = userRoles[0].toLowerCase(); // Assuming roles are strings and taking the first as primary

    if (primaryRole === 'student') {
      defaultFilterType = 'application'; // Students might default to application notifications
    } else if (primaryRole === 'company') {
      defaultFilterType = 'application'; // Companies might also default to application notifications
    } else if (primaryRole === 'admin') {
      defaultFilterType = 'system';    // Admins might default to system notifications
    }
  }

  if (defaultFilterType) {
    // If a default type is determined, use handleTypeSelect to apply it.
    // handleTypeSelect will set currentType and trigger fetchNotifications.
    handleTypeSelect(defaultFilterType);
  } else {
    // If no specific default, fetch notifications with the initial global default type (all)
    await fetchNotifications();
  }
});

// 监听页码变化
watch([currentPage, pageSize], () => {
  fetchNotifications();
});

// 获取通知列表
const fetchNotifications = async () => {
  loading.value = true;
  try {
    const response = await notificationStore.fetchNotifications({
      page: currentPage.value,
      limit: pageSize.value,
      keyword: searchKeyword.value || undefined
    });

    if (response) {
      notifications.value = response.list;
      total.value = response.total;
      stats.value = response.stats;
    }
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  } finally {
    loading.value = false;
  }
};

// 处理类型选择
const handleTypeSelect = (index: string) => {
  if (index === 'all') {
    currentType.value = null;
  } else {
    currentType.value = index as NotificationType;
  }

  currentPage.value = 1;
  notificationStore.setCurrentType(currentType.value as NotificationType | null);
  fetchNotifications();
};

// 处理状态选择
const handleStatusSelect = (index: string) => {
  currentStatus.value = index;
  currentPage.value = 1;
  notificationStore.setCurrentStatus(index as 'all' | 'read' | 'unread');
  fetchNotifications();
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchNotifications();
};

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
};

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
};

// 标记为已读
const markAsRead = async (id: string | number) => {
  try {
    await notificationStore.markAsRead(id);
    ElMessage.success('已标记为已读');
    fetchNotifications();
  } catch (error) {
    console.error('Failed to mark as read:', error);
  }
};

// 标记所有为已读
const markAllAsRead = async () => {
  try {
    await notificationStore.markAsRead();
    ElMessage.success('已将所有通知标记为已读');
    fetchNotifications();
  } catch (error) {
    console.error('Failed to mark all as read:', error);
  }
};

// 删除通知
const deleteNotification = async (id: string | number) => {
  try {
    await notificationStore.deleteNotification(id);
    ElMessage.success('通知已删除');
    fetchNotifications();
  } catch (error) {
    console.error('Failed to delete notification:', error);
  }
};

// 处理通知点击
const handleNotificationClick = async (notification: NotificationInfo) => {
  // 跳转到通知详情页面
  router.push(`/notifications/${notification.id}`);
};

// 导航到指定链接 - 使用与项目其他部分一致的简单跳转逻辑
const handleNavigateToLink = async (link: string) => {
  await navigateTo(router, link);
};

// 前往通知设置
const goToSettings = () => {
  router.push('/notification-settings');
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
  const date = new Date(timeStr);
  return date.toLocaleString();
};

const goBackToDashboard = () => {
  const userRoles = permissionStore.roles;
  if (userRoles && userRoles.length > 0) {
    const primaryRole = userRoles[0];
    if (primaryRole === 'student') {
      router.push('/student/dashboard');
    } else if (primaryRole === 'company') {
      router.push('/company/dashboard');
    } else if (primaryRole === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/');
    }
  } else {
    router.push('/');
  }
};
</script>

<style scoped>
.notifications-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-button .back-icon {
  margin-right: 5px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.notifications-content {
  display: flex;
  gap: 20px;
}

/* 左侧筛选区域 */
.filter-sidebar {
  width: 220px;
  flex-shrink: 0;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  padding-left: 10px;
}

.filter-menu {
  border-right: none;
}

.filter-badge {
  margin-left: auto;
  display: flex;
  align-items: center;
  height: 100%;
}

/* 右侧通知列表 */
.notifications-list-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.search-container {
  margin-bottom: 20px;
}

.notifications-list {
  flex-grow: 1;
}

.notification-item {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid var(--el-border-color-lighter);
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
  margin-right: 15px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 40px;
  height: 40px;
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
  cursor: pointer;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.notification-message {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 10px;
  line-height: 1.5;
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.notification-sender {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.notification-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .notifications-content {
    flex-direction: column;
  }

  .filter-sidebar {
    width: 100%;
    margin-bottom: 20px;
  }

  .notification-header {
    flex-direction: column;
  }

  .notification-meta {
    margin-top: -5px;
  }

  .notification-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .notification-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
