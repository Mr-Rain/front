import request from '@/utils/request';

/**
 * 统计数据类型
 */
export interface StatisticsData {
  [key: string]: any;
}

/**
 * API响应类型
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 获取系统概览统计数据
 * @returns 系统概览统计数据
 */
export function getSystemOverview(): Promise<ApiResponse<StatisticsData>> {
  return request({
    url: '/api/admin/stats',
    method: 'get',
    cache: {
      ttl: 5 * 60 * 1000, // 5分钟缓存
      tags: ['admin-stats', 'dashboard'],
      backgroundRefresh: true // 返回缓存数据的同时在后台刷新
    }
  });
}

/**
 * 获取用户统计数据
 * @param params 查询参数
 * @returns 用户统计数据
 */
export function getUserStatistics(params?: any): Promise<ApiResponse<StatisticsData>> {
  return request({
    url: '/api/admin/statistics/users',
    method: 'get',
    params,
  });
}

/**
 * 获取职位统计数据
 * @param params 查询参数
 * @returns 职位统计数据
 */
export function getJobStatistics(params?: any): Promise<ApiResponse<StatisticsData>> {
  return request({
    url: '/api/admin/statistics/jobs',
    method: 'get',
    params,
  });
}

/**
 * 获取申请统计数据
 * @param params 查询参数
 * @returns 申请统计数据
 */
export function getApplicationStatistics(params?: any): Promise<ApiResponse<StatisticsData>> {
  return request({
    url: '/api/admin/statistics/applications',
    method: 'get',
    params,
  });
}

/**
 * 获取企业统计数据
 * @param params 查询参数，支持time_range（week/month/year/custom）和days（自定义天数）
 * @returns 企业统计数据
 */
export function getCompanyStatistics(params?: any): Promise<ApiResponse<StatisticsData>> {
  return request({
    url: '/api/company/statistics',
    method: 'get',
    params,
  });
}

/**
 * 获取企业端仪表盘统计数据
 * @returns 企业端仪表盘统计数据
 */
export function getCompanyDashboardStatistics(): Promise<ApiResponse<StatisticsData>> {
  return request({
    url: '/api/company/statistics',
    method: 'get',
    params: { time_range: 'week' }
  });
}

/**
 * 获取学生端统计数据
 * @returns 学生端统计数据
 */
export function getStudentDashboardStatistics(): Promise<ApiResponse<StatisticsData>> {
  return request({
    url: '/api/student/statistics/dashboard',
    method: 'get',
  });
}
