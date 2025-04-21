import request from '@/utils/request';
import type { JobInfo, JobListParams, JobStatus } from '@/types/job';
// TODO: 定义分页响应类型 PaginatedResponse<T>

// 获取职位列表 (带筛选和分页)
export function getJobList(params: JobListParams): Promise<{ data: { list: JobInfo[], total: number } }> {
  // return request({
  //   url: '/api/jobs',
  //   method: 'get',
  //   params,
  // });
  // ---- Mock Data Start ----
  console.warn('API MOCK: getJobList is using mock data.');
  const allJobs: JobInfo[] = [
    {
      id: 'job1', title: '前端开发工程师', company_id: '2', company_name: '示例科技',
      company_logo: '', location: '北京',
      salary_range: '15k-25k', job_type: '全职', experience_required: '1-3年',
      education_required: '本科', tags: ['Vue', 'React'], description: '...', requirements: '...',
      publish_time: '2024-01-15T10:00:00Z', status: 'open'
    },
    {
      id: 'job2', title: '后端开发工程师', company_id: '2', company_name: '示例科技',
      company_logo: '', location: '上海',
      salary_range: '20k-30k', job_type: '全职', experience_required: '3-5年',
      education_required: '本科', tags: ['Java', 'Spring'], description: '...', requirements: '...',
      publish_time: '2024-01-14T11:00:00Z', status: 'open'
    },
    {
      id: 'job3', title: '产品经理', company_id: '3', company_name: '另一家公司',
      company_logo: '', location: '深圳',
      salary_range: '18k-28k', job_type: '全职', experience_required: '3-5年',
      education_required: '本科', tags: ['互联网', 'B端'], description: '...', requirements: '...',
      publish_time: '2024-01-16T09:00:00Z', status: 'open'
    },
    // 可以添加更多 mock 数据
  ];

  // 模拟筛选和分页
  const { page = 1, pageSize = 10, keyword, location } = params;
  let filteredJobs = allJobs;
  if (keyword) {
    filteredJobs = filteredJobs.filter(job =>
      job.title.includes(keyword) || job.company_name?.includes(keyword)
    );
  }
  if (location) {
    filteredJobs = filteredJobs.filter(job => job.location === location);
  }
  // TODO: 添加其他筛选条件

  const total = filteredJobs.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const list = filteredJobs.slice(start, end);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { list, total } });
    }, 500);
  });
  // ---- Mock Data End ----
}

// 获取职位详情
export function getJobDetail(id: string | number): Promise<{ data: JobInfo }> {
  // return request({
  //   url: `/api/jobs/${id}`,
  //   method: 'get',
  // });
  // ---- Mock Data Start ----
  console.warn('API MOCK: getJobDetail is using mock data.');
  // 从上面的 allJobs 或单独构造 mock 数据
    const mockJobDetail: JobInfo = {
      id: id,
      title: `职位详情 (${id})`,
      company_id: '2',
      company_name: '示例科技',
      company_logo: '',
      location: '北京',
      salary_range: '15k-25k',
      job_type: '全职',
      experience_required: '1-3年',
      education_required: '本科',
      tags: ['Vue', 'React', '前端', '详情标签'],
      description: `这是职位 **${id}** 的详细描述。\n支持 Markdown 格式。`,
      requirements: `1. 熟练掌握 Vue 或 React 框架；\n2. 熟悉 TypeScript；\n3. 良好的沟通能力。`,
      publish_time: new Date().toISOString(),
      status: 'open',
      // company_profile: { ... } // 可以补充公司详情
    };
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟找不到职位的情况
      if (id === 'notfound') {
         reject(new Error('Job not found'));
      } else {
         resolve({ data: mockJobDetail });
      }
    }, 300);
  });
  // ---- Mock Data End ----
}

// (企业端) 创建职位
// TODO: 参数类型可以更精确 Omit<JobInfo, 'id' | 'company_name' | 'company_logo' | 'publish_time' | 'status'>
export function createJob(data: Partial<JobInfo>) {
  return request({
    url: '/api/company/jobs',
    method: 'post',
    data,
  });
}

// (企业端) 更新职位
export function updateJob(id: string | number, data: Partial<JobInfo>) {
  return request({
    url: `/api/company/jobs/${id}`,
    method: 'put',
    data,
  });
}

// (企业端) 删除职位 (逻辑删除/修改状态)
export function deleteJob(id: string | number) {
  return request({
    url: `/api/company/jobs/${id}`,
    method: 'delete',
  });
}

// --- Placeholder for missing API function ---
// (企业端) 更新职位状态
export function updateJobStatus(jobId: string | number, status: JobStatus): Promise<any> {
  console.warn(`API MOCK: updateJobStatus(${jobId}, ${status}) called.`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true } }); // Mock success response
    }, 300);
  });
  // Replace with actual API call:
  // return request({
  //   url: `/api/company/jobs/${jobId}/status`,
  //   method: 'patch', // or 'put'
  //   data: { status },
  // });
}