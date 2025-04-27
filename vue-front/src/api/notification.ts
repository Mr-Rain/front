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
 * @returns 通知列表
 */
export function getNotifications(params: NotificationQueryParams): Promise<{ data: NotificationListResponse }> {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: getNotifications is using mock data.');
  //
  // // 模拟数据
  // const mockNotifications: NotificationInfo[] = [
  //   {
  //     id: '1',
  //     title: '系统通知',
  //     content: '欢迎使用校园招聘系统',
  //     type: 'system',
  //     status: 'unread',
  //     create_time: new Date().toISOString(),
  //     read_time: undefined,
  //     recipient_id: '1' // 添加必需的 recipient_id 字段
  //   },
  //   {
  //     id: '2',
  //     title: '申请状态更新',
  //     content: '您的申请已被审核通过',
  //     type: 'application',
  //     status: 'read',
  //     create_time: new Date(Date.now() - 86400000).toISOString(), // 1天前
  //     read_time: new Date(Date.now() - 43200000).toISOString(), // 12小时前
  //     recipient_id: '1' // 添加必需的 recipient_id 字段
  //   }
  // ];
  //
  // // 模拟分页
  // const page = params.page || 1;
  // const limit = params.limit || 10;
  // const start = (page - 1) * limit;
  // const end = start + limit;
  //
  // // 模拟筛选
  // let filteredNotifications = [...mockNotifications];
  // if (params.type) {
  //   filteredNotifications = filteredNotifications.filter(n => n.type === params.type);
  // }
  // if (params.status) {
  //   filteredNotifications = filteredNotifications.filter(n => n.status === params.status);
  // }
  //
  // // 模拟分页结果
  // const paginatedNotifications = filteredNotifications.slice(start, end);
  //
  // // 模拟统计
  // const stats = {
  //   total: mockNotifications.length,
  //   unread: mockNotifications.filter(n => n.status === 'unread').length,
  //   system: mockNotifications.filter(n => n.type === 'system').length,
  //   application: mockNotifications.filter(n => n.type === 'application').length,
  //   interview: mockNotifications.filter(n => n.type === 'interview').length
  // };
  //
  // // 返回模拟响应
  // return Promise.resolve({
  //   data: {
  //     list: paginatedNotifications,
  //     total: filteredNotifications.length,
  //     stats
  //   }
  // });

  // 当后端API实现后，取消注释下面的代码
  // /*
  return request({
    url: '/api/notifications',
    method: 'get',
    params
  });
  // */
}

/**
 * 获取未读通知数量
 * @returns 未读通知数量
 */
export function getUnreadCount(): Promise<{ data: { count: number } }> {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: getUnreadCount is using mock data.');
  //
  // // 返回模拟响应
  // return Promise.resolve({
  //   data: {
  //     count: 1 // 模拟有1条未读通知
  //   }
  // });

  // 当后端API实现后，取消注释下面的代码
  // /*
  return request({
    url: '/api/notifications/unread/count',
    method: 'get'
  });
  // */
}

/**
 * 标记通知为已读
 * @param id 通知ID，如果不提供则标记所有通知为已读
 * @returns 标记结果
 */
export function markAsRead(id?: string | number): Promise<{ data: { success: boolean } }> {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: markAsRead is using mock data.');
  //
  // // 返回模拟响应
  // return Promise.resolve({
  //   data: {
  //     success: true
  //   }
  // });

  // 当后端API实现后，取消注释下面的代码
  // /*
  if (id) {
    return request({
      url: `/api/notifications/${id}/read`,
      method: 'put'
    });
  } else {
    return request({
      url: '/api/notifications/read-all',
      method: 'put'
    });
  }
  // */
}

/**
 * 删除通知
 * @param id 通知ID
 * @returns 删除结果
 */
export function deleteNotification(id: string | number): Promise<{ data: { success: boolean } }> {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: deleteNotification is using mock data.');
  //
  // // 返回模拟响应
  // return Promise.resolve({
  //   data: {
  //     success: true
  //   }
  // });

  // 当后端API实现后，取消注释下面的代码
  // /*
  return request({
    url: `/api/notifications/${id}`,
    method: 'delete'
  });
  // */
}

/**
 * 获取通知设置
 * @returns 通知设置
 */
export function getNotificationSettings(): Promise<{ data: {
  enableEmail: boolean;
  enableBrowser: boolean;
  mutedTypes: NotificationType[];
} }> {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: getNotificationSettings is using mock data.');
  //
  // // 返回模拟响应
  // return Promise.resolve({
  //   data: {
  //     enableEmail: true,
  //     enableBrowser: true,
  //     mutedTypes: []
  //   }
  // });

  // 当后端API实现后，取消注释下面的代码
  // /*
  return request({
    url: '/api/notifications/settings',
    method: 'get'
  });
  // */
}

/**
 * 更新通知设置
 * @param settings 通知设置
 * @returns 更新结果
 */
export function updateNotificationSettings(settings: {
  enableEmail?: boolean;
  enableBrowser?: boolean;
  mutedTypes?: NotificationType[];
}): Promise<{ data: { success: boolean } }> {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: updateNotificationSettings is using mock data.');
  //
  // // 返回模拟响应
  // return Promise.resolve({
  //   data: {
  //     success: true
  //   }
  // });

  // 当后端API实现后，取消注释下面的代码
  // /*
  return request({
    url: '/api/notifications/settings',
    method: 'put',
    data: settings
  });
  // */
}
