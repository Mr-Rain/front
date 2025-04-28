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
  pages?: number;
  current?: number;
  size?: number;
  records?: T[];
  list?: T[];
  page?: number;
  pageSize?: number;
  totalPages?: number;
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
  // 获取当前登录用户的ID，而不是使用'me'字符串
  return request({
    url: '/api/jobs/company/current',
    method: 'get',
    params,
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
  formData.append('bucket', 'company-licenses'); // 添加bucket参数

  // 生成文件路径：licenses/年月日_随机字符.扩展名
  const ext = file.name.substring(file.name.lastIndexOf('.'));
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 10);
  const path = `licenses/${date}_${randomStr}${ext}`;
  formData.append('path', path);

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
 * 获取企业列表（公开API，只返回已审核通过的企业）
 * @param params 查询参数
 * @returns 企业列表
 */
export function getCompanyList(params: PaginationParams): Promise<{ data: PaginatedResponse<CompanyProfile> }> {
  return request({
    url: '/api/companies/list',
    method: 'get',
    params,
  });
}

/**
 * 获取企业审核列表（管理员API，含所有企业）
 * @param params 查询参数
 * @returns 企业列表
 */
export function getAdminCompanyList(params: PaginationParams): Promise<{ data: PaginatedResponse<CompanyProfile> }> {
  return request({
    url: '/api/admin/companies',
    method: 'get',
    params,
  });
}

/**
 * 获取企业审核列表（管理员API，用于审核页面）
 * @param params 查询参数
 * @returns 企业列表
 */
export function getCompanyAuditList(params: PaginationParams): Promise<{ data: PaginatedResponse<CompanyProfile> }> {
  try {
    return request({
      url: '/api/admin/companies',
      method: 'get',
      params: {
        ...params,
        auditStatus: 'pending' // 只获取待审核的企业
      },
    });
  } catch (error) {
    console.error('获取企业审核列表失败:', error);
    throw error; // 保持错误冒泡，便于上层处理
  }
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

/**
 * 审核通过企业
 * @param companyId 企业ID
 * @param approved 是否通过
 * @param message 审核意见
 * @returns 审核结果
 */
export function approveCompany(
  companyId: string | number,
  approved: boolean,
  message?: string
) {
  try {
    return auditCompany(
      companyId,
      approved ? 'approved' : 'rejected',
      message
    );
  } catch (error) {
    console.error(`企业审核操作失败(ID: ${companyId}):`, error);
    throw error; // 保持错误冒泡，便于上层处理
  }
}