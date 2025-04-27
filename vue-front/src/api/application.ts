import request from '@/utils/request';
import type {
  ApplicationInfo,
  ApplyJobPayload,
  UpdateApplicationStatusPayload,
} from '@/types/application';
import type { PaginatedResponse, PaginationParams } from './company';

/**
 * 申请筛选参数
 */
export interface ApplicationFilterParams extends PaginationParams {
  status?: string;
  jobId?: string | number;
  studentId?: string | number;
  startDate?: string;
  endDate?: string;
}

/**
 * (学生端) 申请职位
 * @param data 申请信息
 * @returns 申请结果
 */
export function applyForJob(data: ApplyJobPayload) {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: applyForJob is using mock data.');
  //
  // // 返回模拟响应
  // return Promise.resolve({
  //   data: {
  //     success: true,
  //     message: '申请已提交成功',
  //     application_id: Math.floor(Math.random() * 1000) + 1 // 随机生成申请ID
  //   }
  // });

  // 当后端API实现后，取消注释下面的代码
  // /*
  return request({
    url: '/api/applications',
    method: 'post',
    data,
  });
  // */
}

/**
 * (学生端) 获取我的申请列表
 * @param params 查询参数
 * @returns 申请列表
 */
export function getStudentApplicationList(params?: ApplicationFilterParams): Promise<{ data: PaginatedResponse<ApplicationInfo> }> {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: getStudentApplicationList is using mock data.');
  //
  // // 模拟申请数据
  // const mockApplications: ApplicationInfo[] = [
  //   {
  //     id: 1,
  //     job_id: 101,
  //     student_id: 1,
  //     resume_id: 1,
  //     status: 'pending',
  //     apply_time: new Date(Date.now() - 7 * 86400000).toISOString(), // 7天前
  //     update_time: new Date(Date.now() - 5 * 86400000).toISOString(), // 5天前
  //     job_info: {
  //       id: 101,
  //       title: '前端开发工程师',
  //       company_name: '科技有限公司',
  //       location: '重庆',
  //       salary_range: '10k-15k'
  //     }
  //   },
  //   {
  //     id: 2,
  //     job_id: 102,
  //     student_id: 1,
  //     resume_id: 1,
  //     status: 'interview',
  //     apply_time: new Date(Date.now() - 14 * 86400000).toISOString(), // 14天前
  //     update_time: new Date(Date.now() - 10 * 86400000).toISOString(), // 10天前
  //     interview_time: new Date(Date.now() + 2 * 86400000).toISOString(), // 2天后
  //     interview_location: '公司总部',
  //     interview_type: 'onsite',
  //     interview_contact: '张经理',
  //     interview_contact_info: '13800138000',
  //     job_info: {
  //       id: 102,
  //       title: '全栈开发工程师',
  //       company_name: '互联网科技公司',
  //       location: '北京',
  //       salary_range: '15k-25k'
  //     }
  //   },
  //   {
  //     id: 3,
  //     job_id: 103,
  //     student_id: 1,
  //     resume_id: 1,
  //     status: 'offer',
  //     apply_time: new Date(Date.now() - 21 * 86400000).toISOString(), // 21天前
  //     update_time: new Date(Date.now() - 3 * 86400000).toISOString(), // 3天前
  //     interview_time: new Date(Date.now() - 7 * 86400000).toISOString(), // 7天前
  //     interview_location: '线上面试',
  //     interview_type: 'video',
  //     interview_contact: '李总监',
  //     feedback: '恭喜您通过了我们的面试，我们很高兴能够向您提供这个职位。您的技术能力和团队协作精神给我们留下了深刻的印象。',
  //     job_info: {
  //       id: 103,
  //       title: '高级前端工程师',
  //       company_name: '创新科技公司',
  //       location: '上海',
  //       salary_range: '20k-30k'
  //     }
  //   },
  //   {
  //     id: 4,
  //     job_id: 104,
  //     student_id: 1,
  //     resume_id: 1,
  //     status: 'rejected',
  //     apply_time: new Date(Date.now() - 30 * 86400000).toISOString(), // 30天前
  //     update_time: new Date(Date.now() - 20 * 86400000).toISOString(), // 20天前
  //     interview_time: new Date(Date.now() - 25 * 86400000).toISOString(), // 25天前
  //     interview_location: '公司会议室',
  //     interview_type: 'onsite',
  //     interview_contact: '王HR',
  //     feedback: '感谢您参加我们的面试。经过慎重考虑，我们认为您的技能和经验与我们当前的职位需求不太匹配。我们鼓励您继续关注我们的其他职位机会。',
  //     job_info: {
  //       id: 104,
  //       title: '资深前端架构师',
  //       company_name: '领先科技公司',
  //       location: '深圳',
  //       salary_range: '30k-50k'
  //     }
  //   }
  // ];
  //
  // // 模拟分页
  // const page = params?.page || 1;
  // const pageSize = params?.pageSize || 10;
  // const start = (page - 1) * pageSize;
  // const end = start + pageSize;
  //
  // // 模拟筛选
  // let filteredApplications = [...mockApplications];
  // if (params?.status) {
  //   filteredApplications = filteredApplications.filter(a => a.status === params.status);
  // }
  // if (params?.jobId) {
  //   filteredApplications = filteredApplications.filter(a => a.job_id === params.jobId);
  // }
  //
  // // 模拟分页结果
  // const paginatedApplications = filteredApplications.slice(start, end);
  //
  // // 返回模拟响应
  // return Promise.resolve({
  //   data: {
  //     records: paginatedApplications,
  //     total: filteredApplications.length,
  //     page: page,
  //     pageSize: pageSize,
  //     totalPages: Math.ceil(filteredApplications.length / pageSize)
  //   }
  // });

  // 当后端API实现后，取消注释下面的代码
  // /*
  return request({
    url: '/api/applications/me',
    method: 'get',
    params,
  });
  // */
}

/**
 * (学生端) 获取单个申请详情
 * @param id 申请ID
 * @returns 申请详情
 */
export function getStudentApplicationDetail(id: string | number): Promise<{ data: ApplicationInfo }> {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: getStudentApplicationDetail is using mock data.');
  //
  // // 模拟申请详情数据
  // const mockApplicationDetail: ApplicationInfo = {
  //   id: Number(id),
  //   job_id: 101,
  //   student_id: 1,
  //   company_id: 201,
  //   status: 'pending',
  //   apply_time: new Date(Date.now() - 7 * 86400000).toISOString(), // 7天前
  //   update_time: new Date(Date.now() - 5 * 86400000).toISOString(), // 5天前
  //   resume_url: 'https://example.com/resume.pdf',
  //   cover_letter: '我对贵公司的职位非常感兴趣，希望能够加入贵公司的团队。我有丰富的前端开发经验，熟悉Vue、React等主流框架，能够快速适应新的技术栈。我相信我的技能和经验能够为贵公司带来价值。',
  //   job: {
  //     id: 101,
  //     title: '前端开发工程师',
  //     company_name: '科技有限公司',
  //     location: '重庆',
  //     salary_range: '10k-15k',
  //     job_type: 'full-time',
  //     description: '负责公司产品的前端开发工作，与后端团队协作完成产品功能开发。',
  //     requirements: '熟悉Vue、React等前端框架，有2年以上相关工作经验。',
  //     benefits: '五险一金，年终奖，带薪年假，定期团建。'
  //   },
  //   company: {
  //     id: 201,
  //     name: '科技有限公司',
  //     logo: 'https://via.placeholder.com/150',
  //     industry: '互联网',
  //     size: '100-499人',
  //     location: '重庆'
  //   },
  //   feedback: id === '2' ? {
  //     content: '简历很优秀，希望能够安排面试。',
  //     time: new Date(Date.now() - 3 * 86400000).toISOString() // 3天前
  //   } : undefined,
  //   interview: id === '2' ? {
  //     time: new Date(Date.now() + 2 * 86400000).toISOString(), // 2天后
  //     location: '线上面试',
  //     interviewer: '张经理',
  //     notes: '请提前准备自我介绍和项目经验分享。'
  //   } : undefined
  // };
  //
  // // 返回模拟响应
  // return Promise.resolve({
  //   data: mockApplicationDetail
  // });

  // 当后端API实现后，取消注释下面的代码
  // /*
  return request({
    url: `/api/applications/${id}`,
    method: 'get',
  });
  // */
}

/**
 * (学生端) 撤回申请
 * @param id 申请ID
 * @returns 撤回结果
 */
export function withdrawApplication(id: string | number) {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: withdrawApplication is using mock data.');
  //
  // // 返回模拟响应
  // return Promise.resolve({
  //   data: {
  //     success: true,
  //     message: '申请已成功撤回'
  //   }
  // });

  // 当后端API实现后，取消注释下面的代码
  // /*
  return request({
    url: `/api/applications/${id}/withdraw`,
    method: 'put',
  });
  // */
}

/**
 * (学生端) 对已完成的申请进行评价
 * @param id 申请ID
 * @param rating 评分 (1-5)
 * @param comment 评价内容 (可选)
 * @returns 评价结果
 */
export function rateApplication(id: string | number, rating: number, comment?: string) {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: rateApplication is using mock data.');
  //
  // // 校验评分范围
  // if (rating < 1 || rating > 5) {
  //   return Promise.reject({ message: '评分必须在 1 到 5 之间' });
  // }
  //
  // // 返回模拟响应
  // return Promise.resolve({
  //   data: {
  //     success: true,
  //     message: '评价已提交'
  //   }
  // });

  // 当后端API实现后，取消注释下面的代码
  // /*
  return request({
    url: `/api/applications/${id}/rate`,
    method: 'post',
    data: { rating, comment },
  });
  // */
}

/**
 * (企业端) 获取收到的申请列表
 * @param params 查询参数
 * @returns 申请列表
 */
export function getCompanyApplicationList(params?: ApplicationFilterParams): Promise<{ data: PaginatedResponse<ApplicationInfo> }> {
  // TODO: 实现企业端获取申请列表的模拟数据或真实API调用
  console.warn('API: getCompanyApplicationList is not implemented yet.');
  return Promise.resolve({ data: { records: [], total: 0, page: 1, pageSize: 10, totalPages: 0 } });
  /*
  return request({
    url: '/api/company/applications',
    method: 'get',
    params,
  });
  */
}

/**
 * (企业端) 获取单个申请详情
 * @param id 申请ID
 * @returns 申请详情
 */
export function getCompanyApplicationDetail(id: string | number): Promise<{ data: ApplicationInfo }> {
  // TODO: 实现企业端获取申请详情的模拟数据或真实API调用
  console.warn('API: getCompanyApplicationDetail is not implemented yet.');
  return Promise.reject({ message: 'Not implemented' });
  /*
  return request({
    url: `/api/company/applications/${id}`,
    method: 'get',
  });
  */
}

/**
 * (企业端) 更新申请状态
 * @param id 申请ID
 * @param data 更新信息
 * @returns 更新结果
 */
export function updateApplicationStatus(id: string | number, data: UpdateApplicationStatusPayload) {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: updateApplicationStatus is using mock data.');
  //
  // // 返回模拟响应
  // return Promise.resolve({
  //   data: {
  //     success: true,
  //     message: '申请状态已更新'
  //   }
  // });

  // 当后端API实现后，取消注释下面的代码
  // /*
  return request({
    url: `/api/applications/${id}/status`,
    method: 'put',
    data,
  });
  // */
}

/**
 * (企业端) 安排面试
 * @param id 申请ID
 * @param interviewData 面试信息
 * @returns 操作结果
 */
export function scheduleInterview(id: string | number, interviewData: any) {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: scheduleInterview is using mock data.');
  //
  // // 返回模拟响应
  // return Promise.resolve({
  //   data: {
  //     success: true,
  //     message: '面试已安排'
  //   }
  // });

  // 当后端API实现后，取消注释下面的代码
  // /*
  return request({
    url: `/api/applications/${id}/interview`,
    method: 'post',
    data: interviewData,
  });
  // */
}

/**
 * (管理端) 获取所有申请列表 (需要管理员权限)
 * @param params 查询参数
 * @returns 申请列表
 */
export function getAllApplications(params?: ApplicationFilterParams): Promise<{ data: PaginatedResponse<ApplicationInfo> }> {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: getAllApplications is using mock data.');
  //
  // // 使用学生端的模拟数据作为基础
  // const mockApplications = getStudentApplicationList(params); // 注意：这里直接调用了上面的模拟函数，实际后端需要独立实现
  // return mockApplications;

  // 当后端API实现后，取消注释下面的代码
  // /*
  return request({
    url: '/api/admin/applications', // 管理员接口地址可能不同
    method: 'get',
    params,
  });
  // */
}