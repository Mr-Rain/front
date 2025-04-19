// src/types/job.d.ts
import type { CompanyProfile } from './company'; // 可以引入简化版的 CompanyInfo

/**
 * 职位类型：全职、兼职、实习
 */
type JobType = '全职' | '兼职' | '实习';

/**
 * 职位状态：开放、关闭、已删除
 */
type JobStatus = 'open' | 'closed' | 'deleted';

/**
 * 职位信息接口
 */
export interface JobInfo {
  id: string | number;
  title: string; // 职位名称
  company_id: string | number; // 所属公司ID
  company_name?: string; // 公司名称 (冗余，方便前端展示)
  company_logo?: string; // 公司Logo (冗余，方便前端展示)
  location: string; // 工作地点 (城市)
  salary_range: string; // 薪资范围 (例如: 10k-20k, 15薪)
  job_type: JobType; // 职位类型
  experience_required: string; // 经验要求 (例如: 不限, 1-3年, 3-5年)
  education_required: string; // 学历要求 (例如: 不限, 大专, 本科, 硕士)
  tags?: string[]; // 职位标签 (例如: 前端, Vue, 技术氛围好)
  description: string; // 职位描述 (Markdown格式)
  requirements: string; // 职位要求 (Markdown格式)
  publish_time?: string; // 发布时间 (ISO 8601 格式)
  status?: JobStatus; // 职位状态
  // 可能需要的其他字段
  // views?: number; // 浏览量
  // applications_count?: number; // 申请人数
  // company_profile?: Partial<CompanyProfile>; // 完整的公司信息 (可选，用于职位详情页)
}

/**
 * 职位列表查询参数接口 (示例)
 */
export interface JobListParams {
  keyword?: string; // 关键词搜索 (职位名称/公司)
  location?: string; // 城市
  job_type?: JobType;
  experience?: string;
  education?: string;
  salary_min?: number;
  salary_max?: number;
  page?: number; // 页码
  pageSize?: number; // 每页数量
  sortBy?: string; // 排序字段 (如 publish_time)
  order?: 'asc' | 'desc'; // 排序方式
} 