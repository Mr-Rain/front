import request from '@/utils/request';
import type {
  ApplicationInfo,
  ApplyJobPayload,
  UpdateApplicationStatusPayload,
} from '@/types/application';
// TODO: 定义分页参数和响应类型

// (学生端) 申请职位
export function applyForJob(data: ApplyJobPayload) {
  return request({
    url: '/api/student/applications',
    method: 'post',
    data,
  });
}

// (学生端) 获取我的申请列表
export function getStudentApplicationList(params?: any): Promise<{ data: { list: ApplicationInfo[], total: number } }> {
  // return request({
  //   url: '/api/student/applications',
  //   method: 'get',
  //   params, // 可能包含 status 筛选
  // });
  // ---- Mock Data Start ----
  console.warn('API MOCK: getStudentApplicationList is using mock data.');
  const mockApplications: ApplicationInfo[] = [
      {
        id: 'app1', job_id: 'job1', student_id: '1', resume_id: 'resume1',
        status: 'pending', apply_time: '2024-01-18T14:00:00Z',
        job_info: { id: 'job1', title: '前端开发工程师', company_name: '示例科技', location: '北京', salary_range: '15k-25k' }
      },
      {
        id: 'app2', job_id: 'job2', student_id: '1', resume_id: 'resume1',
        status: 'viewed', apply_time: '2024-01-17T10:00:00Z', update_time: '2024-01-18T09:00:00Z',
        job_info: { id: 'job2', title: '后端开发工程师', company_name: '示例科技', location: '上海', salary_range: '20k-30k' }
      },
      {
        id: 'app3', job_id: 'job3', student_id: '1', resume_id: 'resume2',
        status: 'rejected', apply_time: '2024-01-16T15:00:00Z', update_time: '2024-01-17T11:00:00Z',
        feedback: '抱歉，您的经历与岗位要求不太匹配。',
        rating: 2,
        job_info: { id: 'job3', title: '产品经理', company_name: '另一家公司', location: '深圳', salary_range: '18k-28k' }
      }
  ];
  return new Promise((resolve) => {
    setTimeout(() => {
      // 简单模拟分页
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const total = mockApplications.length;
      const list = mockApplications.slice((page - 1) * pageSize, page * pageSize);
      resolve({ data: { list, total } });
    }, 700);
  });
   // ---- Mock Data End ----
}

// (学生端) 撤回申请
export function withdrawApplication(id: string | number) {
  return request({
    url: `/api/student/applications/${id}/withdraw`,
    method: 'post',
  });
}

// (企业端) 获取收到的申请列表
export function getCompanyApplicationList(params?: any): Promise<{ data: { list: ApplicationInfo[], total: number } }> {
  // return request({
  //   url: '/api/company/applications',
  //   method: 'get',
  //   params, // 可能包含 jobId, status 等筛选
  // });
  // ---- Mock Data Start ----
  console.warn('API MOCK: getCompanyApplicationList is using mock data.');
  // 复用学生端 mock 数据，并补充学生信息
    const mockApplications: ApplicationInfo[] = [
      {
        id: 'app1', job_id: 'job1', student_id: '1', resume_id: 'resume1',
        status: 'pending', apply_time: '2024-01-18T14:00:00Z',
        job_info: { id: 'job1', title: '前端开发工程师', company_name: '示例科技', location: '北京', salary_range: '15k-25k' },
        student_info: { id: '1', name: 'Mock 学生A', school: '示例大学', major: '计算机' }
      },
      {
        id: 'app4', job_id: 'job1', student_id: '4', resume_id: 'resume4',
        status: 'pending', apply_time: '2024-01-19T09:30:00Z',
        job_info: { id: 'job1', title: '前端开发工程师', company_name: '示例科技', location: '北京', salary_range: '15k-25k' },
        student_info: { id: '4', name: 'Mock 学生B', school: '另一大学', major: '软件工程' }
      },
    ];
  return new Promise((resolve) => {
    setTimeout(() => {
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const total = mockApplications.length;
      const list = mockApplications.slice((page - 1) * pageSize, page * pageSize);
      resolve({ data: { list, total } });
    }, 650);
  });
  // ---- Mock Data End ----
}

// (企业端) 获取单个申请详情 (可能包含简历快照)
export function getCompanyApplicationDetail(id: string | number): Promise<{ data: ApplicationInfo }> {
  // return request({
  //   url: `/api/company/applications/${id}`,
  //   method: 'get',
  // });
  // ---- Mock Data Start ----
  console.warn('API MOCK: getCompanyApplicationDetail is using mock data.');
  const mockDetail: ApplicationInfo = {
        id: id,
        job_id: 'job1',
        student_id: '1',
        resume_id: 'resume1',
        status: 'pending',
        apply_time: '2024-01-18T14:00:00Z',
        job_info: { id: 'job1', title: '前端开发工程师', company_name: '示例科技', location: '北京', salary_range: '15k-25k' },
        student_info: { id: '1', name: 'Mock 学生A', school: '示例大学', major: '计算机' },
        // resume_snapshot: { ... } // 这里可以填充简历快照信息
  };
  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({ data: mockDetail });
    }, 350);
  });
  // ---- Mock Data End ----
}

// (学生端) 获取单个申请详情
export function getStudentApplicationDetail(id: string | number): Promise<{ data: ApplicationInfo }> {
  // return request({
  //   url: `/api/student/applications/${id}`,
  //   method: 'get',
  // });
  // ---- Mock Data Start ----
  console.warn('API MOCK: getStudentApplicationDetail is using mock data.');
  const mockDetail: ApplicationInfo = {
        id: id,
        job_id: 'job1',
        student_id: '1',
        resume_id: 'resume1',
        status: 'interview',
        apply_time: '2024-01-18T14:00:00Z',
        update_time: '2024-01-19T10:30:00Z',
        feedback: '感谢您的申请，我们对您的简历很感兴趣。请按照面试安排准时参加面试。',
        rating: 4,
        job_title: '前端开发工程师',
        company_name: '示例科技',
        resume_title: '前端开发简历',
        interview_time: '2024-01-25T14:00:00Z',
        interview_location: '北京市海淀区中关村软件园1号楼3层',
        interview_type: 'onsite',
        interview_contact: '张经理',
        interview_contact_info: '13800138000'
  };
  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({ data: mockDetail });
    }, 350);
  });
  // ---- Mock Data End ----
}

// (企业端) 更新申请状态
export function updateApplicationStatus(id: string | number, data: UpdateApplicationStatusPayload) {
  return request({
    url: `/api/company/applications/${id}/status`,
    method: 'put',
    data,
  });
}