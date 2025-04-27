import type { UserInfo } from './user';

/**
 * 教育经历接口
 */
export interface EducationExperience {
  id?: string | number; // 可选，用于更新
  school: string; // 学校名称
  major: string; // 专业
  degree: string; // 学位 (例如: 学士, 硕士)
  start_date: string; // 开始时间 YYYY-MM
  end_date: string; // 结束时间 YYYY-MM 或 '至今'
  description?: string; // 在校经历描述
}

/**
 * 工作/实习经历接口
 */
export interface WorkExperience {
  id?: string | number; // 可选，用于更新
  company_name: string; // 公司名称
  position: string; // 职位
  start_date: string; // 开始时间 YYYY-MM
  end_date: string; // 结束时间 YYYY-MM 或 '至今'
  description: string; // 工作内容描述 (Markdown格式)
}

/**
 * 学生详细信息接口
 * 与后端 StudentDTO 保持一致
 */
export interface StudentProfile extends UserInfo {
  user_type: 'student'; // 明确用户类型为学生

  // 基本信息 (来自 users 表)
  username: string;
  email?: string;
  status: string;
  create_time?: string;
  last_login_time?: string;

  // 学生特有信息 (来自 students 表)
  real_name?: string | null; // 真实姓名
  gender?: string | null; // 性别
  age?: number | null; // 年龄
  phone?: string | null; // 手机号
  school?: string | null; // 学校
  major?: string | null; // 专业
  education?: string | null; // 学历
  graduation_year?: number | null; // 毕业年份
  skills?: string[] | null; // 技能标签
  introduction?: string | null; // 个人介绍
  avatar?: string | null; // 头像URL

  // 扩展信息 (前端特有，可能不在后端)
  student_id?: string; // 学号
  grade?: string; // 年级
  experience?: string; // 实习或项目经历
  expected_salary?: string; // 期望薪资
  expected_location?: string; // 期望工作地点
  education_experiences?: EducationExperience[]; // 教育经历
  work_experiences?: WorkExperience[]; // 工作/实习经历
  bio?: string; // 个人简介
}