import request from '@/utils/request';
import { PaginatedResponse, PaginationParams } from './company';

/**
 * 反馈信息类型
 */
export interface FeedbackInfo {
  id: string | number;
  user_id: string | number;
  user_name?: string;
  user_email?: string;
  type: string;
  title: string;
  content: string;
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
  create_time: string;
  update_time?: string;
  response?: string;
  response_time?: string;
  attachments?: Array<{
    id: string | number;
    name: string;
    url: string;
  }>;
}

/**
 * 提交反馈
 * @param data 反馈信息
 * @returns 提交结果
 */
export function submitFeedback(data: {
  type: string;
  title: string;
  content: string;
  attachments?: File[];
}): Promise<{ data: { id: string | number } }> {
  const formData = new FormData();
  formData.append('type', data.type);
  formData.append('title', data.title);
  formData.append('content', data.content);
  
  if (data.attachments && data.attachments.length > 0) {
    data.attachments.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });
  }
  
  return request({
    url: '/api/feedback',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 获取我的反馈列表
 * @param params 查询参数
 * @returns 反馈列表
 */
export function getMyFeedbackList(params?: PaginationParams): Promise<{ data: PaginatedResponse<FeedbackInfo> }> {
  return request({
    url: '/api/feedback/me',
    method: 'get',
    params,
  });
}

/**
 * 获取反馈详情
 * @param id 反馈ID
 * @returns 反馈详情
 */
export function getFeedbackDetail(id: string | number): Promise<{ data: FeedbackInfo }> {
  return request({
    url: `/api/feedback/${id}`,
    method: 'get',
  });
}

/**
 * 更新反馈
 * @param id 反馈ID
 * @param data 反馈信息
 * @returns 更新结果
 */
export function updateFeedback(id: string | number, data: {
  title?: string;
  content?: string;
  status?: string;
}): Promise<{ data: { success: boolean } }> {
  return request({
    url: `/api/feedback/${id}`,
    method: 'put',
    data,
  });
}

/**
 * 删除反馈
 * @param id 反馈ID
 * @returns 删除结果
 */
export function deleteFeedback(id: string | number): Promise<{ data: { success: boolean } }> {
  return request({
    url: `/api/feedback/${id}`,
    method: 'delete',
  });
}

/**
 * (管理员) 获取所有反馈列表
 * @param params 查询参数
 * @returns 反馈列表
 */
export function getAllFeedbackList(params?: PaginationParams & {
  status?: string;
  type?: string;
  keyword?: string;
}): Promise<{ data: PaginatedResponse<FeedbackInfo> }> {
  return request({
    url: '/api/admin/feedback',
    method: 'get',
    params,
  });
}

/**
 * (管理员) 回复反馈
 * @param id 反馈ID
 * @param data 回复信息
 * @returns 回复结果
 */
export function replyFeedback(id: string | number, data: {
  response: string;
  status: 'processing' | 'resolved' | 'rejected';
}): Promise<{ data: { success: boolean } }> {
  return request({
    url: `/api/admin/feedback/${id}/reply`,
    method: 'post',
    data,
  });
}
