import request from '@/utils/request';
import type { RecommendationResponse, RecommendedJob } from '@/types/recommendation';
import type { JobInfo } from '@/types/job'; // For mock data

// (学生端) 获取个性化推荐职位列表
export function getRecommendedJobs(params?: any): Promise<{ data: RecommendationResponse }> {
  // return request({
  //   url: '/api/student/recommendations',
  //   method: 'get',
  //   params, // 可能包含分页、场景等参数
  // });
  // ---- Mock Data Start ----
  console.warn('API MOCK: getRecommendedJobs is using mock data.');
   // 模拟一些职位数据作为推荐结果
   const mockJob1: JobInfo = {
     id: 'job-rec-1', title: '推荐职位-前端 (高匹配)', company_id: 'comp-a', company_name: '高匹配公司',
     location: '杭州', salary_range: '16k-28k', job_type: '全职', experience_required: '1-3年',
     education_required: '本科', tags: ['Vue', 'TypeScript', '高匹配'], description: '...', requirements: '...',
     status: 'open',
   };
   const mockJob2: JobInfo = {
     id: 'job-rec-2', title: '推荐职位-算法工程师', company_id: 'comp-b', company_name: '算法领先',
     location: '北京', salary_range: '25k-40k', job_type: '全职', experience_required: '3-5年',
     education_required: '硕士', tags: ['Python', '机器学习', '推荐系统'], description: '...', requirements: '...',
     status: 'open',
   };
    const mockRecommendedJobs: RecommendedJob[] = [
      {
        job_info: mockJob1,
        recommendation_score: 0.95,
        recommendation_reason: '与你的技能画像高度匹配'
      },
      {
        job_info: mockJob2,
        recommendation_score: 0.88,
        recommendation_reason: '基于你的项目经历推荐'
      },
      // 可以添加更多...
    ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { list: mockRecommendedJobs } });
    }, 800);
  });
  // ---- Mock Data End ----
}

// 可以在此添加其他推荐相关的接口，例如基于职位的相似职位推荐等 