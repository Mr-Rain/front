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
        email: 'student@example.com',
        phone: '13800138000',
        avatar: 'https://via.placeholder.com/150/0000FF/808080?text=Student',
        student_id: '20230001',
        major: '计算机科学与技术',
        grade: '2023',
        school: '示例大学',
        education: '本科',
        skills: ['Vue', 'TypeScript', 'Pinia', 'Node.js'],
        experience: '曾在示例公司实习三个月，负责前端开发工作。',
        expected_salary: '10k-15k',
        expected_location: '上海',
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