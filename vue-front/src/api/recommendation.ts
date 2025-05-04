import request from '@/utils/request';
import type { RecommendationResponse, RecommendedJob } from '@/types/recommendation';
import type { JobInfo } from '@/types/job'; // For mock data

// 模拟职位数据
const mockJobs: Record<string, JobInfo> = {
  'job-rec-1': {
    id: 'job-rec-1',
    title: '前端开发工程师 (高匹配)',
    companyId: 'comp-a',
    companyName: '数字科技有限公司',
    location: '杭州',
    salaryRange: '16k-28k',
    jobType: '全职',
    experienceRequired: '1-3年',
    educationRequired: '本科',
    tags: ['Vue', 'TypeScript', 'React'],
    description: '负责公司前端产品的开发和维护，优化用户体验。',
    requirements: '精通Vue或React框架，熟悉TypeScript，有良好的编码习惯。',
    status: 'open',
  },
  'job-rec-2': {
    id: 'job-rec-2',
    title: '算法工程师',
    companyId: 'comp-b',
    companyName: '智能算法科技',
    location: '北京',
    salaryRange: '25k-40k',
    jobType: '全职',
    experienceRequired: '3-5年',
    educationRequired: '硕士',
    tags: ['Python', '机器学习', '推荐系统'],
    description: '负责公司推荐系统的算法设计和实现。',
    requirements: '精通Python，熟悉机器学习算法，有推荐系统相关经验。',
    status: 'open',
  },
  'job-rec-3': {
    id: 'job-rec-3',
    title: '产品经理',
    companyId: 'comp-c',
    companyName: '创新产品科技',
    location: '上海',
    salaryRange: '20k-35k',
    jobType: '全职',
    experienceRequired: '3-5年',
    educationRequired: '本科',
    tags: ['产品设计', '用户研究', '敏捷开发'],
    description: '负责公司产品的规划、设计和落地。',
    requirements: '有互联网产品经验，善于用户研究，有良好的沟通能力。',
    status: 'open',
  },
  'job-rec-4': {
    id: 'job-rec-4',
    title: 'Java后端开发工程师',
    companyId: 'comp-d',
    companyName: '云服务科技有限公司',
    location: '深圳',
    salaryRange: '18k-30k',
    jobType: '全职',
    experienceRequired: '2-4年',
    educationRequired: '本科',
    tags: ['Java', 'Spring Boot', '微服务'],
    description: '负责公司后端服务的开发和维护。',
    requirements: '精通Java，熟悉Spring Boot框架，有微服务架构经验。',
    status: 'open',
  },
  'job-rec-5': {
    id: 'job-rec-5',
    title: 'UI/UX设计师',
    companyId: 'comp-e',
    companyName: '创意设计工作室',
    location: '广州',
    salaryRange: '15k-25k',
    jobType: '全职',
    experienceRequired: '2-4年',
    educationRequired: '本科',
    tags: ['UI设计', 'UX设计', 'Figma'],
    description: '负责公司产品的界面设计和用户体验优化。',
    requirements: '精通Figma等设计工具，有良好的客户端产品设计经验。',
    status: 'open',
  },
  'job-rec-6': {
    id: 'job-rec-6',
    title: '运维工程师',
    companyId: 'comp-f',
    companyName: '云基础设施服务公司',
    location: '成都',
    salaryRange: '15k-28k',
    jobType: '全职',
    experienceRequired: '2-5年',
    educationRequired: '本科',
    tags: ['Linux', 'Docker', 'Kubernetes'],
    description: '负责公司云基础设施的运维和管理。',
    requirements: '精通Linux系统，熟悉Docker和Kubernetes，有云运维经验。',
    status: 'open',
  },
};

// 不同推荐场景的模拟数据
const scenarioRecommendations: Record<string, RecommendedJob[]> = {
  // 默认推荐
  'default': [
    {
      jobInfo: mockJobs['job-rec-1'],
      recommendationScore: 0.95,
      recommendationReason: '与你的技能画像高度匹配'
    },
    {
      jobInfo: mockJobs['job-rec-4'],
      recommendationScore: 0.88,
      recommendationReason: '基于你的项目经历推荐'
    },
    {
      jobInfo: mockJobs['job-rec-3'],
      recommendationScore: 0.82,
      recommendationReason: '与你的职业发展方向匹配'
    },
    {
      jobInfo: mockJobs['job-rec-5'],
      recommendationScore: 0.75,
      recommendationReason: '与你的兴趣特长匹配'
    },
  ],

  // 基于技能的推荐
  'skill-based': [
    {
      jobInfo: mockJobs['job-rec-1'],
      recommendationScore: 0.97,
      recommendationReason: '与你的前端技能高度匹配'
    },
    {
      jobInfo: mockJobs['job-rec-2'],
      recommendationScore: 0.85,
      recommendationReason: '与你的算法能力匹配'
    },
    {
      jobInfo: mockJobs['job-rec-6'],
      recommendationScore: 0.78,
      recommendationReason: '与你的运维知识匹配'
    },
  ],

  // 基于浏览历史的推荐
  'history-based': [
    {
      jobInfo: mockJobs['job-rec-3'],
      recommendationScore: 0.92,
      recommendationReason: '基于你最近浏览的产品类职位'
    },
    {
      jobInfo: mockJobs['job-rec-5'],
      recommendationScore: 0.89,
      recommendationReason: '与你最近关注的设计类职位相关'
    },
    {
      jobInfo: mockJobs['job-rec-4'],
      recommendationScore: 0.81,
      recommendationReason: '与你最近浏览的后端类职位相关'
    },
  ],
};

// 重新生成推荐职位
export function regenerateRecommendations(): Promise<{ success: boolean }> {
  // 实际API调用
  return request({
    url: '/api/recommendations/regenerate',
    method: 'post'
  }).then(() => {
    return { success: true };
  }).catch(error => {
    console.error('Failed to regenerate recommendations:', error);
    return { success: false };
  });
}

// (学生端) 获取个性化推荐职位列表
export function getRecommendedJobs(params?: any): Promise<{ data: RecommendationResponse }> {
  // 实际API调用
  return request({
    url: '/api/recommendations',
    method: 'get',
    params: {
      // 将前端的scenario参数映射到后端的recommendationType参数
      recommendationType: params?.scenario || 'default',
      page: params?.page || 1,
      pageSize: params?.pageSize || 10
    }
  }).then(response => {
    // 将后端返回的数据格式转换为前端期望的格式
    // 检查response.data是否存在且包含list属性
    if (response.data && Array.isArray(response.data)) {
      // 如果response.data是数组，直接使用
      console.log('API Response Data:', response.data);
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
          status: 'open' // 默认状态
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
      console.log('API Response Data (list):', response.data.list);
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
          status: 'open' // 默认状态
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
  }).catch(error => {
    console.error('Failed to fetch recommended jobs:', error);
    // 出错时返回空数组
    return {
      data: {
        list: []
      }
    };
  });

  // 保留模拟数据代码，以便在API不可用时可以快速切换回来
  /*
  // ---- Mock Data Start ----
  console.warn('API MOCK: getRecommendedJobs is using mock data.');

  // 获取推荐场景，默认为'default'
  const scenario = params?.scenario || 'default';
  console.log(`Using recommendation scenario: ${scenario}`);

  // 根据场景获取推荐数据
  let recommendedJobs = scenarioRecommendations[scenario] || scenarioRecommendations['default'];

  // 模拟分页逻辑（如果需要）
  if (params?.page && params?.pageSize) {
    const page = parseInt(params.page) || 1;
    const pageSize = parseInt(params.pageSize) || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    recommendedJobs = recommendedJobs.slice(start, end);
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { list: recommendedJobs } });
    }, 800); // 模拟网络延迟
  });
  // ---- Mock Data End ----
  */
}

// 获取推荐场景列表
export function getRecommendationScenarios(): Promise<{ data: { scenarios: Array<{id: string, name: string}> } }> {
  // 实际API调用
  return request({
    url: '/api/recommendations/scenarios',
    method: 'get'
  }).then(response => {
    // 如果后端返回的数据格式与前端期望的不一致，进行转换
    if (response.data && Array.isArray(response.data)) {
      return {
        data: {
          scenarios: response.data.map((item: any) => ({
            id: item.code || item.id,
            name: item.name
          }))
        }
      };
    }

    // 如果后端已经返回了正确的格式，直接返回
    return response;
  }).catch(error => {
    console.error('Failed to fetch recommendation scenarios:', error);

    // 出错时返回默认场景
    const defaultScenarios = [
      { id: 'default', name: '智能推荐' },
      { id: 'skill-based', name: '基于技能' },
      { id: 'history-based', name: '基于浏览历史' }
    ];

    return {
      data: {
        scenarios: defaultScenarios
      }
    };
  });
}

// 反馈推荐结果
export function feedbackRecommendation(data: { job_id: string | number, feedback_type: 'like' | 'dislike', reason?: string }): Promise<{ success: boolean }> {
  // 实际API调用
  return request({
    url: '/api/recommendations/feedback',
    method: 'post',
    data: {
      jobId: data.job_id,
      feedbackType: data.feedback_type,
      feedbackText: data.reason || ''
    }
  }).then(() => {
    return { success: true };
  }).catch(error => {
    console.error('Failed to submit recommendation feedback:', error);
    return { success: false };
  });
}