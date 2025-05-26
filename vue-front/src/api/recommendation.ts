import request from '@/utils/request';
import type { RecommendationResponse, RecommendationDTO } from '@/types/recommendation';
import type { JobInfo, JobStatus } from '@/types/job';
import { ApiErrorCode, ErrorType, createApiError } from '@/types/error';

/**
 * 重新生成推荐职位
 *
 * @returns 操作结果
 */
export async function regenerateRecommendations(): Promise<{ success: boolean }> {
  try {
    await request({
      url: '/api/recommendations/regenerate',
      method: 'post'
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to regenerate recommendations:', error);

    // 创建特定的API错误
    const apiError = createApiError(
      ApiErrorCode.BUSINESS_ERROR,
      '重新生成推荐职位失败',
      ErrorType.BUSINESS,
      { originalError: error }
    );

    // 重新抛出错误，让调用者处理
    throw apiError;
  }
}

/**
 * (学生端) 获取个性化推荐职位列表
 *
 * @param params 查询参数，包含recommendationType(推荐类型)、page(页码)、pageSize(每页数量)
 * @returns 推荐职位列表
 */
export async function getRecommendedJobs(params?: {
  recommendationType?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: RecommendationResponse }> {
  try {
    const response = await request({
      url: '/api/recommendations',
      method: 'get',
      params: {
        recommendationType: params?.recommendationType || 'default',
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    });

    // 将后端返回的数据格式转换为前端期望的格式
    if (response.data && Array.isArray(response.data)) {
      // 如果response.data是数组，直接使用
      const recommendations = response.data.map((item: any) => ({
        jobInfo: {
          id: item.jobId,
          title: item.jobTitle || '未知职位',
          companyId: item.companyId,
          companyName: item.companyName || '未知公司',
          companyLogo: item.companyLogo,
          location: item.jobLocation || '未知地点',
          salaryRange: item.salaryRange || '薪资面议',
          experienceRequired: item.experienceRequired || '不限',
          educationRequired: item.educationRequired || '不限',
          tags: item.tags || [],
          jobType: item.jobType || '全职',
          description: item.description || '',
          requirements: item.requirements || '',
          status: (item.status || 'open') as JobStatus // 默认状态
        },
        recommendationScore: item.score,
        recommendationReason: item.reason
      }));

      return {
        data: {
          list: recommendations
        }
      };
    } else if (response.data && response.data.list && Array.isArray(response.data.list)) {
      // 如果response.data包含list属性且是数组
      const recommendations = response.data.list.map((item: any) => ({
        jobInfo: {
          id: item.jobId,
          title: item.jobTitle || '未知职位',
          companyId: item.companyId,
          companyName: item.companyName || '未知公司',
          companyLogo: item.companyLogo,
          location: item.jobLocation || '未知地点',
          salaryRange: item.salaryRange || '薪资面议',
          experienceRequired: item.experienceRequired || '不限',
          educationRequired: item.educationRequired || '不限',
          tags: item.tags || [],
          jobType: item.jobType || '全职',
          description: item.description || '',
          requirements: item.requirements || '',
          status: (item.status || 'open') as JobStatus // 默认状态
        },
        recommendationScore: item.score,
        recommendationReason: item.reason
      }));

      return {
        data: {
          list: recommendations
        }
      };
    } else {
      // 如果数据结构不符合预期，返回空数组
      console.warn('Unexpected response format:', response.data);
      return {
        data: {
          list: []
        }
      };
    }
  } catch (error) {
    console.error('Failed to fetch recommended jobs:', error);

    // 创建特定的API错误
    const apiError = createApiError(
      ApiErrorCode.BUSINESS_ERROR,
      '获取推荐职位失败',
      ErrorType.BUSINESS,
      { originalError: error }
    );

    // 重新抛出错误，让调用者处理
    throw apiError;
  }
}

/**
 * 获取推荐场景列表
 *
 * @returns 推荐场景列表
 */
export async function getRecommendationScenarios(): Promise<{ data: { scenarios: Array<{id: string, name: string}> } }> {
  try {
    const response = await request({
      url: '/api/recommendations/scenarios',
      method: 'get'
    });

    // 后端返回格式：{ code: 200, message: "success", data: [{ id: "default", name: "智能推荐" }, ...] }
    // 前端期望格式：{ data: { scenarios: [{ id: "default", name: "智能推荐" }, ...] } }

    if (response.data && Array.isArray(response.data)) {
      // 转换为前端期望的格式
      return {
        data: {
          scenarios: response.data.map((item: any) => ({
            id: item.id,
            name: item.name
          }))
        }
      };
    }

    // 如果后端返回格式不符合预期，返回默认场景
    console.warn('后端返回的推荐场景格式不符合预期，使用默认场景');
    return {
      data: {
        scenarios: [
          { id: 'default', name: '智能推荐' },
          { id: 'skill-based', name: '基于技能' },
          { id: 'history-based', name: '基于浏览历史' }
        ]
      }
    };
  } catch (error) {
    console.error('Failed to fetch recommendation scenarios:', error);

    // 发生错误时返回默认场景，确保前端功能正常
    console.warn('获取推荐场景失败，使用默认场景');
    return {
      data: {
        scenarios: [
          { id: 'default', name: '智能推荐' },
          { id: 'skill-based', name: '基于技能' },
          { id: 'history-based', name: '基于浏览历史' }
        ]
      }
    };
  }
}

/**
 * 反馈推荐结果
 *
 * @param data 反馈数据，包含jobId(职位ID)、feedbackType(反馈类型)、reason(反馈理由)
 * @returns 操作结果
 */
export async function feedbackRecommendation(data: {
  jobId: string | number,
  feedbackType: 'like' | 'dislike',
  reason?: string
}): Promise<{ success: boolean }> {
  try {
    await request({
      url: '/api/recommendations/feedback',
      method: 'post',
      data: {
        jobId: data.jobId,
        feedbackType: data.feedbackType,
        feedbackText: data.reason || ''
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to submit recommendation feedback:', error);

    // 创建特定的API错误
    const apiError = createApiError(
      ApiErrorCode.BUSINESS_ERROR,
      '提交推荐反馈失败',
      ErrorType.BUSINESS,
      { originalError: error }
    );

    // 重新抛出错误，让调用者处理
    throw apiError;
  }
}

/**
 * 获取推荐设置
 *
 * @returns 推荐设置
 */
export async function getRecommendationSettings(): Promise<{
  enabled: boolean;
  skillWeight: number;
  historyWeight: number;
  feedbackWeight: number;
  maxRecommendations: number;
  minScore: number;
  includeApplied: boolean;
}> {
  try {
    const response = await request({
      url: '/api/recommendations/settings',
      method: 'get'
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch recommendation settings:', error);

    // 创建特定的API错误
    const apiError = createApiError(
      ApiErrorCode.BUSINESS_ERROR,
      '获取推荐设置失败',
      ErrorType.BUSINESS,
      { originalError: error }
    );

    // 重新抛出错误，让调用者处理
    throw apiError;
  }
}

/**
 * 更新推荐设置
 *
 * @param settings 推荐设置
 * @returns 更新后的推荐设置
 */
export async function updateRecommendationSettings(settings: {
  enabled?: boolean;
  skillWeight?: number;
  historyWeight?: number;
  feedbackWeight?: number;
  maxRecommendations?: number;
  minScore?: number;
  includeApplied?: boolean;
}): Promise<{
  enabled: boolean;
  skillWeight: number;
  historyWeight: number;
  feedbackWeight: number;
  maxRecommendations: number;
  minScore: number;
  includeApplied: boolean;
}> {
  try {
    const response = await request({
      url: '/api/recommendations/settings',
      method: 'put',
      data: settings
    });

    return response.data;
  } catch (error) {
    console.error('Failed to update recommendation settings:', error);

    // 创建特定的API错误
    const apiError = createApiError(
      ApiErrorCode.BUSINESS_ERROR,
      '更新推荐设置失败',
      ErrorType.BUSINESS,
      { originalError: error }
    );

    // 重新抛出错误，让调用者处理
    throw apiError;
  }
}

/**
 * 检查是否已对职位进行反馈
 *
 * @param jobId 职位ID
 * @returns 是否已反馈
 */
export async function checkRecommendationFeedback(jobId: string | number): Promise<{ hasFeedback: boolean }> {
  try {
    const response = await request({
      url: '/api/recommendations/feedback/check',
      method: 'get',
      params: { jobId }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to check recommendation feedback:', error);

    // 创建特定的API错误
    const apiError = createApiError(
      ApiErrorCode.BUSINESS_ERROR,
      '检查推荐反馈状态失败',
      ErrorType.BUSINESS,
      { originalError: error }
    );

    // 重新抛出错误，让调用者处理
    throw apiError;
  }
}