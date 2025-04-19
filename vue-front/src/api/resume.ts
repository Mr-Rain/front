import request from '@/utils/request';
import type { ResumeInfo } from '@/types/resume';

// 获取学生的所有简历列表
export function getResumeList(): Promise<{ data: ResumeInfo[] }> {
  // return request({
  //   url: '/api/student/resumes',
  //   method: 'get',
  // });
   // ---- Mock Data Start ----
   console.warn('API MOCK: getResumeList is using mock data.');
   const mockResumes: ResumeInfo[] = [
     {
       id: 'resume1', student_id: '1', title: '我的默认在线简历', is_default: true,
       name: 'Mock 学生', phone: '138...000', email: 'student@example.com',
       education_experiences: [{ school: '示例大学', major: '计算机', degree: '本科', start_date: '2020-09', end_date: '2024-07' }],
       update_time: new Date().toISOString(),
     },
     {
       id: 'resume2', student_id: '1', title: '求职Java后端-附件简历',
       file_url: '/uploads/resume_java.pdf', file_name: '张三_Java后端.pdf',
       upload_time: '2024-01-10T08:00:00Z',
       update_time: '2024-01-10T08:00:00Z',
     }
   ];
   return new Promise((resolve) => {
     setTimeout(() => {
       resolve({ data: mockResumes });
     }, 200);
   });
   // ---- Mock Data End ----
}

// 获取单个简历详情
export function getResumeDetail(id: string | number): Promise<{ data: ResumeInfo }> {
  // return request({
  //   url: `/api/student/resumes/${id}`,
  //   method: 'get',
  // });
  // ---- Mock Data Start ----
  console.warn('API MOCK: getResumeDetail is using mock data.');
  const mockDetail: ResumeInfo = {
      id: id,
      student_id: '1',
      title: `简历详情 (${id})`,
      is_default: id === 'resume1',
      name: 'Mock 学生',
      phone: '13800138000',
      email: 'student@example.com',
      avatar: 'https://via.placeholder.com/150/0000FF/808080?text=Student',
      education_experiences: [
          { id: 'edu1', school: '示例大学', major: '计算机科学', degree: '学士', start_date: '2020-09', end_date: '2024-07', description: '获得过奖学金' }
      ],
      work_experiences: [
          { id: 'work1', company_name: '示例实习公司', position: '前端开发实习生', start_date: '2023-07', end_date: '2023-09', description: '参与XX项目开发，使用Vue...' }
      ],
      project_experiences: [
          { id: 'proj1', project_name: '个人博客系统', role: '独立开发', start_date: '2023-01', end_date: '2023-03', description: '基于Vue+Node.js开发...', project_link: 'https://github.com/example' }
      ],
      skills_description: '熟练掌握 HTML, CSS, JavaScript, TypeScript\n熟悉 Vue.js, React.js 框架\n了解 Node.js, MySQL',
      self_evaluation: '学习能力强，对新技术有热情，具备良好的沟通和团队协作能力。',
      update_time: new Date().toISOString(),
  };
    if (id === 'resume2') { // 模拟附件简历
      mockDetail.file_url = '/uploads/resume_java.pdf';
      mockDetail.file_name = '张三_Java后端.pdf';
      mockDetail.upload_time = '2024-01-10T08:00:00Z';
      // 清空在线内容
      mockDetail.education_experiences = [];
      mockDetail.work_experiences = [];
      mockDetail.project_experiences = [];
      mockDetail.skills_description = '';
      mockDetail.self_evaluation = '';
    }
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockDetail });
    }, 400);
  });
  // ---- Mock Data End ----
}

// 创建在线简历
// TODO: 参数类型可以更精确
export function createResume(data: Partial<ResumeInfo>) {
  return request({
    url: '/api/student/resumes',
    method: 'post',
    data, // 只包含在线简历内容，不含附件信息
  });
}

// 更新在线简历
export function updateResume(id: string | number, data: Partial<ResumeInfo>) {
  return request({
    url: `/api/student/resumes/${id}`,
    method: 'put',
    data,
  });
}

// 删除简历
export function deleteResume(id: string | number) {
  return request({
    url: `/api/student/resumes/${id}`,
    method: 'delete',
  });
}

// 设置默认简历
export function setDefaultResume(id: string | number) {
  return request({
    url: `/api/student/resumes/${id}/default`,
    method: 'post',
  });
}

// 上传附件简历
// 通常需要使用 FormData
export function uploadResumeFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return request({
    url: '/api/student/resumes/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // 可能需要监听上传进度
    // onUploadProgress: progressEvent => { ... }
  });
}
