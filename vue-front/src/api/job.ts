import request from '@/utils/request';
import type { JobInfo, JobListParams, JobStatus } from '@/types/job';
import type { PaginatedResponse, PaginationParams } from './company';

/**
 * 创建职位请求参数类型
 */
export interface CreateJobPayload {
  title: string;
  location: string;
  salary_range: string;
  job_type: string;
  experience_required: string;
  education_required: string;
  tags: string[];
  benefits: string[];
  description: string;
  requirements: string;
}

/**
 * 获取职位列表
 * @param params 查询参数
 * @returns 职位列表
 */
export function getJobList(params: JobListParams): Promise<{ data: PaginatedResponse<JobInfo> }> {
  return request({
    url: '/api/jobs',
    method: 'get',
    params,
  });
}

/**
 * 获取职位详情
 * @param id 职位ID
 * @returns 职位详情
 */
export function getJobDetail(id: string | number): Promise<{ data: JobInfo }> {
  return request({
    url: `/api/jobs/${id}`,
    method: 'get',
  });
}

/**
 * 获取推荐职位列表
 * @param params 查询参数
 * @returns 推荐职位列表
 */
export function getRecommendedJobs(params: PaginationParams): Promise<{ data: PaginatedResponse<JobInfo> }> {
  return request({
    url: '/api/jobs/recommended',
    method: 'get',
    params,
  });
}

/**
 * 搜索职位
 * @param keyword 关键词
 * @param params 查询参数
 * @returns 搜索结果
 */
export function searchJobs(keyword: string, params: PaginationParams): Promise<{ data: PaginatedResponse<JobInfo> }> {
  return request({
    url: '/api/jobs/search',
    method: 'get',
    params: { ...params, keyword },
  });
}

/**
 * 获取指定企业的职位列表
 * @param companyId 企业ID
 * @param params 查询参数
 * @returns 职位列表
 */
export function getJobsByCompany(companyId: string | number, params: PaginationParams): Promise<{ data: PaginatedResponse<JobInfo> }> {
  return request({
    url: `/api/jobs/company/${companyId}`,
    method: 'get',
    params,
  });
}

// --- 企业端API ---

/**
 * 创建职位
 * @param data 职位信息
 * @returns 创建结果
 */
export function createJob(data: CreateJobPayload) {
  return request({
    url: '/api/jobs',
    method: 'post',
    data,
  });
}

/**
 * 更新职位
 * @param id 职位ID
 * @param data 职位信息
 * @returns 更新结果
 */
export function updateJob(id: string | number, data: Partial<CreateJobPayload>) {
  return request({
    url: `/api/jobs/${id}`,
    method: 'put',
    data,
  });
}

/**
 * 删除职位
 * @param id 职位ID
 * @returns 删除结果
 */
export function deleteJob(id: string | number) {
  return request({
    url: `/api/jobs/${id}`,
    method: 'delete',
  });
}

/**
 * 更新职位状态
 * @param jobId 职位ID
 * @param status 状态
 * @returns 更新结果
 */
export function updateJobStatus(jobId: string | number, status: JobStatus): Promise<any> {
  return request({
    url: `/api/jobs/${jobId}/status`,
    method: 'put',
    data: { status },
  });
}