/**
 * 通用分页结果类型
 */
export interface PageResult<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
}

/**
 * 通用ID请求参数
 */
export interface IdRequest {
  id: number | string;
} 