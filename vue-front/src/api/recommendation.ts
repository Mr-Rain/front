import request from '@/utils/request';
import type { RecommendationResponse, RecommendedJob } from '@/types/recommendation';
import type { JobInfo } from '@/types/job'; // For mock data

// 模拟职位数据
const mockJobs: Record<string, JobInfo> = {
  'job-rec-1': {
    id: 'job-rec-1',
    title: '前端开发工程师 (高匹配)',
    company_id: 'comp-a',
    company_name: '数字科技有限公司',
    location: '杭州',
    salary_range: '16k-28k',
    job_type: '全职',
    experience_required: '1-3年',
    education_required: '本科',
    tags: ['Vue', 'TypeScript', 'React'],
    description: '负责公司前端产品的开发和维护，优化用户体验。',
    requirements: '精通Vue或React框架，熟悉TypeScript，有良好的编码习惯。',
    status: 'open',
  },
  'job-rec-2': {
    id: 'job-rec-2',
    title: '算法工程师',
    company_id: 'comp-b',
    company_name: '智能算法科技',
    location: '北京',
    salary_range: '25k-40k',
    job_type: '全职',
    experience_required: '3-5年',
    education_required: '硕士',
    tags: ['Python', '机器学习', '推荐系统'],
    description: '负责公司推荐系统的算法设计和实现。',
    requirements: '精通Python，熟悉机器学习算法，有推荐系统相关经验。',
    status: 'open',
  },
  'job-rec-3': {
    id: 'job-rec-3',
    title: '产品经理',
    company_id: 'comp-c',
    company_name: '创新产品科技',
    location: '上海',
    salary_range: '20k-35k',
    job_type: '全职',
    experience_required: '3-5年',
    education_required: '本科',
    tags: ['产品设计', '用户研究', '敏捷开发'],
    description: '负责公司产品的规划、设计和落地。',
    requirements: '有互联网产品经验，善于用户研究，有良好的沟通能力。',
    status: 'open',
  },
  'job-rec-4': {
    id: 'job-rec-4',
    title: 'Java后端开发工程师',
    company_id: 'comp-d',
    company_name: '云服务科技有限公司',
    location: '深圳',
    salary_range: '18k-30k',
    job_type: '全职',
    experience_required: '2-4年',
    education_required: '本科',
    tags: ['Java', 'Spring Boot', '微服务'],
    description: '负责公司后端服务的开发和维护。',
    requirements: '精通Java，熟悉Spring Boot框架，有微服务架构经验。',
    status: 'open',
  },
  'job-rec-5': {
    id: 'job-rec-5',
    title: 'UI/UX设计师',
    company_id: 'comp-e',
    company_name: '创意设计工作室',
    location: '广州',
    salary_range: '15k-25k',
    job_type: '全职',
    experience_required: '2-4年',
    education_required: '本科',
    tags: ['UI设计', 'UX设计', 'Figma'],
    description: '负责公司产品的界面设计和用户体验优化。',
    requirements: '精通Figma等设计工具，有良好的客户端产品设计经验。',
    status: 'open',
  },
  'job-rec-6': {
    id: 'job-rec-6',
    title: '运维工程师',
    company_id: 'comp-f',
    company_name: '云基础设施服务公司',
    location: '成都',
    salary_range: '15k-28k',
    job_type: '全职',
    experience_required: '2-5年',
    education_required: '本科',
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
      job_info: mockJobs['job-rec-1'],
      recommendation_score: 0.95,
      recommendation_reason: '与你的技能画像高度匹配'
    },
    {
      job_info: mockJobs['job-rec-4'],
      recommendation_score: 0.88,
      recommendation_reason: '基于你的项目经历推荐'
    },
    {
      job_info: mockJobs['job-rec-3'],
      recommendation_score: 0.82,
      recommendation_reason: '与你的职业发展方向匹配'
    },
    {
      job_info: mockJobs['job-rec-5'],
      recommendation_score: 0.75,
      recommendation_reason: '与你的兴趣特长匹配'
    },
  ],

  // 基于技能的推荐
  'skill-based': [
    {
      job_info: mockJobs['job-rec-1'],
      recommendation_score: 0.97,
      recommendation_reason: '与你的前端技能高度匹配'
    },
    {
      job_info: mockJobs['job-rec-2'],
      recommendation_score: 0.85,
      recommendation_reason: '与你的算法能力匹配'
    },
    {
      job_info: mockJobs['job-rec-6'],
      recommendation_score: 0.78,
      recommendation_reason: '与你的运维知识匹配'
    },
  ],

  // 基于浏览历史的推荐
  'history-based': [
    {
      job_info: mockJobs['job-rec-3'],
      recommendation_score: 0.92,
      recommendation_reason: '基于你最近浏览的产品类职位'
    },
    {
      job_info: mockJobs['job-rec-5'],
      recommendation_score: 0.89,
      recommendation_reason: '与你最近关注的设计类职位相关'
    },
    {
      job_info: mockJobs['job-rec-4'],
      recommendation_score: 0.81,
      recommendation_reason: '与你最近浏览的后端类职位相关'
    },
  ],
};

// (学生端) 获取个性化推荐职位列表
export function getRecommendedJobs(params?: any): Promise<{ data: RecommendationResponse }> {
  // 实际API调用（预留）
  // return request({
  //   url: '/api/student/recommendations',
  //   method: 'get',
  //   params, // 可能包含分页、场景等参数
  // });

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
}

// 获取推荐场景列表
export function getRecommendationScenarios(): Promise<{ data: { scenarios: Array<{id: string, name: string}> } }> {
  // 实际API调用（预留）
  // return request({
  //   url: '/api/student/recommendation-scenarios',
  //   method: 'get'
  // });

  // 模拟数据
  const mockScenarios = [
    { id: 'default', name: '智能推荐' },
    { id: 'skill-based', name: '基于技能' },
    { id: 'history-based', name: '基于浏览历史' }
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { scenarios: mockScenarios } });
    }, 500);
  });
}

// 反馈推荐结果
export function feedbackRecommendation(data: { job_id: string | number, feedback_type: 'like' | 'dislike', reason?: string }): Promise<{ success: boolean }> {
  // 实际API调用（预留）
  // return request({
  //   url: '/api/student/recommendation-feedback',
  //   method: 'post',
  //   data
  // });

  // 模拟数据
  console.log('Recommendation feedback:', data);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 300);
  });
}