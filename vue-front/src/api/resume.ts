import request from '@/utils/request';
import type { ResumeInfo, CreateResumePayload } from '@/types/resume';

/**
 * 获取学生的所有简历列表
 * @returns 简历列表
 */
export function getResumeList(): Promise<{ data: ResumeInfo[] }> {
  return request({
    url: '/api/resumes',
    method: 'get',
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
    method: 'post',
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
