import request from '@/utils/request';
import type { StudentProfile } from '@/types/student';

/**
 * 获取当前登录学生的详细信息
 * @returns 学生详细信息
 */
export function getStudentProfile(): Promise<{ data: StudentProfile }> {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: getStudentProfile is using mock data.');
  //
  // // 模拟学生数据
  // const mockStudentProfile: StudentProfile = {
  //   id: 1,
  //   username: '黄星豪',
  //   user_type: 'student',
  //   status: 'active',
  //   phone: '13800138000',
  //   email: '1051992437@qq.com',
  //   student_id: '2020123456',
  //   school: '重庆理工大学',
  //   major: '计算机科学与技术',
  //   grade: '大四',
  //   education: '本科',
  //   skills: ['JavaScript', 'TypeScript', 'Vue', 'React', 'Node.js'],
  //   expected_salary: '10k-15k',
  //   expected_location: '重庆',
  //   bio: '热爱编程，对Web开发和人工智能有浓厚兴趣',
  //   create_time: new Date().toISOString(),
  //   last_login_time: new Date().toISOString()
  // };
  //
  // // 返回模拟响应
  // return Promise.resolve({
  //   data: mockStudentProfile
  // });

  // 当后端API实现后，取消注释下面的代码
  // /*
  return request({
    url: '/api/students/me',
    method: 'get',
  });
  // */
}

/**
 * 更新学生详细信息
 * @param data 学生信息
 * @returns 更新结果
 */
export function updateStudentProfile(data: Partial<StudentProfile>) {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: updateStudentProfile is using mock data.');
  //
  // // 返回模拟响应
  // return Promise.resolve({
  //   data: {
  //     success: true,
  //     message: '更新成功'
  //   }
  // });

  // 当后端API实现后，取消注释下面的代码
  // /*
  return request({
    url: '/api/students/me',
    method: 'put',
    data,
  });
  // */
}

/**
 * 上传学生头像
 * @param file 头像文件
 * @returns 上传结果
 */
export function uploadStudentAvatar(file: File) {
  // // 使用模拟数据，当后端API未实现时使用
  // console.log('API MOCK: uploadStudentAvatar is using mock data.');
  //
  // // 返回模拟响应
  // return Promise.resolve({
  //   data: {
  //     url: 'https://via.placeholder.com/150',
  //     message: '上传成功'
  //   }
  // });

  // 当后端API实现后，取消注释下面的代码
  // /*
  const formData = new FormData();
  formData.append('file', file);

  return request({
    url: '/api/files/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  // */
}