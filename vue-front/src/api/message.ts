import request from '@/utils/request';
import type { PaginatedResponse, PaginationParams } from './company';

/**
 * 消息类型
 */
export interface MessageInfo {
  id: string | number;
  userId: string | number;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createTime: string;
  readTime?: string;
  relatedId?: string | number;
  relatedType?: string;
}

/**
 * 获取消息列表
 * @param params 查询参数
 * @returns 消息列表
 */
export function getMessageList(params?: PaginationParams): Promise<{ data: PaginatedResponse<MessageInfo> }> {
  return request({
    url: '/api/messages',
    method: 'get',
    params,
  });
}

/**
 * 获取未读消息数量
 * @returns 未读消息数量
 */
export function getUnreadMessageCount(): Promise<{ data: { count: number } }> {
  return request({
    url: '/api/messages/unread/count',
    method: 'get',
  });
}

/**
 * 标记消息为已读
 * @param id 消息ID
 * @returns 标记结果
 */
export function markMessageAsRead(id: string | number): Promise<any> {
  return request({
    url: `/api/messages/${id}/read`,
    method: 'put',
  });
}

/**
 * 标记所有消息为已读
 * @returns 标记结果
 */
export function markAllMessagesAsRead(): Promise<any> {
  return request({
    url: '/api/messages/read/all',
    method: 'put',
  });
}

/**
 * 删除消息
 * @param id 消息ID
 * @returns 删除结果
 */
export function deleteMessage(id: string | number): Promise<any> {
  return request({
    url: `/api/messages/${id}`,
    method: 'delete',
  });
}

/**
 * 发送消息
 * @param data 消息内容
 * @returns 发送结果
 */
export function sendMessage(data: {
  recipient_id: string | number;
  title: string;
  content: string;
  type?: string;
}): Promise<any> {
  return request({
    url: '/api/messages',
    method: 'post',
    data,
  });
}
