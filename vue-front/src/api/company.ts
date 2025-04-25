import request from '@/utils/request';
import type { CompanyProfile, CompanyAuditStatus } from '@/types/company';
import type { JobInfo } from '@/types/job';

/**
 * 分页参数类型
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  [key: string]: any;
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T> {
  total: number;
  pages: number;
  current: number;
  size: number;
  records: T[];
}

/**
 * 获取公司详细信息（公开）
 * @param companyId 公司ID
 * @returns 公司详细信息
 */
export function getCompanyDetail(companyId: string | number): Promise<{ data: CompanyProfile }> {
  return request({
    url: `/api/companies/${companyId}`,
    method: 'get',
  });
}

/**
 * 获取当前登录公司的详细信息（私有）
 * @returns 公司详细信息
 */
export function getCompanyProfile(): Promise<{ data: CompanyProfile }> {
  return request({
    url: '/api/companies/me',
    method: 'get',
  });
}

/**
 * 更新公司详细信息
 * @param data 公司信息
 * @returns 更新结果
 */
export function updateCompanyProfile(data: Partial<CompanyProfile>) {
  return request({
    url: '/api/companies/me',
    method: 'put',
    data,
  });
}

/**
 * 获取公司发布的职位列表
 * @param params 查询参数
 * @returns 职位列表
 */
export function getCompanyJobList(params: PaginationParams): Promise<{ data: PaginatedResponse<JobInfo> }> {
  return request({
    url: '/api/jobs',
    method: 'get',
    params: { ...params, companyId: 'me' },
  });
}

/**
 * 上传公司Logo
 * @param file Logo文件
 * @returns 上传结果
 */
export function uploadCompanyLogo(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  return request({
    url: '/api/files/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 上传公司营业执照
 * @param file 营业执照文件
 * @returns 上传结果
 */
export function uploadCompanyLicense(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  return request({
    url: '/api/files/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// --- 管理员API ---

/**
 * 获取企业列表（含待审核）
 * @param params 查询参数
 * @returns 企业列表
 */
export function getCompanyList(params: PaginationParams): Promise<{ data: PaginatedResponse<CompanyProfile> }> {
  return request({
    url: '/api/admin/companies',
    method: 'get',
    params,
  });
}

/**
 * 审核企业
 * @param companyId 企业ID
 * @param auditStatus 审核状态
 * @param auditMessage 审核意见
 * @returns 审核结果
 */
export function auditCompany(
  companyId: string | number,
  auditStatus: Exclude<CompanyAuditStatus, 'pending'>,
  auditMessage?: string
) {
  return request({
    url: `/api/admin/companies/${companyId}/audit`,
    method: 'put',
    data: {
      auditStatus,
      auditMessage
    },
  });
}