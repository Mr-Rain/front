/**
 * 通知类型：系统通知、申请通知、面试通知
 */
export type NotificationType = 'system' | 'application' | 'interview';

/**
 * 通知状态：未读、已读
 */
export type NotificationStatus = 'unread' | 'read';

/**
 * 通知优先级：高、中、低
 */
export type NotificationPriority = 'high' | 'medium' | 'low';

/**
 * 通知信息接口
 * 统一使用驼峰命名法
 */
export interface NotificationInfo {
  id: string | number;
  title: string;
  content: string;
  type: NotificationType;
  status: NotificationStatus;
  priority?: NotificationPriority;
  createTime: string;
  readTime?: string;
  senderId?: string | number;
  senderName?: string;
  senderAvatar?: string;
  recipientId: string | number;
  link?: string; // 点击通知跳转的链接
  data?: any; // 附加数据，可用于特定类型通知的额外信息
}

/**
 * 通知统计信息
 */
export interface NotificationStats {
  total: number;
  unread: number;
  system: number;
  application: number;
  interview: number;
}

/**
 * 通知查询参数
 */
export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  status?: NotificationStatus;
  keyword?: string;
}

/**
 * 通知列表响应
 */
export interface NotificationListResponse {
  list: NotificationInfo[];
  total: number;
  stats: NotificationStats;
}
