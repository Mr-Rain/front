import request from '@/utils/request';
import type { StudentProfile } from '@/types/student';

// 获取当前登录学生的信息
export function getStudentProfile(): Promise<{ data: StudentProfile }> {
  // return request({
  //   url: '/api/student/profile',
  //   method: 'get',
  // });
  // ---- Mock Data Start ----
  console.warn('API MOCK: getStudentProfile is using mock data.');
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockProfile: StudentProfile = {
        id: '1', // 应该与 UserInfo id 一致
        username: 'mockStudent',
        user_type: 'student',
        status: 'active',
        email: 'student@example.com',
        phone: '13800138000',
        avatar: '',
        student_id: '20230001',
        major: '计算机科学与技术',
        grade: '2023',
        school: '示例大学',
        education: '本科',
        skills: ['Vue', 'TypeScript', 'Pinia', 'Node.js'],
        experience: '曾在示例公司实习三个月，负责前端开发工作。',
        expected_salary: '10k-15k',
        expected_location: '上海',
        bio: '我是一名热爱前端开发的大学生，对新技术充满热情，善于学习和应用新知识。',
        education_experiences: [
          {
            id: 'edu1',
            school: '示例大学',
            major: '计算机科学与技术',
            degree: '本科',
            start_date: '2020-09',
            end_date: '2024-07',
            description: '主修课程：数据结构、算法、计算机网络、操作系统、数据库系统等'
          }
        ],
        work_experiences: [
          {
            id: 'work1',
            company_name: 'ABC科技有限公司',
            position: '前端开发实习生',
            start_date: '2023-07',
            end_date: '2023-09',
            description: '- 参与公司内部管理系统的前端开发\n- 使用Vue.js框架进行组件开发\n- 与后端团队协作，实现数据展示和交互功能'
          }
        ]
      };
      resolve({ data: mockProfile });
    }, 300);
  });
  // ---- Mock Data End ----
}

// 更新学生信息
// TODO: 参数类型可以更精确，例如 Omit<StudentProfile, 'id' | 'username' | 'user_type'>
export function updateStudentProfile(data: Partial<StudentProfile>) {
  return request({
    url: '/api/student/profile',
    method: 'put',
    data,
  });
}