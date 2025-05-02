import request from '@/utils/request';
import type { StudentProfileCamel, EducationExperienceCamel, WorkExperienceCamel } from '@/types/student';

/**
 * 获取当前登录学生的详细信息
 * @returns 学生详细信息
 */
export function getStudentProfile(): Promise<{ data: StudentProfileCamel }> {
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
  return request({
    url: '/api/students/me',
    method: 'get',
  });
}

/**
 * 更新学生详细信息
 * @param data 学生信息
 * @returns 更新结果
 */
export function updateStudentProfile(data: Partial<StudentProfileCamel> | any) {
  console.log('API: 正在更新学生档案，数据:', data);

  // 提取教育经历和工作经历，确保是数组而不是字符串
  let educationExperiences = [];
  if (data.educationExperiences) {
    if (Array.isArray(data.educationExperiences)) {
      educationExperiences = data.educationExperiences;
    } else if (typeof data.educationExperiences === 'string') {
      try {
        // 如果是空字符串或"[]"，则设置为空数组
        if (data.educationExperiences === '' || data.educationExperiences === '[]') {
          educationExperiences = [];
        } else {
          educationExperiences = JSON.parse(data.educationExperiences);
        }
      } catch (e) {
        console.error('Failed to parse educationExperiences:', e);
        educationExperiences = []; // 解析失败时设置为空数组
      }
    }
  }

  let workExperiences = [];
  if (data.workExperiences) {
    if (Array.isArray(data.workExperiences)) {
      workExperiences = data.workExperiences;
    } else if (typeof data.workExperiences === 'string') {
      try {
        // 如果是空字符串或"[]"，则设置为空数组
        if (data.workExperiences === '' || data.workExperiences === '[]') {
          workExperiences = [];
        } else {
          workExperiences = JSON.parse(data.workExperiences);
        }
      } catch (e) {
        console.error('Failed to parse workExperiences:', e);
        workExperiences = []; // 解析失败时设置为空数组
      }
    }
  }

  // 直接使用驼峰命名字段，与后端保持一致
  const completeData = {
    // 确保这些字段存在，如果不存在则使用默认值
    studentNumber: data.studentNumber || '', // 学号字段
    realName: data.realName || '未填写',
    gender: data.gender || '保密',
    age: data.age || 20,
    phone: data.phone || '',
    school: data.school || '未填写',
    major: data.major || '未填写',
    education: data.education || '本科',
    graduationYear: data.graduationYear || new Date().getFullYear() + 1,
    skills: data.skills && Array.isArray(data.skills) ?
      (data.skills.length > 0 ? data.skills : ['暂无技能']) :
      ['暂无技能'],
    introduction: data.introduction || '暂无介绍',
    avatar: data.avatar || '',
    // 添加期望薪资和期望工作地点字段
    expectedSalary: data.expectedSalary || '面议',
    expectedLocation: data.expectedLocation || '全国',
    // 添加教育经历和工作经历 - 确保正确传递
    educationExperiences: educationExperiences,
    workExperiences: workExperiences
  };

  console.log('API: 完整的更新数据:', completeData);
  console.log('API: 教育经历:', completeData.educationExperiences);
  console.log('API: 教育经历类型:', Array.isArray(completeData.educationExperiences) ? 'Array' : typeof completeData.educationExperiences);
  console.log('API: 工作经历:', completeData.workExperiences);
  console.log('API: 工作经历类型:', Array.isArray(completeData.workExperiences) ? 'Array' : typeof completeData.workExperiences);

  // 调用后端API
  return request({
    url: '/api/students/me',
    method: 'put',
    // 直接发送数据，不再将数组转换为JSON字符串
    data: completeData
  }).then(response => {
    console.log('API: 更新学生档案响应:', response);
    return response;
  }).catch(error => {
    console.error('API: 更新学生档案错误:', error);
    throw error;
  });
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
}