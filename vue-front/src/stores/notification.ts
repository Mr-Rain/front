import { defineStore } from 'pinia';
import type { 
  NotificationInfo, 
  NotificationQueryParams, 
  NotificationStats,
  NotificationType
} from '@/types/notification';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings
} from '@/api/notification';
import { ElMessage } from 'element-plus';

interface NotificationState {
  notifications: NotificationInfo[];
  total: number;
  stats: NotificationStats;
  unreadCount: number;
  loading: boolean;
  currentPage: number;
  pageSize: number;
  currentType: NotificationType | null;
  currentStatus: 'all' | 'read' | 'unread';
  settings: {
    enableEmail: boolean;
    enableBrowser: boolean;
    mutedTypes: NotificationType[];
  };
  loadingSettings: boolean;
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: [],
    total: 0,
    stats: {
      total: 0,
      unread: 0,
      system: 0,
      application: 0,
      interview: 0
    },
    unreadCount: 0,
    loading: false,
    currentPage: 1,
    pageSize: 10,
    currentType: null,
    currentStatus: 'all',
    settings: {
      enableEmail: true,
      enableBrowser: true,
      mutedTypes: []
    },
    loadingSettings: false
  }),

  getters: {
    // 获取未读通知数量
    getUnreadCount(): number {
      return this.unreadCount;
    },

    // 获取通知统计信息
    getStats(): NotificationStats {
      return this.stats;
    },

    // 获取通知设置
    getSettings(): {
      enableEmail: boolean;
      enableBrowser: boolean;
      mutedTypes: NotificationType[];
    } {
      return this.settings;
    }
  },

  actions: {
    // 获取通知列表
    async fetchNotifications(params: Partial<NotificationQueryParams> = {}) {
      this.loading = true;
      try {
        // 合并查询参数
        const queryParams: NotificationQueryParams = {
          page: params.page || this.currentPage,
          limit: params.limit || this.pageSize,
          ...params
        };

        // 如果指定了类型，添加到查询参数
        if (this.currentType) {
          queryParams.type = this.currentType;
        }

        // 如果指定了状态，添加到查询参数
        if (this.currentStatus !== 'all') {
          queryParams.status = this.currentStatus === 'read' ? 'read' : 'unread';
        }

        const response = await getNotifications(queryParams);
        this.notifications = response.data.list;
        this.total = response.data.total;
        this.stats = response.data.stats;
        this.currentPage = params.page || this.currentPage;

        return response.data;
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        ElMessage.error('获取通知列表失败');
        return null;
      } finally {
        this.loading = false;
      }
    },

    // 获取未读通知数量
    async fetchUnreadCount() {
      try {
        const response = await getUnreadCount();
        this.unreadCount = response.data.count;
        return response.data.count;
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
        return 0;
      }
    },

    // 标记通知为已读
    async markAsRead(id?: string | number) {
      try {
        await markAsRead(id);
        
        if (id) {
          // 更新单个通知状态
          const index = this.notifications.findIndex(n => n.id === id);
          if (index !== -1) {
            this.notifications[index].status = 'read';
            this.notifications[index].read_time = new Date().toISOString();
          }
        } else {
          // 更新所有通知状态
          this.notifications.forEach(n => {
            n.status = 'read';
            n.read_time = new Date().toISOString();
          });
        }
        
        // 更新未读数量
        await this.fetchUnreadCount();
        
        // 更新统计信息
        this.stats.unread = this.unreadCount;
        
        return true;
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        ElMessage.error('标记通知已读失败');
        return false;
      }
    },

    // 删除通知
    async deleteNotification(id: string | number) {
      try {
        await deleteNotification(id);
        
        // 从列表中移除通知
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
          const notification = this.notifications[index];
          this.notifications.splice(index, 1);
          
          // 更新统计信息
          this.stats.total--;
          
          if (notification.status === 'unread') {
            this.stats.unread--;
            this.unreadCount--;
          }
          
          if (notification.type === 'system') this.stats.system--;
          if (notification.type === 'application') this.stats.application--;
          if (notification.type === 'interview') this.stats.interview--;
        }
        
        return true;
      } catch (error) {
        console.error('Failed to delete notification:', error);
        ElMessage.error('删除通知失败');
        return false;
      }
    },

    // 设置当前筛选类型
    setCurrentType(type: NotificationType | null) {
      this.currentType = type;
      this.currentPage = 1; // 重置页码
      this.fetchNotifications({ page: 1 });
    },

    // 设置当前筛选状态
    setCurrentStatus(status: 'all' | 'read' | 'unread') {
      this.currentStatus = status;
      this.currentPage = 1; // 重置页码
      this.fetchNotifications({ page: 1 });
    },

    // 获取通知设置
    async fetchNotificationSettings() {
      this.loadingSettings = true;
      try {
        const response = await getNotificationSettings();
        this.settings = response.data;
        return response.data;
      } catch (error) {
        console.error('Failed to fetch notification settings:', error);
        ElMessage.error('获取通知设置失败');
        return null;
      } finally {
        this.loadingSettings = false;
      }
    },

    // 更新通知设置
    async updateNotificationSettings(settings: {
      enableEmail?: boolean;
      enableBrowser?: boolean;
      mutedTypes?: NotificationType[];
    }) {
      this.loadingSettings = true;
      try {
        await updateNotificationSettings(settings);
        
        // 更新本地设置
        if (settings.enableEmail !== undefined) {
          this.settings.enableEmail = settings.enableEmail;
        }
        
        if (settings.enableBrowser !== undefined) {
          this.settings.enableBrowser = settings.enableBrowser;
        }
        
        if (settings.mutedTypes !== undefined) {
          this.settings.mutedTypes = settings.mutedTypes;
        }
        
        ElMessage.success('通知设置更新成功');
        return true;
      } catch (error) {
        console.error('Failed to update notification settings:', error);
        ElMessage.error('更新通知设置失败');
        return false;
      } finally {
        this.loadingSettings = false;
      }
    },

    // 重置通知状态
    resetNotifications() {
      this.notifications = [];
      this.total = 0;
      this.stats = {
        total: 0,
        unread: 0,
        system: 0,
        application: 0,
        interview: 0
      };
      this.unreadCount = 0;
      this.currentPage = 1;
      this.currentType = null;
      this.currentStatus = 'all';
    }
  }
});
