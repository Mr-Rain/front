import request from '@/utils/request';
import type { JobInfo } from '@/types/job';
import type { CompanyProfile } from '@/types/company';
import type { StudentProfile } from '@/types/student';

// 搜索结果类型
export interface SearchResult {
  jobs?: JobInfo[];
  companies?: CompanyProfile[];
  students?: StudentProfile[];
  total: number;
}

// 搜索类型
export type SearchType = 'all' | 'job' | 'company' | 'student';

// 搜索参数
export interface SearchParams {
  keyword: string;
  type?: SearchType;
  page?: number;
  pageSize?: number;
  filters?: Record<string, any>; // 高级筛选条件
}

// 搜索历史记录
export interface SearchHistory {
  id: string | number;
  keyword: string;
  type: SearchType;
  timestamp: string;
}

// 全局搜索
export function globalSearch(params: SearchParams): Promise<{ data: SearchResult }> {
  // 构建查询参数，将filters对象展开到顶层
  const queryParams = {
    keyword: params.keyword,
    type: params.type || 'all',
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    ...params.filters // 展开筛选条件到顶层
  };

  return request({
    url: '/api/search',
    method: 'get',
    params: queryParams
  });
}

// 获取搜索建议
export function getSearchSuggestions(keyword: string): Promise<{ data: string[] }> {
  return request({
    url: '/api/search/suggestions',
    method: 'get',
    params: { keyword }
  });
}

// 获取搜索历史
export function getSearchHistory(): Promise<{ data: SearchHistory[] }> {
  return request({
    url: '/api/search/history',
    method: 'get'
  });
}

// 保存搜索历史
export function saveSearchHistory(keyword: string, type: SearchType = 'all'): Promise<{ success: boolean }> {
  return request({
    url: '/api/search/history',
    method: 'post',
    data: { keyword, type }
  });
}

// 删除单条搜索历史
export function deleteSearchHistory(historyId: string | number): Promise<{ success: boolean }> {
  return request({
    url: `/api/search/history/${historyId}`,
    method: 'delete'
  });
}

// 获取分类搜索历史
export function getSearchHistoryByType(type: SearchType): Promise<{ data: SearchHistory[] }> {
  return request({
    url: `/api/search/history/type/${type}`,
    method: 'get'
  });
}

// 清除搜索历史
export function clearSearchHistory(): Promise<{ success: boolean }> {
  return request({
    url: '/api/search/history',
    method: 'delete'
  });
}
