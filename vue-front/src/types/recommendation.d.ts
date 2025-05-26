import type { JobInfo } from './job';

/**
 * 推荐结果DTO接口 - 与后端RecommendationDTO保持一致
 */
export interface RecommendationDTO {
  /**
   * 推荐ID
   */
  id: number;

  /**
   * 学生ID
   */
  studentId: number;

  /**
   * 学生姓名
   */
  studentName?: string;

  /**
   * 职位ID
   */
  jobId: number;

  /**
   * 职位标题
   */
  jobTitle: string;

  /**
   * 职位薪资范围
   */
  salaryRange: string;

  /**
   * 工作地点
   */
  jobLocation: string;

  /**
   * 经验要求
   */
  experienceRequired: string;

  /**
   * 学历要求
   */
  educationRequired: string;

  /**
   * 职位标签
   */
  tags: string[];

  /**
   * 工作类型
   */
  jobType: string;

  /**
   * 企业ID
   */
  companyId: number;

  /**
   * 企业名称
   */
  companyName: string;

  /**
   * 企业Logo
   */
  companyLogo?: string;

  /**
   * 推荐分数
   */
  score: number;

  /**
   * 推荐理由
   */
  reason: string;

  /**
   * 创建时间
   */
  createdAt: string;

  /**
   * 是否已申请
   */
  hasApplied: boolean;

  /**
   * 是否已反馈
   */
  hasFeedback: boolean;
}

/**
 * 推荐结果项接口 - 兼容旧版本，同时支持新的DTO格式
 */
export interface RecommendedJob {
  // 新格式：直接使用DTO字段
  id?: number;
  studentId?: number;
  studentName?: string;
  jobId?: number;
  jobTitle?: string;
  salaryRange?: string;
  jobLocation?: string;
  experienceRequired?: string;
  educationRequired?: string;
  tags?: string[];
  jobType?: string;
  companyId?: number;
  companyName?: string;
  companyLogo?: string;
  score?: number;
  reason?: string;
  createdAt?: string;
  hasApplied?: boolean;
  hasFeedback?: boolean;

  // 旧格式：保持向后兼容
  jobInfo?: JobInfo; // 包含完整的职位信息
  recommendationScore?: number; // 推荐分数 (可选, 0-1)
  recommendationReason?: string; // 推荐理由 (可选, 例如: 与你的技能匹配度高)
}

/**
 * 推荐列表响应接口
 */
export interface RecommendationResponse {
  list: RecommendationDTO[]; // 使用新的DTO格式
  total?: number;
  page?: number;
  pageSize?: number;
}