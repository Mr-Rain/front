import request from '@/utils/request';
import type { 
  NotificationInfo, 
  NotificationQueryParams, 
  NotificationListResponse,
  NotificationType
} from '@/types/notification';

/**
 * 获取通知列表
 * @param params 查询参数
 */
export function getNotifications(params: NotificationQueryParams): Promise<{ data: NotificationListResponse }> {
  // return request({
  //   url: '/api/notifications',
  //   method: 'get',
  //   params
  // });

  // ---- Mock Data Start ----
  console.warn('API MOCK: getNotifications is using mock data.');
  
  // 模拟通知数据
  const mockNotifications: NotificationInfo[] = [
    {
      id: 1,
      title: '系统通知：平台更新公告',
      content: '亲爱的用户，我们的平台已更新到最新版本，新增了多项功能，欢迎体验！',
      type: 'system',
      status: 'unread',
      priority: 'medium',
      create_time: '2023-12-01T10:30:00Z',
      recipient_id: 1,
      link: '/announcements/1'
    },
    {
      id: 2,
      title: '申请状态更新：前端开发工程师',
      content: '您申请的"前端开发工程师"职位已被查看，请等待进一步通知。',
      type: 'application',
      status: 'unread',
      priority: 'high',
      create_time: '2023-12-02T14:20:00Z',
      recipient_id: 1,
      sender_id: 101,
      sender_name: '示例科技有限公司',
      sender_avatar: 'https://via.placeholder.com/40',
      link: '/student/applications/1'
    },
    {
      id: 3,
      title: '面试邀请：UI设计师',
      content: '恭喜您通过初筛，我们诚邀您参加"UI设计师"职位的面试，请查看详情安排时间。',
      type: 'interview',
      status: 'read',
      priority: 'high',
      create_time: '2023-12-03T09:15:00Z',
      read_time: '2023-12-03T10:20:00Z',
      recipient_id: 1,
      sender_id: 102,
      sender_name: '创意设计工作室',
      sender_avatar: 'https://via.placeholder.com/40',
      link: '/student/applications/2'
    },
    {
      id: 4,
      title: '系统通知：账号安全提醒',
      content: '我们检测到您的账号在新设备上登录，如非本人操作，请立即修改密码。',
      type: 'system',
      status: 'read',
      priority: 'high',
      create_time: '2023-12-04T18:45:00Z',
      read_time: '2023-12-04T19:10:00Z',
      recipient_id: 1,
      link: '/account/security'
    },
    {
      id: 5,
      title: '申请结果：后端开发工程师',
      content: '很遗憾，您申请的"后端开发工程师"职位未能通过筛选，感谢您的关注。',
      type: 'application',
      status: 'unread',
      priority: 'medium',
      create_time: '2023-12-05T11:30:00Z',
      recipient_id: 1,
      sender_id: 103,
      sender_name: '科技创新公司',
      sender_avatar: 'https://via.placeholder.com/40',
      link: '/student/applications/3'
    }
  ];

  // 模拟分页和筛选
  let filteredNotifications = [...mockNotifications];
  
  // 按类型筛选
  if (params.type) {
    filteredNotifications = filteredNotifications.filter(n => n.type === params.type);
  }
  
  // 按状态筛选
  if (params.status) {
    filteredNotifications = filteredNotifications.filter(n => n.status === params.status);
  }
  
  // 按关键词筛选
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    filteredNotifications = filteredNotifications.filter(n => 
      n.title.toLowerCase().includes(keyword) || 
      n.content.toLowerCase().includes(keyword)
    );
  }
  
  // 计算总数
  const total = filteredNotifications.length;
  
  // 分页
  const page = params.page || 1;
  const limit = params.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit;
  const pagedNotifications = filteredNotifications.slice(start, end);
  
  // 统计信息
  const stats = {
    total: mockNotifications.length,
    unread: mockNotifications.filter(n => n.status === 'unread').length,
    system: mockNotifications.filter(n => n.type === 'system').length,
    application: mockNotifications.filter(n => n.type === 'application').length,
    interview: mockNotifications.filter(n => n.type === 'interview').length
  };
  
  // 模拟响应
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          list: pagedNotifications,
          total,
          stats
        }
      });
    }, 300);
  });
  // ---- Mock Data End ----
}

/**
 * 获取未读通知数量
 */
export function getUnreadCount(): Promise<{ data: { count: number } }> {
  // return request({
  //   url: '/api/notifications/unread/count',
  //   method: 'get'
  // });

  // ---- Mock Data Start ----
  console.warn('API MOCK: getUnreadCount is using mock data.');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          count: 3 // 模拟有3条未读通知
        }
      });
    }, 200);
  });
  // ---- Mock Data End ----
}

/**
 * 标记通知为已读
 * @param id 通知ID，如果不提供则标记所有通知为已读
 */
export function markAsRead(id?: string | number): Promise<{ data: { success: boolean } }> {
  // if (id) {
  //   return request({
  //     url: `/api/notifications/${id}/read`,
  //     method: 'put'
  //   });
  // } else {
  //   return request({
  //     url: '/api/notifications/read-all',
  //     method: 'put'
  //   });
  // }

  // ---- Mock Data Start ----
  console.warn(`API MOCK: markAsRead(${id}) is using mock data.`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          success: true
        }
      });
    }, 200);
  });
  // ---- Mock Data End ----
}

/**
 * 删除通知
 * @param id 通知ID
 */
export function deleteNotification(id: string | number): Promise<{ data: { success: boolean } }> {
  // return request({
  //   url: `/api/notifications/${id}`,
  //   method: 'delete'
  // });

  // ---- Mock Data Start ----
  console.warn(`API MOCK: deleteNotification(${id}) is using mock data.`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          success: true
        }
      });
    }, 200);
  });
  // ---- Mock Data End ----
}

/**
 * 获取通知设置
 */
export function getNotificationSettings(): Promise<{ data: { 
  enableEmail: boolean;
  enableBrowser: boolean;
  mutedTypes: NotificationType[];
} }> {
  // return request({
  //   url: '/api/notifications/settings',
  //   method: 'get'
  // });

  // ---- Mock Data Start ----
  console.warn('API MOCK: getNotificationSettings is using mock data.');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          enableEmail: true,
          enableBrowser: true,
          mutedTypes: []
        }
      });
    }, 200);
  });
  // ---- Mock Data End ----
}

/**
 * 更新通知设置
 */
export function updateNotificationSettings(settings: {
  enableEmail?: boolean;
  enableBrowser?: boolean;
  mutedTypes?: NotificationType[];
}): Promise<{ data: { success: boolean } }> {
  // return request({
  //   url: '/api/notifications/settings',
  //   method: 'put',
  //   data: settings
  // });

  // ---- Mock Data Start ----
  console.warn('API MOCK: updateNotificationSettings is using mock data.');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          success: true
        }
      });
    }, 200);
  });
  // ---- Mock Data End ----
}
