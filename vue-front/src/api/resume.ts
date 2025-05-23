import request from '@/utils/request';
import type { ResumeInfo, CreateResumePayload } from '@/types/resume';
import { clearCacheByUrlPrefix } from '@/utils/cacheInterceptor';

/**
 * 获取学生的所有简历列表
 * @param forceRefresh 是否强制刷新缓存
 * @returns 简历列表
 */
export function getResumeList(forceRefresh = false): Promise<{ data: ResumeInfo[] }> {
  return request({
    url: '/api/resumes/me',
    method: 'get',
    cache: {
      forceRefresh: forceRefresh
    }
  });
}

/**
 * 获取单个简历详情
 * @param id 简历ID
 * @returns 简历详情
 */
export function getResumeDetail(id: string | number): Promise<{ data: ResumeInfo }> {
  return request({
    url: `/api/resumes/${id}`,
    method: 'get',
  });
}

/**
 * 创建在线简历
 * @param data 简历信息
 * @returns 创建结果
 */
export function createResume(data: CreateResumePayload) {
  return request({
    url: '/api/resumes',
    method: 'post',
    data,
  }).then(response => {
    clearCacheByUrlPrefix('/api/resumes/me');
    return response;
  });
}

/**
 * 更新在线简历
 * @param id 简历ID
 * @param data 简历信息
 * @returns 更新结果
 */
export function updateResume(id: string | number, data: Partial<CreateResumePayload>) {
  return request({
    url: `/api/resumes/${id}`,
    method: 'put',
    data,
  }).then(response => {
    clearCacheByUrlPrefix('/api/resumes/me');
    clearCacheByUrlPrefix(`/api/resumes/${id}`);
    return response;
  });
}

/**
 * 删除简历
 * @param id 简历ID
 * @returns 删除结果
 */
export function deleteResume(id: string | number) {
  return request({
    url: `/api/resumes/${id}`,
    method: 'delete',
  }).then(response => {
    clearCacheByUrlPrefix('/api/resumes/me');
    clearCacheByUrlPrefix(`/api/resumes/${id}`);
    return response;
  });
}

/**
 * 设置默认简历
 * @param id 简历ID
 * @returns 设置结果
 */
export function setDefaultResume(id: string | number) {
  return request({
    url: `/api/resumes/${id}/default`,
    method: 'put',
  }).then(response => {
    clearCacheByUrlPrefix('/api/resumes/me');
    return response;
  });
}

/**
 * 上传附件简历
 * @param file 简历文件
 * @param title 简历标题
 * @returns 上传结果
 */
export function uploadResumeFile(file: File, title?: string) {
  const formData = new FormData();
  formData.append('file', file);
  if (title) {
    formData.append('title', title);
  }

  return request({
    url: '/api/resumes/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(response => {
    clearCacheByUrlPrefix('/api/resumes/me');
    return response;
  });
}

/**
 * 下载简历
 * @param id 简历ID
 * @returns 下载结果
 */
export function downloadResume(id: string | number) {
  return request({
    url: `/api/resumes/${id}/download`,
    method: 'get',
    responseType: 'blob',
  });
}

/**
 * 导出简历为PDF
 * @param id 简历ID
 * @returns 导出结果
 */
export function exportResumeToPdf(id: string | number) {
  return request({
    url: `/api/resumes/${id}/export`,
    method: 'get',
    responseType: 'blob',
  });
}

/**
 * 检查简历是否存在
 * @param id 简历ID
 * @returns 检查结果
 */
export function checkResumeExists(id: string | number) {
  return request({
    url: `/api/resumes/${id}/exists`,
    method: 'get',
    cache: {
      ttl: 0, // 不缓存
      forceRefresh: true // 强制刷新
    }
  });
}
