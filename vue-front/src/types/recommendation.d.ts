import type { JobInfo } from './job';

/**
 * 推荐结果项接口
 */
export interface RecommendedJob {
  jobInfo: JobInfo; // 包含完整的职位信息
  recommendationScore?: number; // 推荐分数 (可选, 0-1)
  recommendationReason?: string; // 推荐理由 (可选, 例如: 与你的技能匹配度高)
}

/**
 * 推荐列表响应接口
 */
export interface RecommendationResponse {
  list: RecommendedJob[];
  // 可能包含分页信息或推荐ID等
  // total?: number;
  // recommendation_id?: string;
} 