import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { SystemAnnouncementDTO, CreateSystemAnnouncementRequest, UpdateSystemAnnouncementRequest, SystemAnnouncementQueryRequest } from '@/types/api/announcement'; // 假设类型定义在types目录下
import type { PageResult } from '@/types/api/common'; // 通用分页结果类型

const API_PREFIX = '/admin/announcements';

/**
 * 创建系统公告
 * @param data 创建公告的请求体
 */
export function createSystemAnnouncement(data: CreateSystemAnnouncementRequest): AxiosPromise<SystemAnnouncementDTO> {
  return request({
    url: `${API_PREFIX}`,
    method: 'post',
    data,
  });
}

/**
 * 获取系统公告列表（分页）
 * @param params 查询参数
 */
export function getSystemAnnouncements(params: SystemAnnouncementQueryRequest): AxiosPromise<PageResult<SystemAnnouncementDTO>> {
  return request({
    url: `${API_PREFIX}`,
    method: 'get',
    params,
  });
}

/**
 * 根据ID获取系统公告
 * @param announcementId 公告ID
 */
export function getSystemAnnouncementById(announcementId: number | string): AxiosPromise<SystemAnnouncementDTO> {
  return request({
    url: `${API_PREFIX}/${announcementId}`,
    method: 'get',
  });
}

/**
 * 更新系统公告
 * @param announcementId 公告ID
 * @param data 更新公告的请求体
 */
export function updateSystemAnnouncement(announcementId: number | string, data: UpdateSystemAnnouncementRequest): AxiosPromise<SystemAnnouncementDTO> {
  return request({
    url: `${API_PREFIX}/${announcementId}`,
    method: 'put',
    data,
  });
}

/**
 * 删除系统公告
 * @param announcementId 公告ID
 */
export function deleteSystemAnnouncement(announcementId: number | string): AxiosPromise<void> {
  return request({
    url: `${API_PREFIX}/${announcementId}`,
    method: 'delete',
  });
} 