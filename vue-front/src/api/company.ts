import request from '@/utils/request';
import type { CompanyProfile } from '@/types/company';
import type { JobInfo } from '@/types/job'; // 假设 JobInfo 类型已定义

// 获取当前登录公司的信息
export function getCompanyProfile(): Promise<{ data: CompanyProfile }> {
  // return request({
  //   url: '/api/company/profile',
  //   method: 'get',
  // });
  // ---- Mock Data Start ----
  console.warn('API MOCK: getCompanyProfile is using mock data.');
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockProfile: CompanyProfile = {
        id: '2', // 应该与 UserInfo id 一致
        username: 'mockCompany',
        user_type: 'company',
        email: 'hr@company.com',
        phone: '010-88888888',
        avatar: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Company',
        company_name: '示例科技有限公司',
        short_name: '示例科技',
        logo: 'https://via.placeholder.com/100/FF0000/FFFFFF?text=Logo',
        website: 'https://example.com',
        industry: '互联网/软件',
        scale: '100-499人',
        financing: 'B轮',
        location: '北京市海淀区示例路1号',
        description: '我们是一家领先的互联网技术公司，致力于...',
        audit_status: 'approved',
      };
      resolve({ data: mockProfile });
    }, 400);
  });
  // ---- Mock Data End ----
}

// 更新公司信息
// TODO: 参数类型可以更精确
export function updateCompanyProfile(data: Partial<CompanyProfile>) {
  return request({
    url: '/api/company/profile',
    method: 'put',
    data,
  });
}

// 获取公司发布的职位列表 (带分页)
// TODO: 定义分页参数类型 PaginationParams 和响应类型 PaginatedResponse<JobInfo>
export function getCompanyJobList(params: any): Promise<{ data: { list: JobInfo[], total: number } }> {
  // return request({
  //   url: '/api/company/jobs',
  //   method: 'get',
  //   params,
  // });
  // ---- Mock Data Start ----
  console.warn('API MOCK: getCompanyJobList is using mock data.');
  // 引入 job mock 数据，如果 Job 类型复杂，可以单独抽离 mock 函数
  const mockJob: JobInfo = {
    id: 'job1',
    title: '前端开发工程师 (Mock)',
    company_id: '2', // 关联的公司 ID
    company_name: '示例科技有限公司',
    company_logo: 'https://via.placeholder.com/100/FF0000/FFFFFF?text=Logo',
    location: '北京',
    salary_range: '15k-25k',
    job_type: '全职',
    experience_required: '1-3年',
    education_required: '本科',
    tags: ['Vue', 'React', '前端'],
    description: '负责公司产品的前端开发...',
    requirements: '熟练掌握Vue/React...',
    publish_time: new Date().toISOString(),
    status: 'open'
  };
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { list: [mockJob, { ...mockJob, id: 'job2', title: '后端开发工程师 (Mock)' }], total: 2 } });
    }, 600);
  });
  // ---- Mock Data End ----
}

// (管理端) 获取待审核公司列表
// TODO: 定义响应类型 PaginatedResponse<CompanyProfile>
export function getPendingCompanies(params: any): Promise<any> {
  return request({
    url: '/api/admin/companies/pending',
    method: 'get',
    params,
  });
}

// (管理端) 审核公司
export function approveCompany(companyId: string | number, approved: boolean, message?: string) {
  return request({
    url: `/api/admin/companies/${companyId}/audit`,
    method: 'post',
    data: { approved, message },
  });
}