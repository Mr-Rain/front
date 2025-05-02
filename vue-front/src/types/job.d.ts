// src/types/job.d.ts
import type { CompanyProfile } from './company'; // 可以引入简化版的 CompanyInfo

/**
 * 职位类型：全职、兼职、实习
 */
type JobType = '全职' | '兼职' | '实习';

/**
 * 职位状态：开放、关闭、已删除、全部、空字符串(表示所有状态)
 */
type JobStatus = 'open' | 'closed' | 'deleted' | 'all' | '';

/**
 * 职位信息接口
 * 统一使用驼峰命名法
 */
export interface JobInfo {
  id: string | number;
  title: string; // 职位名称
  companyId: string | number; // 所属公司ID
  companyName?: string; // 公司名称 (冗余，方便前端展示)
  companyLogo?: string; // 公司Logo (冗余，方便前端展示)
  location: string; // 工作地点 (城市)
  salaryRange: string; // 薪资范围 (例如: 10k-20k, 15薪)
  jobType: JobType; // 职位类型
  experienceRequired: string; // 经验要求 (例如: 不限, 1-3年, 3-5年)
  educationRequired: string; // 学历要求 (例如: 不限, 大专, 本科, 硕士)
  tags?: string[]; // 职位标签 (例如: 前端, Vue, 技术氛围好)
  benefits?: string[]; // 工作福利 (例如: 五险一金, 带薪年假, 弹性工作)
  description: string; // 职位描述 (Markdown格式)
  requirements: string; // 职位要求 (Markdown格式)
  publishTime?: string; // 发布时间 (ISO 8601 格式)
  status?: JobStatus; // 职位状态
  // 可能需要的其他字段
  views?: number; // 浏览量
  applicationsCount?: number; // 申请人数
  companyProfile?: Partial<CompanyProfile>; // 完整的公司信息 (可选，用于职位详情页)
}

/**
 * 职位列表查询参数接口 (示例)
 * 统一使用驼峰命名法
 */
export interface JobListParams {
  keyword?: string; // 关键词搜索 (职位名称/公司)
  location?: string; // 城市
  jobType?: JobType;
  experience?: string;
  education?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number; // 页码
  pageSize?: number; // 每页数量
  sortBy?: string; // 排序字段 (如 publishTime)
  order?: 'asc' | 'desc'; // 排序方式
  status?: JobStatus; // 职位状态筛选
  _allStatus?: boolean; // 内部标记，表示是否是"所有状态"请求
}